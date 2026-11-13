import type { Ref } from "react";
import { resultAxisRows, type AssessmentResult } from "@/domain/assessment";
import { interpretResult } from "@/domain/interpretation";
import { matchingDiagnostics } from "@/domain/result-diagnostics";
import { Card, CharacterPortrait, ResultStat, SectionHeading } from "./ui";
import { Recommendations } from "./recommendations";

export function Results({result,heading}:{result:AssessmentResult;heading:Ref<HTMLHeadingElement>}) {
 const interpretation=interpretResult(result), diagnostic=matchingDiagnostics(result);
 return <>
  <div className="result-intro"><p className="eyebrow">SEU RESULTADO · {result.mode === "quick" ? "16" : "40"} ESCOLHAS</p><h1 ref={heading} tabIndex={-1} id="quiz-title">Seu perfil se aproxima de:<br/><em>{result.matches.map(m=>m.character.name).join(" + ")}</em></h1></div>
  {result.matches.length>1 && <p className="callout">Empate matemático: todos os perfis de maior compatibilidade estão apresentados.</p>}
  <div className="winner-list">{result.matches.map(match=><Card className="winner-card" key={match.character.id} data-testid={"winner-"+match.character.id}>
   <CharacterPortrait name={match.character.name}/><div className="winner-content"><span className="badge">{match.character.classification} · Terra-616</span><h2>{match.character.name}</h2><p>{match.character.editorialNote}</p><ResultStat label="Compatibilidade matemática" value={match.compatibility.toFixed(1)+"%"}/></div>
  </Card>)}</div>
  <p className="note result-disclaimer">Compatibilidade é proximidade entre perfis, não probabilidade de você ser o personagem. Experiência recreativa, sem julgamento moral.</p>
  {diagnostic.outside.length>0 && <p className="callout">Seu perfil está fora da faixa representada pelo catálogo em: {diagnostic.outside.map(a=>a.label).join(", ")}. O resultado é o mais próximo entre estes 24 personagens; pode ainda diferir de você em aspectos importantes.</p>}
  {diagnostic.closeMatch && <p className="callout">Os dois primeiros perfis estão separados por até 1 ponto de compatibilidade. Pequenas mudanças nas respostas podem trocar a ordem; isso não mede confiança estatística.</p>}
  <section aria-label="Compatibilidade por classificação" className="result-section"><SectionHeading number="01" title="Três lados do seu universo">O melhor encontro em cada classificação editorial.</SectionHeading>
   <div className="category-grid">{interpretation.categories.map(category=><Card className="category-card" key={category.classification}><span className="badge">{category.classification}</span>{category.matches.map(m=><div className="category-match" key={m.character.id}><CharacterPortrait name={m.character.name} compact/><h3>{m.character.name}</h3><p className="category-percent">{m.compatibility.toFixed(1)}% <span>de compatibilidade</span></p></div>)}{!category.matches.length && <p>Sem personagem nesta classificação.</p>}</Card>)}</div>
   <p className="note">As classificações são os recortes editoriais do catálogo; não representam valor moral do participante.</p>
  </section>
  <section aria-label="Interpretação da compatibilidade" className="result-section"><SectionHeading number="02" title="Por que este resultado?">O que aproxima vocês — e onde os perfis seguem caminhos diferentes.</SectionHeading>
   <p className="note">Os eixos são ordenados pela contribuição à distância ponderada; empates seguem a ordem dos oito eixos. Semelhança é relativa aos demais eixos e pode ainda envolver diferenças. Em caso de empate geral, esta análise detalha {interpretation.primary.character.name}, primeiro na ordem de exibição.</p>
   <div className="interpretation-grid"><Card className="explanation-card"><span className="eyebrow">PONTOS DE ENCONTRO</span><h3>Três maiores semelhanças</h3>{interpretation.primary.similarities.map((axis,i)=><div className="explanation" key={axis.id}><span className="explanation-index">0{i+1}</span><div><h4>{axis.label}</h4><p className="note">{axis.explanation}</p></div></div>)}</Card>
    <Card className="explanation-card differences"><span className="eyebrow">CAMINHOS DIFERENTES</span><h3>Duas maiores divergências</h3>{interpretation.primary.differences.map((axis,i)=><div className="explanation" key={axis.id}><span className="explanation-index">0{i+1}</span><div><h4>{axis.label}</h4><p className="note">{axis.explanation}</p></div></div>)}</Card></div>
   {interpretation.comparison && <details className="technical-details"><summary>Comparação com o segundo colocado</summary><p className="note">{interpretation.comparison.explanation}</p></details>}
  </section>
  <section className="result-section" aria-label="Comparação dos oito eixos"><SectionHeading number="03" title="Seu perfil, eixo por eixo">A mesma escala de 0 a 100. Valores altos não são necessariamente melhores.</SectionHeading><div className="chart-legend"><span><i/> Seu perfil</span><span><i/> Personagem</span></div>
   <div className="scores">{resultAxisRows(result).map(axis=><Card className="axis-card" key={axis.id} data-testid={"axis-"+axis.id}><div className="score-label"><h3>{axis.label}</h3><strong>{axis.value.toFixed(1)} / 100</strong></div><meter min={0} max={100} value={axis.value} aria-label={axis.label} aria-valuetext={axis.value.toFixed(1)+" de 100. "+axis.description}/><p className="axis-poles"><span>{axis.low} (0)</span><span>{axis.high} (100)</span></p><p className="note">Seu perfil: {axis.description}</p>{axis.characterValues.map(character=><div className="character-axis" key={character.id}><p className="note">{character.name}: {character.value} / 100</p><meter className="character-meter" min={0} max={100} value={character.value} aria-label={axis.label+" / "+character.name}/><details><summary>Justificativa editorial</summary><p className="note">{character.rationale}</p></details></div>)}</Card>)}</div>
  </section>
  <section className="result-section" aria-label="Indicadores do questionário"><SectionHeading number="04" title="Sobre a leitura do seu perfil"/><Card className="confidence-card"><div className="stats-grid"><ResultStat label="Cobertura do modo" value={Math.round(result.confidence.coverage*100)+"%"} detail="Perguntas respondidas neste modo"/><ResultStat label="Profundidade" value={result.confidence.answered+"/40"} detail="Itens respondidos do questionário"/><ResultStat label="Concordância interna" value={result.confidence.consistency===null ? "Indisponível" : Math.round(result.confidence.consistency*100)+"%"} detail="Indicador descritivo"/></div><p className="note">{result.confidence.notice}</p><p className="note">{result.interpretation} As perguntas não foram cientificamente validadas.</p></Card>
   <details className="technical-details"><summary>Recorte editorial e versões deste resultado</summary><p className="note">{result.definition.continuity}<br/>Versões: {result.versions.algorithm} / {result.versions.questionnaire} / {result.versions.catalog}</p></details>
  </section>
  <Recommendations result={result}/>
 </>;
}
