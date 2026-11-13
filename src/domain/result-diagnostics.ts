import type { AssessmentResult } from "./assessment.ts";
// These explain the catalogue geometry. They are neither coverage of questions nor statistical confidence.
export function matchingDiagnostics(result: AssessmentResult) {
 const outside = result.definition.axes.flatMap(axis=>{
  const values = result.definition.catalog.map(c=>c.profile[axis.id]);
  const min = Math.min(...values), max = Math.max(...values);
  const value = result.profile[axis.id];
  return value < min || value > max ? [{axis:axis.id,label:axis.label,value,min,max}] : [];
 });
 const margin = result.ranking.length > 1 ?
  result.ranking[0].compatibility-result.ranking[1].compatibility : null;
 return {outside,margin,closeMatch:margin !== null && margin <= 1};
}
