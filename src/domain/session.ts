import { ALGORITHM_VERSION, RESULT_SCHEMA_VERSION, assess, continueToFull, validateAnswers, type Answers, type AssessmentResult } from "./assessment.ts";
import { CATALOG_VERSION } from "./catalog.ts";
import { QUESTIONNAIRE_VERSION, questionsFor, type Answer, type Mode } from "./questions.ts";

export const SESSION_SCHEMA_VERSION = 1;
export const MODEL_VERSIONS = Object.freeze({
 algorithm: ALGORITHM_VERSION, questionnaire: QUESTIONNAIRE_VERSION, catalog: CATALOG_VERSION,
});
// Separate keys prevent a new content version from overwriting or reinterpreting an older session.
export const STORAGE_KEY = "heroaxes.session.v1:" +
 MODEL_VERSIONS.algorithm + ":" + MODEL_VERSIONS.questionnaire + ":" + MODEL_VERSIONS.catalog;
export const MAX_HISTORY = 5;
export const MAX_STORAGE_LENGTH = 1_000_000;
export type QuizSession = {
 phase: "intro" | "quiz" | "result"; mode: Mode; index: number;
 answers: Answers; history: readonly AssessmentResult[];
};
export type SessionAction =
 | {type:"start"; mode:Mode} | {type:"answer"; value:Answer}
 | {type:"next"} | {type:"back"} | {type:"resume"} | {type:"continue"}
 | {type:"restart"};
