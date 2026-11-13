import "server-only";
import type { Work } from "../core/recommendation-types.ts";

// Deliberately not imported by the quiz or recommendation engine. No public route.
export type ExternalMetadata={
 provider:"tmdb"|"open-library"; externalId:string; title:string; releaseDate:string|null;
 attribution:string; sourceUrl:string;
};
type Environment=Readonly<Record<string,string|undefined>>;
type Dependencies={fetcher?:typeof fetch;environment?:Environment};
const text=(v:unknown)=>typeof v==="string" && v.trim().length>0 && v.length<=1000 ? v : null;
const record=(v:unknown):v is Record<string,unknown>=>!!v && typeof v==="object" && !Array.isArray(v);
async function request(url:string,headers:Record<string,string>,fetcher:typeof fetch){
 try{
  const response=await fetcher(url,{headers,signal:AbortSignal.timeout(4000),redirect:"error",cache:"force-cache"});
  if(!response.ok)return null;
  if(Number(response.headers.get("content-length"))>100_000)return null;
  const raw=await response.text();if(raw.length>100_000)return null;
  const data:unknown=JSON.parse(raw);return record(data) ? data : null;
 }catch{return null;}
}
export async function tmdbMetadata(work:Work,dependencies:Dependencies={}):Promise<ExternalMetadata|null>{
 const environment=dependencies.environment??process.env,fetcher=dependencies.fetcher??fetch;
 if(environment.EXTERNAL_METADATA_ENABLED!=="true" || environment.TMDB_TERMS_ACKNOWLEDGED!=="true")return null;
 const token=environment.TMDB_READ_TOKEN,id=work.externalIds.tmdb;
 if(!token || !Number.isSafeInteger(id) || (id??0)<=0 || !["movie","series"].includes(work.type))return null;
 const namespace=work.type==="movie" ? "movie" : "tv";
 const data=await request(`https://api.themoviedb.org/3/${namespace}/${id}?language=pt-BR`,{Authorization:`Bearer ${token}`,Accept:"application/json"},fetcher);
 if(!data || data.id!==id)return null;
 const title=text(data[work.type==="movie" ? "title" : "name"]);if(!title)return null;
 const date=text(data[work.type==="movie" ? "release_date" : "first_air_date"]);
 return {provider:"tmdb",externalId:String(id),title,releaseDate:date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
  attribution:"This product uses the TMDB API but is not endorsed or certified by TMDB.",sourceUrl:`https://www.themoviedb.org/${namespace}/${id}`};
}
export async function comicMetadata(work:Work,dependencies:Dependencies={}):Promise<ExternalMetadata|null>{
 const environment=dependencies.environment??process.env,fetcher=dependencies.fetcher??fetch;
 if(environment.EXTERNAL_METADATA_ENABLED!=="true" || environment.OPEN_LIBRARY_TERMS_ACKNOWLEDGED!=="true")return null;
 // ISBN belongs to a collected edition. Do not infer an issue number or continuity from it.
 const isbn=work.externalIds.isbn,contact=environment.OPEN_LIBRARY_CONTACT;
 if(work.type!=="comic" || !isbn || !/^(?:\d{9}[\dX]|\d{13})$/.test(isbn) || !contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))return null;
 const data=await request(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,{"User-Agent":`HeroAxes/1.0 (${contact})`,Accept:"application/json"},fetcher);
 const item=data?.[`ISBN:${isbn}`];if(!record(item))return null;
 const title=text(item.title);if(!title)return null;
 return {provider:"open-library",externalId:isbn,title,releaseDate:text(item.publish_date),attribution:"Metadados bibliográficos: Open Library / Internet Archive.",sourceUrl:`https://openlibrary.org/isbn/${isbn}`};
}
