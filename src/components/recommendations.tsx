import { useState } from "react";
import type { AssessmentResult } from "@/domain/assessment";
import { recommend } from "@/core/recommendations";
import { CONTINUITY_LABELS } from "@/core/recommendation-types";
import { RECOMMENDATION_CATALOG } from "@/data/recommendation-catalog";
import { Card, SectionHeading } from "./ui";

const slotLabels={audiovisual:"Para assistir","comic-1":"Para ler · HQ 1","comic-2":"Para ler · HQ 2",alternative:"Outra perspectiva"};
const mediaLabels={movie:"Filme",series:"Série",comic:"HQ"};
export function Recommendations({result}:{result:AssessmentResult}) {
 const [includeSpoilers,setIncludeSpoilers]=useState(false);
 return <section className="result-section" aria-label="Explore sua personalidade no universo Marvel">
  <SectionHeading number="05" title="Explore sua personalidade no universo Marvel">Histórias para observar os traços que aproximam seu perfil do personagem.</SectionHeading>
  <p className="note">As relações entre histórias e eixos são interpretações editoriais rastreáveis. Filmes e séries são adaptações: não substituem a continuidade Terra-616 do quiz. A leitura ou exibição completa pode exigir compra ou assinatura.</p>
  <label className="spoiler-control"><input type="checkbox" checked={includeSpoilers} onChange={event=>setIncludeSpoilers(event.target.checked)}/> Incluir recomendações com spoilers importantes (inclusive identidade de antagonistas)</label>
  {result.matches.map(match=>{
   const selection=recommend(result,match.character.id,RECOMMENDATION_CATALOG,{includeSpoilers});
   const selected=selection.slots.filter(slot=>slot.recommendation);
   return <div className="character-recommendations" key={match.character.id} data-testid={"recommendations-"+match.character.id}>
    <h3>Histórias de {match.character.name}</h3><p className="note">{selection.notice}</p>
    <div className="recommendation-grid">{selected.map(slot=>{
     const item=slot.recommendation!,work=item.work;
     const majorSpoilers=work.spoilers==="major" || item.reasons.some(r=>r.evidence.spoilers==="major");
     return <Card className="recommendation-card" key={work.id} data-work-id={work.id}>
      <p className="eyebrow">{slotLabels[slot.kind]}</p><div className="recommendation-badges"><span className="badge">{mediaLabels[work.type]} · {work.year}</span><span className="badge badge--gold">{majorSpoilers ? "Spoilers importantes" : work.spoilers==="premise" ? "Spoilers de premissa" : "Sem spoilers"}</span></div>
      <h4>{work.title}</h4><p className="note">{CONTINUITY_LABELS[work.continuity]}</p><p className="note">{work.reference}</p>
      <div className="recommendation-traits">{[...new Set(item.reasons.map(r=>r.axisLabel))].map(label=><span className="badge" key={label}>{label}</span>)}</div>
      <details><summary>Por que esta história combina com seu perfil?</summary>{item.reasons.map(reason=><div className="recommendation-reason" key={reason.evidence.id}><p className="note">{reason.explanation}</p><p className="note">Referência: {reason.evidence.locator}</p><ul>{reason.evidence.sourceIds.map(id=>{const source=RECOMMENDATION_CATALOG.sources.find(s=>s.id===id)!;return <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher}: {source.title} (nova aba)</a><span className="note"> · {source.kind==="secondary-analysis" ? "fonte secundária" : "fonte oficial"} · conferida em {source.checkedOn}</span></li>;})}</ul></div>)}</details>
      {work.links.filter(link=>link.official).slice(0,1).map(link=><a className="button button--secondary recommendation-link" key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">Abrir referência oficial da obra <span aria-hidden="true">↗</span><span className="sr-only"> (nova aba)</span></a>)}
      <p className="note">Revisão de fonte: {work.review==="source-verified" ? "conferida" : "pendente"}. A interpretação dos eixos é do HeroAxes.</p>
     </Card>;
    })}</div>
    {selection.slots.some(slot=>slot.fallback) && <details className="technical-details" open={!selected.length}><summary>{selected.length ? "Espaços sem indicação suficiente" : "Curadoria: por que não há indicações?"}</summary>{selection.slots.filter(slot=>slot.fallback).map(slot=><p className="note" key={slot.kind}><b>{slotLabels[slot.kind]}:</b> {slot.fallback}</p>)}</details>}
   </div>;
  })}
  <p className="note">Curadoria {RECOMMENDATION_CATALOG.version}. Recomendações são calculadas à parte e não modificam o resultado salvo.</p>
 </section>;
}
