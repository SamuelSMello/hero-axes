import { AXES, assertProfile, type Profile } from "./axes.ts";
import { calculateAxes, rankCharacters, type Answers } from "./assessment.ts";
import { CATALOG } from "./catalog.ts";
import { questionsFor, type Answer, type Mode } from "./questions.ts";

// Audit only. Never called to choose a real user's character.
export function answersForProfile(profile: Profile,mode: Mode): Answers {
 assertProfile(profile);
 const answers: Record<string,Answer> = {};
 for (const axis of AXES) {
  const items = questionsFor(mode).filter(q=>q.axis===axis.id);
  const units = Math.round(profile[axis.id]*items.length/25);
  const base = Math.floor(units/items.length), remainder = units%items.length;
  items.forEach((q,index)=>{
   const normalized = base+(index<remainder ? 1 : 0);
   answers[q.id] = (q.polarity === 1 ? normalized+1 : 5-normalized) as Answer;
  });
 }
 return answers;
}
export const SYNTHETIC_SCENARIOS: readonly {id:string;profile:Profile}[] = [
 {id:"neutral",profile:{strategy:50,empathy:50,autonomy:50,impulsivity:50,dominance:50,cooperation:50,risk:50,flexibility:50}},
 {id:"strategic",profile:{strategy:100,empathy:50,autonomy:90,impulsivity:10,dominance:70,cooperation:50,risk:60,flexibility:80}},
 {id:"compassionate",profile:{strategy:70,empathy:100,autonomy:70,impulsivity:20,dominance:20,cooperation:100,risk:60,flexibility:70}},
 {id:"impulsive",profile:{strategy:20,empathy:60,autonomy:90,impulsivity:100,dominance:50,cooperation:30,risk:100,flexibility:30}},
 {id:"authoritarian",profile:{strategy:90,empathy:10,autonomy:100,impulsivity:30,dominance:100,cooperation:20,risk:70,flexibility:20}},
 {id:"cautious-collaborator",profile:{strategy:80,empathy:80,autonomy:20,impulsivity:10,dominance:10,cooperation:90,risk:10,flexibility:60}},
 {id:"independent-explorer",profile:{strategy:30,empathy:50,autonomy:100,impulsivity:60,dominance:20,cooperation:20,risk:100,flexibility:100}},
 {id:"structured-coordinator",profile:{strategy:100,empathy:70,autonomy:60,impulsivity:0,dominance:40,cooperation:100,risk:20,flexibility:40}},
 {id:"reserved-specialist",profile:{strategy:90,empathy:40,autonomy:100,impulsivity:10,dominance:10,cooperation:0,risk:20,flexibility:80}},
 {id:"reactive-collaborator",profile:{strategy:20,empathy:90,autonomy:40,impulsivity:90,dominance:20,cooperation:100,risk:80,flexibility:80}},
 {id:"rigid-independent",profile:{strategy:90,empathy:40,autonomy:100,impulsivity:20,dominance:60,cooperation:10,risk:30,flexibility:0}},
 {id:"flexible-facilitator",profile:{strategy:60,empathy:90,autonomy:50,impulsivity:40,dominance:0,cooperation:100,risk:50,flexibility:100}},
];
const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173];
function halton(index:number,base:number): number {
 let fraction=1,result=0;
 for(let n=index;n>0;n=Math.floor(n/base)){fraction/=base;result+=fraction*(n%base);}
 return result;
}
export function rawAuditAnswers(index:number,mode:Mode):Answers {
 if(!Number.isInteger(index)||index<1)throw new Error("Índice sintético inválido");
 return Object.fromEntries(questionsFor(mode).map((q,i)=>[q.id,(1+Math.floor(halton(index,PRIMES[i])*5)) as Answer]));
}
export function catalogReachability(mode: Mode) {
 return CATALOG.map(character=>{
  const answers=answersForProfile(character.profile,mode);
  const profile=calculateAxes(answers,mode) as Profile;
  const ranking=rankCharacters(profile);
  const own=ranking.find(r=>r.character.id===character.id)!;
  return {id:character.id,reachable:Math.abs(ranking[0].compatibility-own.compatibility)<=1e-9,
   compatibility:own.compatibility,profile,answers};
 });
}
export function distributionAudit(mode:Mode,suite:"raw-halton" | "profile-grid",sampleSize=4096) {
 const shares: Record<string,number> = Object.fromEntries(CATALOG.map(c=>[c.id,0]));
 let samples=0;
 const count=(answers:Answers)=>{
  const ranking=rankCharacters(calculateAxes(answers,mode) as Profile);
  const winners=ranking.filter(r=>Math.abs(r.compatibility-ranking[0].compatibility)<=1e-9);
  winners.forEach(r=>{shares[r.character.id]+=1/winners.length;});
  samples++;
 };
 if(suite==="raw-halton"){
  for(let i=1;i<=sampleSize;i++)count(rawAuditAnswers(i,mode));
 }else{
  // Exactly 3^8 profiles, each coordinate in {0,50,100}. No pseudo-randomness.
  for(let i=0;i<3**AXES.length;i++){
   let remainder=i;
   const profile=Object.fromEntries(AXES.map(axis=>{
    const value=(remainder%3)*50;remainder=Math.floor(remainder/3);return [axis.id,value];
   })) as Profile;
   count(answersForProfile(profile,mode));
  }
 }
 return {mode,suite,samples,shares};
}
