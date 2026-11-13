import { compatibility, type AssessmentResult } from "./assessment.ts";
import type { Character } from "./catalog.ts";

// Presentation derived only from the snapshot; never changes matching or storage.
export function interpretCharacter(result: AssessmentResult, character: Character) {
 compatibility(result.profile, character.profile, result.weights); // Validate values and weights.
 const total = Object.values(result.weights).reduce((sum, weight) => sum + weight, 0);
 const axes = result.definition.axes.map((axis, order) => {
  const user = result.profile[axis.id], value = character.profile[axis.id];
  const delta = user - value;
  const contribution = result.weights[axis.id] * delta ** 2 / total;
  const pole = user < 40 ? axis.low : user > 60 ? axis.high : "Equilíbrio entre os dois polos";
  return {...axis, order, user, character: value, delta, contribution,
   explanation: `${axis.label}: você ${user.toFixed(1)}/100 (${pole}); ${character.name} ${value.toFixed(1)}/100. Diferença: ${Math.abs(delta).toFixed(1)} pontos. No recorte editorial do personagem: ${character.rationale[axis.id]}.`};
 });
 const sorted = [...axes].sort((a,b) => a.contribution-b.contribution || a.order-b.order);
 const similarities = sorted.slice(0,3);
 const differences = [...sorted].sort((a,b) => b.contribution-a.contribution || a.order-b.order).slice(0,2);
 return {character, axes, similarities, differences};
}

export function interpretResult(result: AssessmentResult) {
 const primary = interpretCharacter(result, result.ranking[0].character);
 const second = result.ranking[1];
 const comparison = second ? (() => {
  const runnerUp = interpretCharacter(result,second.character);
  const contributions = primary.axes.map((axis,i) => ({id:axis.id,label:axis.label,
   advantage: runnerUp.axes[i].contribution-axis.contribution}));
  const gain = contributions.reduce((sum,axis)=>sum+axis.advantage,0);
  const tied = Math.abs(result.ranking[0].compatibility-second.compatibility) <= 1e-9;
  const drivers = [...contributions].sort((a,b)=>b.advantage-a.advantage ||
   primary.axes.findIndex(x=>x.id===a.id)-primary.axes.findIndex(x=>x.id===b.id));
  return {contributions,gain,tied, explanation: tied
   ? `Empate matemático com ${second.character.name}; a ordem por ID não indica superioridade.`
   : `${primary.character.name} supera ${second.character.name} por ${(result.ranking[0].compatibility-second.compatibility).toFixed(2)} pontos de compatibilidade. A redução líquida no erro quadrático médio ponderado é ${gain.toFixed(2)}. Contribuições por eixo (positivo favorece o primeiro; negativo favorece o segundo): ${drivers.map(a=>`${a.label}: ${a.advantage.toFixed(2)}`).join("; ")}. Essas contribuições não são pontos percentuais de compatibilidade.`};
 })() : null;
 const categories = (["herói","vilão","anti-herói"] as const).map(classification=>{
  const ranked = result.ranking.filter(r=>r.character.classification===classification);
  return {classification,matches:ranked.filter(r=>Math.abs(r.compatibility-ranked[0].compatibility)<=1e-9)};
 });
 return {primary,comparison,categories};
}
