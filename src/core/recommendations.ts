import { assertProfile } from "../domain/axes.ts";
import { compatibility, type AssessmentResult } from "../domain/assessment.ts";
import type { CharacterId } from "../domain/catalog.ts";
import type { RecommendationCatalog, TraitEvidence, Work } from "./recommendation-types.ts";

export const RECOMMENDATION_VERSION="shared-evidence-1.0.0";
export const MAX_SHARED_DISTANCE=15;
const lexical=(a:string,b:string)=>a<b ? -1 : a>b ? 1 : 0;
const roleWeight={lead:1,"co-lead":1,antagonist:1,supporting:.75,cameo:0};
export type Recommendation = {
 work: Work; score:number;
 reasons: {evidence:TraitEvidence; axisLabel:string; userValue:number; characterValue:number;
  weightedError:number; evidenceQuality:number; explanation:string}[];
};
type Slot = {kind:"audiovisual"|"comic-1"|"comic-2"|"alternative"; recommendation:Recommendation|null; fallback:string|null};
export function recommend(result:AssessmentResult,characterId:CharacterId,catalog:RecommendationCatalog,options:{includeSpoilers?:boolean}={}) {
 const slots:Slot[]=[];
 const empty=(reason:string)=>({engineVersion:RECOMMENDATION_VERSION,catalogVersion:catalog.version,characterId,sharedAxes:[],slots:(["audiovisual","comic-1","comic-2","alternative"] as const).map(kind=>({kind,recommendation:null,fallback:reason})),notice:reason});
 const model=catalog.supportedModels.some(v=>v.algorithm===result.versions.algorithm && v.questionnaire===result.versions.questionnaire && v.catalog===result.versions.catalog);
 if(!model)return empty("Este resultado usa uma versão ainda não revisada para recomendações. Seu resultado original foi preservado.");
 const character=result.definition.catalog.find(c=>c.id===characterId);
 if(!character)return empty("Personagem ausente do catálogo armazenado neste resultado.");
 assertProfile(result.profile);
 compatibility(result.profile,character.profile,result.weights);
 const total=result.definition.axes.reduce((s,a)=>s+result.weights[a.id],0);
 const sharedAxes=result.definition.axes.flatMap((axis,order)=>{
  const userValue=result.profile[axis.id],characterValue=character.profile[axis.id];
  const userPole=userValue<40 ? "low" : userValue>60 ? "high" : null;
  const characterPole=characterValue<40 ? "low" : characterValue>60 ? "high" : null;
  const distance=Math.abs(userValue-characterValue);
  return userPole && userPole===characterPole && distance<=MAX_SHARED_DISTANCE ? [{id:axis.id,label:axis.label,pole:userPole,userValue,characterValue,distance,weightedError:result.weights[axis.id]*distance**2/total,order}] : [];
 }).sort((a,b)=>a.weightedError-b.weightedError || a.order-b.order);
 const sources=new Map(catalog.sources.map(s=>[s.id,s]));
 const validSource=(id:string)=>{const s=sources.get(id);return s && /^https:\/\//.test(s.url);};
 const candidates:Recommendation[]=[];
 for(const work of [...catalog.works].sort((a,b)=>lexical(a.id,b.id))){
  if(work.review!=="source-verified" || !work.sources.length || !work.sources.every(validSource) || (!options.includeSpoilers && work.spoilers==="major"))continue;
  const participant=work.participants.find(p=>p.characterId===characterId && p.role!=="cameo" && p.sourceIds.length && p.sourceIds.every(validSource));
  if(!participant)continue;
  const reasons:Recommendation["reasons"]=[];
  for(const evidence of catalog.evidence.filter(e=>e.workId===work.id && e.characterId===characterId).sort((a,b)=>lexical(a.id,b.id))){
   const axis=sharedAxes.find(a=>a.id===evidence.axis && a.pole===evidence.pole);
   if(!axis || evidence.review!=="source-verified" || !evidence.sourceIds.length || !evidence.sourceIds.every(validSource) || !evidence.manifestation.trim() || !evidence.rationale.trim() || !evidence.locator.trim() || (!options.includeSpoilers && evidence.spoilers==="major"))continue;
   const quality=Math.min(...evidence.sourceIds.map(id=>sources.get(id)!.kind==="secondary-analysis" ? .75 : 1));
   const pole=evidence.pole==="high" ? result.definition.axes.find(a=>a.id===axis.id)!.high : result.definition.axes.find(a=>a.id===axis.id)!.low;
   reasons.push({evidence,axisLabel:axis.label,userValue:axis.userValue,characterValue:axis.characterValue,weightedError:axis.weightedError,evidenceQuality:quality,
    explanation:`${axis.label}: você ${axis.userValue.toFixed(1)}/100 e ${character.name} ${axis.characterValue.toFixed(1)}/100, próximos no polo “${pole}”. Nesta obra: ${evidence.manifestation} Leitura editorial HeroAxes: ${evidence.rationale}`});
  }
  // One contribution per axis: repeated editorial entries cannot inflate relevance.
  const perAxis=new Map<string,number>();
  for(const r of reasons){const affinity=(1-Math.abs(r.userValue-r.characterValue)/100)**2;
   perAxis.set(r.evidence.axis,Math.max(perAxis.get(r.evidence.axis)??0,100*result.weights[r.evidence.axis]/total*affinity*r.evidenceQuality*roleWeight[participant.role]));}
  if(reasons.length)candidates.push({work,score:[...perAxis.values()].reduce((a,b)=>a+b,0),reasons});
 }
 const usedStories=new Set<string>(),usedAxes=new Set<string>();
 function pick(kind:Slot["kind"],accept:(w:Work)=>boolean){
  const remaining=candidates.filter(c=>!usedStories.has(c.work.storyKey) && accept(c.work));
  const diversity=(c:Recommendation)=>new Set(c.reasons.map(r=>r.evidence.axis).filter(a=>!usedAxes.has(a))).size*5;
  remaining.sort((a,b)=>(b.score+diversity(b))-(a.score+diversity(a)) || lexical(a.work.id,b.work.id));
  const chosen=remaining[0]??null;
  if(chosen){usedStories.add(chosen.work.storyKey);chosen.reasons.forEach(r=>usedAxes.add(r.evidence.axis));}
  slots.push({kind,recommendation:chosen,fallback:chosen ? null : "Sem referência revisada suficiente para este espaço, considerando seus traços compartilhados e o filtro de spoilers. Curadoria pendente; nenhuma obra foi inserida apenas por aparição."});
 }
 pick("audiovisual",w=>w.type==="movie"||w.type==="series");
 pick("comic-1",w=>w.type==="comic");pick("comic-2",w=>w.type==="comic");pick("alternative",()=>true);
 return {engineVersion:RECOMMENDATION_VERSION,catalogVersion:catalog.version,characterId,sharedAxes,slots,
  notice:sharedAxes.length ? "Sugestões editoriais por proximidade de traços; não medem certeza psicológica. Adaptações não alteram o perfil Terra-616 do quiz." : "Não há polos específicos suficientemente próximos para justificar recomendações por traço. Compatibilidade global não garante um atributo compartilhado; o resultado do quiz permanece válido."};
}
