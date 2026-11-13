import {writeFile,readFile} from 'node:fs/promises';
import {AXES} from '../src/domain/axes.ts';
import {CATALOG} from '../src/domain/catalog.ts';
import {calculateAxes,rankCharacters,assess} from '../src/domain/assessment.ts';
import {questionsFor} from '../src/domain/questions.ts';
import {rawAuditAnswers,answersForProfile} from '../src/domain/synthetic.ts';
import {interpretResult} from '../src/domain/interpretation.ts';
const primes=[2,3,5,7,11,13,17,19];
function halton(n,b){let f=1,r=0;for(;n>0;n=Math.floor(n/b)){f/=b;r+=f*(n%b);}return r;}
const experiments=[];
for(const mode of ['quick','full'])for(const input of ['independent-items','uniform-profiles']){
 const profiles=Array.from({length:4096},(_,i)=>calculateAxes(input==='independent-items'?rawAuditAnswers(i+1,mode):answersForProfile(Object.fromEntries(AXES.map((a,j)=>[a.id,halton(i+1,primes[j])*100])),mode),mode));
 const moments=AXES.map(a=>{const values=profiles.map(p=>p[a.id]),mean=values.reduce((s,v)=>s+v,0)/values.length;return {axis:a.id,mean,sd:Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/values.length)};});
 const shares=Object.fromEntries(CATALOG.map(c=>[c.id,0]));
 for(const p of profiles){const rank=rankCharacters(p),wins=rank.filter(r=>Math.abs(r.compatibility-rank[0].compatibility)<=1e-9);for(const w of wins)shares[w.character.id]+=1/wins.length;}
 // Diagnostic ablation only: compare geometric cells without one coordinate.
 const withoutAxis=AXES.map(axis=>{let wanda=0;for(const p of profiles){const errors=CATALOG.map(c=>({id:c.id,error:AXES.filter(a=>a.id!==axis.id).reduce((s,a)=>s+(p[a.id]-c.profile[a.id])**2,0)}));const min=Math.min(...errors.map(e=>e.error)),wins=errors.filter(e=>Math.abs(e.error-min)<=1e-9);if(wins.some(w=>w.id==='scarlet-witch'))wanda+=1/wins.length;}return {axis:axis.id,wandaPercent:100*wanda/profiles.length};});
 experiments.push({mode,input,samples:profiles.length,moments,shares,withoutAxis});
}
const neutral=Object.fromEntries(AXES.map(a=>[a.id,50]));
const result=assess(answersForProfile(neutral,'quick'),'quick');
const report={methodology:'4096 pontos Halton por protocolo/modo. Alternativas independentes por item versus traço uniforme por eixo, sintetizado na resolução realizável. Contagens fracionadas em empates. Ablação omite uma coordenada apenas na auditoria, sem alterar matching de produção.',questionStructure:AXES.map(a=>({axis:a.id,items:questionsFor('full').filter(q=>q.axis===a.id).map(q=>({id:q.id,weight:q.weight,polarity:q.polarity}))})),experiments,neutral:{ranking:result.ranking.map(r=>({id:r.character.id,compatibility:r.compatibility})),interpretation:interpretResult(result)}};
const output=JSON.stringify(report,null,2)+'\n',path=new URL('../docs/DISTRIBUTION_4A.json',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(path,'utf8')!==output)throw Error('Auditoria 4A desatualizada');}else await writeFile(path,output);
for(const e of experiments)console.log(JSON.stringify({mode:e.mode,input:e.input,wandaPercent:100*e.shares['scarlet-witch']/e.samples,sd:e.moments.map(a=>+a.sd.toFixed(2)),withoutAxis:e.withoutAxis}));
console.log(report.neutral.interpretation.comparison.explanation);
