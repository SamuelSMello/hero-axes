import {readFile,writeFile} from "node:fs/promises";
const css=await readFile(new URL("../src/app/globals.css",import.meta.url),"utf8");
const tokens=Object.fromEntries([...css.matchAll(/--(color-[\w-]+):\s*(#[\da-f]{6});/gi)].map(m=>[m[1],m[2]]));
function luminance(hex){
 const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
const checks=[
 ["Texto principal / fundo",tokens["color-text"],tokens["color-bg"],4.5],
 ["Texto principal / superfície",tokens["color-text"],tokens["color-surface"],4.5],
 ["Texto secundário / superfície",tokens["color-muted"],tokens["color-surface"],4.5],
 ["Texto secundário / superfície elevada",tokens["color-muted"],tokens["color-surface-raised"],4.5],
 ["Destaque textual / superfície",tokens["color-primary-soft"],tokens["color-surface"],4.5],
 ["Dourado / superfície",tokens["color-gold"],tokens["color-surface"],4.5],
 ["Branco do botão / primária","#ffffff",tokens["color-primary"],4.5],
 ["Branco do botão / hover","#ffffff",tokens["color-primary-hover"],4.5],
 ["Contorno de alternativa / superfície","#65728a",tokens["color-surface"],3],
 ["Foco / superfície",tokens["color-focus"],tokens["color-surface"],3],
].map(([label,foreground,background,minimum])=>{
 const a=luminance(foreground),b=luminance(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 return {label,foreground,background,ratio:+ratio.toFixed(3),minimum,pass:ratio>=minimum};
});
const report={method:"Contraste sRGB dos pares opacos principais, limite de texto normal 4.5:1, contorno/foco 3:1. Não substitui auditoria em navegador nem verificação de todos os estados e composições.",checks};
const path=new URL("../docs/UI_CONTRAST_4B.json",import.meta.url),output=JSON.stringify(report,null,2)+"\n";
if(process.argv.includes("--check")){if(await readFile(path,"utf8")!==output)throw Error("Relatório de contraste desatualizado");}
else await writeFile(path,output);
console.log(JSON.stringify(checks));
if(checks.some(c=>!c.pass))throw Error("Contraste insuficiente");
