import { AXES, AXIS_WEIGHTS, assertProfile, type Profile, type PartialProfile } from "./axes.ts";
import { CATALOG, CATALOG_VERSION, CONTINUITY, EDITORIAL_NOTICE } from "./catalog.ts";
import { QUESTIONS, QUESTIONNAIRE_VERSION, questionsFor, type Answer, type Mode, type Question } from "./questions.ts";

export const ALGORITHM_VERSION = "weighted-rms-1.0.0";
export const RESULT_SCHEMA_VERSION = 1;
export type Answers = Readonly<Record<string, Answer>>;
export function validateAnswers(answers: Answers): void {
 if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new Error("Respostas inválidas");
 const ids = new Set(QUESTIONS.map(q => q.id));
 for (const [id, value] of Object.entries(answers))
  if (!ids.has(id) || !Number.isInteger(value) || value < 1 || value > 5) throw new Error("Resposta ou ID inválido: " + id);
}
export function normalizeResponse(answer: number, polarity: 1 | -1): number {
 if (!Number.isInteger(answer) || answer < 1 || answer > 5 || ![1,-1].includes(polarity)) throw new Error("Resposta ou polaridade inválida");
 const direct = (answer - 1) * 25;
 return polarity === 1 ? direct : 100 - direct;
}
export function calculateAxes(answers: Answers, mode: Mode): PartialProfile {
 validateAnswers(answers);
 const questions = questionsFor(mode);
 return Object.fromEntries(AXES.map(axis => {
  const answered = questions.filter(q => q.axis === axis.id && Object.hasOwn(answers,q.id));
  const totalWeight = answered.reduce((sum,q) => sum + q.weight, 0);
  return [axis.id, totalWeight === 0 ? null : answered.reduce((sum,q) =>
   sum + normalizeResponse(answers[q.id],q.polarity) * q.weight,0) / totalWeight];
 })) as PartialProfile;
}
export function compatibility(a: Profile, b: Profile, weights: Profile = AXIS_WEIGHTS): number {
 assertProfile(a); assertProfile(b);
 if (Object.keys(weights).length !== AXES.length ||
     AXES.some(axis => !Object.hasOwn(weights, axis.id) || !Number.isFinite(weights[axis.id]) || weights[axis.id] <= 0 || weights[axis.id] > 100))
  throw new Error("Pesos devem conter exatamente os oito eixos em (0, 100]");
 const sumWeights = AXES.reduce((sum,axis) => sum + weights[axis.id],0);
 const distance = Math.sqrt(AXES.reduce((sum,axis) =>
  sum + weights[axis.id] * (a[axis.id]-b[axis.id]) ** 2,0) / sumWeights);
 return Math.max(0, Math.min(100,100-distance));
}
export function rankCharacters(profile: Profile) {
 assertProfile(profile);
 return CATALOG.map(character => ({character, compatibility:compatibility(profile,character.profile)}))
  .sort((a,b) => b.compatibility - a.compatibility ||
   (a.character.id < b.character.id ? -1 : a.character.id > b.character.id ? 1 : 0));
}
export function questionnaireConfidence(answers: Answers, mode: Mode) {
 validateAnswers(answers);
 const questions = questionsFor(mode);
 const perAxis = AXES.map(axis => {
  const values = questions.filter(q => q.axis === axis.id && Object.hasOwn(answers,q.id))
   .map(q => normalizeResponse(answers[q.id],q.polarity));
  if (values.length < 2) return null;
  const mean = values.reduce((s,v) => s+v,0)/values.length;
  const variance = values.reduce((s,v) => s+(v-mean)**2,0)/values.length;
  return 1 - variance/2500;
 });
 const answered = questions.filter(q => Object.hasOwn(answers,q.id)).length;
 const available = perAxis.filter((value): value is number => value !== null);
 return {
  answered, expected:questions.length, coverage:answered/questions.length,
  depth:answered/QUESTIONS.length,
  consistency:available.length ? available.reduce((s,v) => s+v,0)/available.length : null,
  notice:"Indicadores descritivos de cobertura, profundidade e concordância interna; não estimam validade, precisão ou confiança estatística.",
 };
}
function freezeDeep<T>(value: T): T {
 if (value && typeof value === "object" && !Object.isFrozen(value)) {
  for (const child of Object.values(value)) freezeDeep(child);
  Object.freeze(value);
 }
 return value;
}
export function assess(answers: Answers, mode: Mode) {
 const profile = calculateAxes(answers,mode);
 const questions = questionsFor(mode);
 if (questions.some(q => !Object.hasOwn(answers,q.id))) throw new Error("Conclua todas as perguntas do modo antes do matching");
 assertProfile(profile);
 const ranking = rankCharacters(profile);
 const best = ranking[0].compatibility;
 const matches = ranking.filter(item => Math.abs(item.compatibility-best) <= 1e-9);
 // Snapshot is self-contained. A future storage layer must keep it, never recompute old results silently.
 return freezeDeep({
  schemaVersion:RESULT_SCHEMA_VERSION,
  versions:{algorithm:ALGORITHM_VERSION, questionnaire:QUESTIONNAIRE_VERSION,catalog:CATALOG_VERSION},
  mode, answers:Object.fromEntries(questions.map(q => [q.id,answers[q.id]])) as Answers,
  profile, weights:{...AXIS_WEIGHTS},
  confidence:questionnaireConfidence(answers,mode),
  matches, ranking,
  interpretation:EDITORIAL_NOTICE,
  definition:{continuity:CONTINUITY, axes:AXES.map(axis=>({...axis})),
   questions:questions.map(q=>({...q})), catalog:CATALOG.map(c=>({...c,profile:{...c.profile},rationale:{...c.rationale}}))},
 });
}
export type AssessmentResult = ReturnType<typeof assess>;
export function resultAxisRows(result: AssessmentResult) {
 // The chart uses the stored user profile, not the winner's editorial attributes.
 return result.definition.axes.map(axis => ({
  id:axis.id,label:axis.label,low:axis.low,high:axis.high,
  value:result.profile[axis.id],description:result.profile[axis.id] < 40 ? axis.low : result.profile[axis.id] > 60 ? axis.high : "Equilíbrio entre os dois polos",
  characterValues:result.matches.map(match=>({id:match.character.id,name:match.character.name,
   value:match.character.profile[axis.id],rationale:match.character.rationale[axis.id]})),
 }));
}
export function continueToFull(answers: Answers): {mode: "full"; answers: Answers; nextIndex: number} {
 validateAnswers(answers);
 if (questionsFor("quick").some(q => !Object.hasOwn(answers,q.id))) throw new Error("Conclua o modo rápido");
 const next = QUESTIONS.findIndex(q => !Object.hasOwn(answers,q.id));
 return {mode:"full",answers:{...answers},nextIndex:next === -1 ? QUESTIONS.length : next};
}
export function questionMetadata(q: Question): string {
 return q.axis + " | " + (q.core ? "fundamental" : "adicional") + " | polaridade " + q.polarity +
  " | peso " + q.weight + " | " + q.format;
}