export function initialSession(): QuizSession {
 return {phase:"intro",mode:"quick",index:0,answers:{},history:[]};
}
export function transition(session: QuizSession, action: SessionAction): QuizSession {
 if (action.type === "restart") return initialSession();
 if (action.type === "start") {
  questionsFor(action.mode);
  return {phase:"quiz",mode:action.mode,index:0,answers:{},history:session.history};
 }
 if (action.type === "resume") return {...session,phase:"quiz"};
 if (action.type === "continue") {
  const last = session.history.at(-1);
  if (session.phase !== "result" || last?.mode !== "quick") return session;
  const continuation = continueToFull(last.answers);
  return {...session,phase:"quiz",mode:continuation.mode,answers:continuation.answers,index:continuation.nextIndex};
 }
 if (session.phase !== "quiz") return session;
 const questions = questionsFor(session.mode);
 const question = questions[session.index];
 if (action.type === "answer") {
  if (!Number.isInteger(action.value) || action.value < 1 || action.value > 5) throw new Error("Resposta inválida");
  return {...session,answers:{...session.answers,[question.id]:action.value}};
 }
 if (action.type === "back") return {...session,
  phase:session.index === 0 ? "intro" : "quiz",index:Math.max(0,session.index-1)};
 if (action.type === "next") {
  if (!Object.hasOwn(session.answers,question.id)) return session;
  if (session.index < questions.length-1) return {...session,index:session.index+1};
  const result = assess(session.answers,session.mode);
  return {...session,phase:"result",history:[...session.history,result].slice(-MAX_HISTORY)};
 }
 return session;
}
function record(value: unknown): value is Record<string, unknown> {
 return value !== null && typeof value === "object" && !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
 return Object.keys(value).length === keys.length && keys.every(key=>Object.hasOwn(value,key));
}
function canonical(value: unknown): string {
 if (Array.isArray(value)) return "["+value.map(canonical).join(",")+"]";
 if (record(value)) return "{"+Object.keys(value).sort().map(key=>JSON.stringify(key)+":"+canonical(value[key])).join(",")+"}";
 return JSON.stringify(value) ?? "undefined";
}
function validateSnapshot(value: unknown): AssessmentResult {
 if (!record(value) || value.schemaVersion !== RESULT_SCHEMA_VERSION ||
     canonical(value.versions) !== canonical(MODEL_VERSIONS) ||
     !record(value.answers) || (value.mode !== "quick" && value.mode !== "full"))
  throw new Error("Snapshot incompatível");
 // Only this exact model version is recomputed for integrity checking.
 // Old version keys remain untouched; they are never silently migrated.
 const expected = assess(value.answers as Answers,value.mode);
 if (canonical(value) !== canonical(expected)) throw new Error("Snapshot adulterado ou incompleto");
 return expected;
}
export function encodeSession(session: QuizSession): string {
 const raw = JSON.stringify({schemaVersion:SESSION_SCHEMA_VERSION,versions:MODEL_VERSIONS,session});
 if (raw.length > MAX_STORAGE_LENGTH) throw new Error("Sessão excede o limite local");
 return raw;
}
export function decodeSession(raw: string): QuizSession {
 if (typeof raw !== "string" || raw.length > MAX_STORAGE_LENGTH) throw new Error("Sessão local inválida");
 const envelope: unknown = JSON.parse(raw);
 if (!record(envelope) || !exactKeys(envelope,["schemaVersion","versions","session"]) ||
     envelope.schemaVersion !== SESSION_SCHEMA_VERSION ||
     canonical(envelope.versions) !== canonical(MODEL_VERSIONS) || !record(envelope.session))
  throw new Error("Versão de sessão incompatível");
 const s = envelope.session;
 if (!exactKeys(s,["phase","mode","index","answers","history"]) ||
     !["intro","quiz","result"].includes(s.phase as string) ||
     (s.mode !== "quick" && s.mode !== "full") || !Number.isInteger(s.index) ||
     !record(s.answers) || !Array.isArray(s.history) || s.history.length > MAX_HISTORY)
  throw new Error("Formato de sessão inválido");
 validateAnswers(s.answers as Answers);
 const questions = questionsFor(s.mode);
 const index = s.index as number;
 if (index < 0 || index >= questions.length ||
     Object.keys(s.answers).some(id=>!questions.some(q=>q.id===id)) ||
     questions.slice(0,index).some(q=>!Object.hasOwn(s.answers as object,q.id)))
  throw new Error("Progresso inconsistente");
 const history = s.history.map(validateSnapshot);
 const answers = {...s.answers} as Answers;
 if (s.phase === "result") {
  const last = history.at(-1);
  if (!last || last.mode !== s.mode || index !== questions.length-1 ||
      canonical(last.answers) !== canonical(answers))
   throw new Error("Resultado sem respostas correspondentes");
 }
 return {phase:s.phase as QuizSession["phase"],mode:s.mode,index,answers,history};
}
export interface LocalStoragePort {
 getItem(key: string): string | null;
 setItem(key: string,value: string): void;
 removeItem(key: string): void;
}
export type SessionView = {session:QuizSession; ready:boolean; notice:string | null};
export function createSessionStore(storageProvider: ()=>LocalStoragePort) {
 const serverView: SessionView = {session:initialSession(),ready:false,notice:null};
 let view: SessionView = serverView;
 const listeners = new Set<()=>void>();
 function publish(session: QuizSession, notice: string | null) {
  view = {session,ready:true,notice};
  for (const listener of listeners) listener();
 }
 function initialize() {
  if (view.ready) return;
  try {
   const raw = storageProvider().getItem(STORAGE_KEY);
   if (raw === null) publish(initialSession(),null);
   else {
    try { publish(decodeSession(raw),"Progresso local restaurado."); }
    catch { publish(initialSession(),"O progresso salvo é inválido ou incompatível. Inicie um novo questionário; o registro não foi aplicado."); }
   }
  } catch {
   publish(initialSession(),"O armazenamento local está indisponível. Você pode continuar nesta aba, mas atualizar a página perderá o progresso.");
  }
 }
 return {
  getSnapshot:()=>view,
  getServerSnapshot:()=>serverView,
  subscribe(listener: ()=>void) {
   listeners.add(listener);
   initialize();
   return ()=>{listeners.delete(listener);};
  },
  dispatch(action:SessionAction) {
   initialize();
   const next = transition(view.session,action);
   let notice = view.notice;
   try {
    if (action.type === "restart") {
     storageProvider().removeItem(STORAGE_KEY);
     notice = "Questionário reiniciado e progresso desta versão apagado.";
    } else {
     storageProvider().setItem(STORAGE_KEY,encodeSession(next));
     notice = "Progresso salvo neste navegador.";
    }
   } catch {
    notice = "Não foi possível salvar localmente. Você pode continuar nesta aba, mas atualizar a página perderá o progresso.";
   }
   publish(next,notice);
  },
 };
}
