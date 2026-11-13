import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerServerTestLoader } from "../scripts/register-server-test-loader.mjs";
import { RECOMMENDATION_CATALOG } from "../src/data/recommendation-catalog.ts";
const hook=registerServerTestLoader();
const {tmdbMetadata,comicMetadata}=await import("../src/server/metadata.ts");
hook.deregister();
const base=RECOMMENDATION_CATALOG.works[0];
const movie={...base,type:"movie" as const,externalIds:{tmdb:123}};
const comic={...base,externalIds:{isbn:"9780140328721"}}; // API documentation ISBN, test fixture only.
const environment={EXTERNAL_METADATA_ENABLED:"true",TMDB_TERMS_ACKNOWLEDGED:"true",TMDB_READ_TOKEN:"test-secret",OPEN_LIBRARY_TERMS_ACKNOWLEDGED:"true",OPEN_LIBRARY_CONTACT:"editor@example.org"};
test("adaptadores ficam desligados e sem rede quando faltam configuração, consentimento de termos ou IDs",async()=>{
 const fetcher:typeof fetch=async()=>{throw Error("Não deveria chamar a rede");};
 assert.equal(await tmdbMetadata(movie,{environment:{},fetcher}),null);
 assert.equal(await tmdbMetadata(base,{environment,fetcher}),null);
 assert.equal(await tmdbMetadata(movie,{environment:{...environment,TMDB_TERMS_ACKNOWLEDGED:"false"},fetcher}),null);
 assert.equal(await comicMetadata(comic,{environment:{},fetcher}),null);
 assert.equal(await comicMetadata({...comic,externalIds:{isbn:"../../secret"}},{environment,fetcher}),null);
 assert.equal(await comicMetadata(comic,{environment:{...environment,OPEN_LIBRARY_CONTACT:undefined},fetcher}),null);
});
test("TMDB usa token no header, host fixo e retorna apenas metadados sem texto editorial ou imagens",async()=>{
 let called=false;
 const fetcher:typeof fetch=async(input,init)=>{
  called=true;assert.equal(String(input),"https://api.themoviedb.org/3/movie/123?language=pt-BR");
  assert.equal(new Headers(init?.headers).get("Authorization"),"Bearer test-secret");
  assert.equal(init?.redirect,"error");assert.ok(init?.signal);
  return Response.json({id:123,title:"Título de teste",release_date:"2000-01-02",poster_path:"/protected.jpg",overview:"Não usar como evidência",api_key:"never-return"});
 };
 const raw=JSON.stringify(base),metadata=await tmdbMetadata(movie,{environment,fetcher});
 assert.ok(called);assert.equal(metadata!.title,"Título de teste");
 for(const forbidden of ["test-secret","poster_path","overview","api_key","rationale"])assert.ok(!JSON.stringify(metadata).includes(forbidden));
 assert.equal(JSON.stringify(base),raw);
});
test("séries usam namespace tv; indisponibilidade, JSON inválido e ID trocado retornam null",async()=>{
 const series={...movie,type:"series" as const};
 const fetcher:typeof fetch=async(input)=>{
  assert.ok(String(input).includes("/tv/123?"));return Response.json({id:123,name:"Série de teste",first_air_date:"2021-01-01"});
 };
 assert.equal((await tmdbMetadata(series,{environment,fetcher}))!.title,"Série de teste");
 const failures:Array<typeof fetch>=[async()=>new Response("limited",{status:429}),async()=>new Response("not json"),async()=>Response.json({id:999,title:"wrong"}),async()=>{throw new DOMException("timeout","TimeoutError");}];
 for(const failing of failures)assert.equal(await tmdbMetadata(movie,{environment,fetcher:failing}),null);
});
test("metadados de HQ usam ISBN de edição, identificação e atribuição sem incorporar capas ou narrativa",async()=>{
 const fetcher:typeof fetch=async(input,init)=>{
  assert.equal(String(input),"https://openlibrary.org/api/books?bibkeys=ISBN:9780140328721&jscmd=data&format=json");
  assert.match(new Headers(init?.headers).get("User-Agent")!,/HeroAxes/);
  return Response.json({"ISBN:9780140328721":{title:"Edição de teste",publish_date:"1988",cover:{large:"https://image.invalid/a"},url:"https://evil.invalid"}});
 };
 const metadata=await comicMetadata(comic,{environment,fetcher});
 assert.equal(metadata!.sourceUrl,"https://openlibrary.org/isbn/9780140328721");
 assert.equal(metadata!.title,"Edição de teste");assert.match(metadata!.attribution,/Open Library/);
 assert.ok(!JSON.stringify(metadata).includes("cover"));
});
test("fronteira server-only permanece e aplicação não importa adaptadores",()=>{
 const server=readFileSync(new URL("../src/server/metadata.ts",import.meta.url),"utf8");
 assert.ok(server.includes('import "server-only"'));
 assert.ok(!server.includes("NEXT_PUBLIC_"));
 for(const file of ["src/app/page.tsx","src/components/results.tsx","src/components/recommendations.tsx","src/core/recommendations.ts"]){
  const content=readFileSync(new URL("../"+file,import.meta.url),"utf8");
  assert.ok(!content.includes("server/metadata"));assert.ok(!content.includes("TMDB_READ_TOKEN"));
 }
});
