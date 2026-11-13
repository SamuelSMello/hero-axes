import test from "node:test";
import assert from "node:assert/strict";
import { assess } from "../src/domain/assessment.ts";
import { AXES, type Profile } from "../src/domain/axes.ts";
import { answersForProfile } from "../src/domain/synthetic.ts";
import { MODEL_VERSIONS,STORAGE_KEY,MAX_STORAGE_LENGTH,MAX_HISTORY,createSessionStore,decodeSession,encodeSession,initialSession,transition,type LocalStoragePort,type QuizSession } from "../src/domain/session.ts";
const neutral=Object.fromEntries(AXES.map(a=>[a.id,50])) as Profile;
class MemoryStorage implements LocalStoragePort {
 values=new Map<string,string>();
 getItem(key:string){return this.values.get(key)??null;}
 setItem(key:string,value:string){this.values.set(key,value);}
 removeItem(key:string){this.values.delete(key);}
}
function quiz():QuizSession{return transition(initialSession(),{type:"start",mode:"quick"});}
function completed():QuizSession{
 const answers=answersForProfile(neutral,"quick");
 return {phase:"result",mode:"quick",index:15,answers,history:[assess(answers,"quick")]};
}
test("progresso e resposta atual sobrevivem à serialização",()=>{
 let s=transition(quiz(),{type:"answer",value:5});
 s=transition(s,{type:"next"});s=transition(s,{type:"answer",value:2});
 const restored=decodeSession(encodeSession(s));
 assert.deepEqual(restored,s);assert.equal(restored.index,1);
 assert.equal(restored.answers["strategy-1"],5);assert.equal(restored.answers["empathy-1"],2);
 assert.equal(restored.answers["autonomy-1"],undefined);
});
test("recarregar não sobrescreve dados antes de restaurar e reinscrever não reinicializa",()=>{
 const storage=new MemoryStorage(),s=transition(quiz(),{type:"answer",value:4});
 const raw=encodeSession(s);storage.setItem(STORAGE_KEY,raw);
 const store=createSessionStore(()=>storage);
 assert.equal(store.getSnapshot().ready,false);
 assert.equal(store.getServerSnapshot().ready,false);
 assert.equal(storage.getItem(STORAGE_KEY),raw);
 const unsubscribe=store.subscribe(()=>{});
 assert.deepEqual(store.getSnapshot().session,s);
 assert.equal(storage.getItem(STORAGE_KEY),raw);
 unsubscribe();store.subscribe(()=>{});
 assert.deepEqual(store.getSnapshot().session,s);
});
test("voltar preserva respostas e a seleção editada é salva",()=>{
 let s=transition(quiz(),{type:"answer",value:4});
 s=transition(s,{type:"next"});s=transition(s,{type:"answer",value:2});
 s=transition(s,{type:"back"});assert.equal(s.index,0);
 s=transition(s,{type:"answer",value:1});
 s=decodeSession(encodeSession(s));
 assert.equal(s.answers["strategy-1"],1);assert.equal(s.answers["empathy-1"],2);
 s=transition(s,{type:"back"});assert.equal(s.phase,"intro");
 assert.equal(transition(s,{type:"resume"}).phase,"quiz");
});
test("não permite avançar sem responder ou pular perguntas ao restaurar",()=>{
 const s=quiz();assert.deepEqual(transition(s,{type:"next"}),s);
 const missing={...s,index:3};
 assert.throws(()=>decodeSession(encodeSession(missing)),/Progresso/);
 for(const value of [0,6,2.5])assert.throws(()=>transition(s,{type:"answer",value:value as 1}));
});
test("resultado rápido, pergunta 17 e resultado completo persistem sem alterar snapshot anterior",()=>{
 const quick=completed();const original=JSON.stringify(quick.history[0]);
 const full=transition(decodeSession(encodeSession(quick)),{type:"continue"});
 assert.equal(full.mode,"full");assert.equal(full.index,16);
 assert.equal(Object.keys(full.answers).length,16);
 assert.deepEqual(decodeSession(encodeSession(full)),full);
 let s=full;
 while(s.phase==="quiz"){
  s=transition(s,{type:"answer",value:3});s=transition(s,{type:"next"});
 }
 const restored=decodeSession(encodeSession(s));
 assert.equal(restored.history.length,2);assert.equal(restored.mode,"full");
 assert.equal(restored.phase,"result");assert.equal(Object.keys(restored.answers).length,40);
 assert.equal(JSON.stringify(restored.history[0]),original);
});
test("histórico é limitado a cinco snapshots sem alterar os mantidos",()=>{
 let s=completed();
 for(let i=0;i<MAX_HISTORY+2;i++){
  s=transition(s,{type:"start",mode:"quick"});
  s={...s,answers:answersForProfile(neutral,"quick"),index:15};
  s=transition(s,{type:"next"});
 }
 assert.equal(s.history.length,MAX_HISTORY);
 assert.deepEqual(decodeSession(encodeSession(s)),s);
});
test("JSON inválido, versões, chaves extras, limites e tipos são rejeitados",()=>{
 for(const raw of ["{","null","[]","0",'"invalid"'])assert.throws(()=>decodeSession(raw));
 const base=JSON.parse(encodeSession(quiz()));
 const mutate=(edit:(value:typeof base)=>void)=>{const copy=structuredClone(base);edit(copy);return JSON.stringify(copy);};
 const mutations=[
  (v:typeof base)=>{v.schemaVersion=999;},
  (v:typeof base)=>{v.versions.questionnaire="old";},
  (v:typeof base)=>{v.extra=true;},
  (v:typeof base)=>{v.session.index=-1;},
  (v:typeof base)=>{v.session.index=16;},
  (v:typeof base)=>{v.session.index=1.5;},
  (v:typeof base)=>{v.session.phase="unknown";},
  (v:typeof base)=>{v.session.mode="unknown";},
  (v:typeof base)=>{v.session.answers={"strategy-1":"5"};},
  (v:typeof base)=>{v.session.answers={"unknown":3};},
  (v:typeof base)=>{v.session.answers={"strategy-3":3};},
  (v:typeof base)=>{v.session.answers=Object.fromEntries([["__proto__",{}]]);},
  (v:typeof base)=>{v.session.history={};},
 ];
 for(const edit of mutations)assert.throws(()=>decodeSession(mutate(edit)));
 assert.throws(()=>decodeSession(" ".repeat(MAX_STORAGE_LENGTH+1)));
});
test("snapshot adulterado, personagem DC, gráfico falso e resultado sem respostas são rejeitados",()=>{
 const base=JSON.parse(encodeSession(completed()));
 const changes=[
  (v:typeof base)=>{v.session.history[0].profile.empathy=99;},
  (v:typeof base)=>{v.session.history[0].matches[0].character.name="Batman";},
  (v:typeof base)=>{v.session.history[0].ranking[0].compatibility=100;},
  (v:typeof base)=>{v.session.history[0].versions.catalog="old";},
  (v:typeof base)=>{v.session.history[0].definition.axes[0].high="fake";},
  (v:typeof base)=>{v.session.answers={};},
 ];
 for(const change of changes){
  const copy=structuredClone(base);change(copy);
  assert.throws(()=>decodeSession(JSON.stringify(copy)));
 }
});
test("storage corrompido não é aplicado nem apagado silenciosamente",()=>{
 const storage=new MemoryStorage();storage.setItem(STORAGE_KEY,"broken");
 const store=createSessionStore(()=>storage);store.subscribe(()=>{});
 assert.deepEqual(store.getSnapshot().session,initialSession());
 assert.match(store.getSnapshot().notice!,/inválido/);
 assert.equal(storage.getItem(STORAGE_KEY),"broken");
 store.dispatch({type:"start",mode:"quick"});
 assert.equal(decodeSession(storage.getItem(STORAGE_KEY)!).phase,"quiz");
});
test("armazenamento bloqueado e quota não impedem o quiz em memória",()=>{
 const blocked=createSessionStore(()=>{throw new Error("SecurityError");});
 blocked.subscribe(()=>{});blocked.dispatch({type:"start",mode:"quick"});
 blocked.dispatch({type:"answer",value:5});blocked.dispatch({type:"next"});
 assert.equal(blocked.getSnapshot().session.index,1);
 assert.match(blocked.getSnapshot().notice!,/Não foi possível/);
 const storage=new MemoryStorage();
 storage.setItem=()=>{throw new Error("QuotaExceededError");};
 const quota=createSessionStore(()=>storage);quota.subscribe(()=>{});
 quota.dispatch({type:"start",mode:"full"});quota.dispatch({type:"answer",value:2});
 assert.equal(quota.getSnapshot().session.answers["strategy-1"],2);
 assert.match(quota.getSnapshot().notice!,/Não foi possível/);
});
test("reiniciar remove só a chave atual; sessões de outras versões e outros dados são preservados",()=>{
 const storage=new MemoryStorage();
 storage.setItem("another-app","keep");
 const oldKey="heroaxes.session.v1:weighted-rms-1.0.0:behavioral-1.0.0:marvel-616-editorial-1.0.0";
 assert.notEqual(STORAGE_KEY,oldKey);
 storage.setItem(oldKey,"old-version-archive");
 const store=createSessionStore(()=>storage);store.subscribe(()=>{});
 store.dispatch({type:"start",mode:"quick"});store.dispatch({type:"answer",value:4});
 assert.ok(storage.getItem(STORAGE_KEY));store.dispatch({type:"restart"});
 assert.equal(storage.getItem(STORAGE_KEY),null);
 assert.equal(storage.getItem(oldKey),"old-version-archive");
 assert.equal(storage.getItem("another-app"),"keep");
 assert.deepEqual(store.getSnapshot().session,initialSession());
});
test("sessão contém apenas estado do quiz e versões, sem segredos ou campos arbitrários",()=>{
 const envelope=JSON.parse(encodeSession(completed()));
 assert.deepEqual(Object.keys(envelope).sort(),["schemaVersion","session","versions"]);
 assert.deepEqual(envelope.versions,MODEL_VERSIONS);
 assert.deepEqual(Object.keys(envelope.session).sort(),["answers","history","index","mode","phase"]);
});
