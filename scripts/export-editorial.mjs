import { readFile, writeFile, mkdir } from "node:fs/promises";
import { AXES } from "../src/domain/axes.ts";
import { CATALOG, CATALOG_VERSION, CONTINUITY, EDITORIAL_NOTICE } from "../src/domain/catalog.ts";
import { QUESTIONS, QUESTIONNAIRE_VERSION } from "../src/domain/questions.ts";
import { questionMetadata } from "../src/domain/assessment.ts";
const escape = value => String(value).replaceAll("|"," / ").replaceAll("\n"," ");
let catalog = "# Catálogo editorial\n\n" + CATALOG_VERSION + "\n\n" + CONTINUITY + "\n\n" + EDITORIAL_NOTICE + "\n\n";
catalog += "Lista fechada fornecida no escopo do projeto, com validação de identidade por slug e nome. Links Marvel são referências de identificação; não são fontes de pontuações. Sem consulta a API em produção.\n\n";
catalog += "| Eixo | 0 | 100 | Peso de matching |\n|---|---|---|---|\n";
for(const axis of AXES) catalog += "|"+[axis.label,axis.low,axis.high,1].map(escape).join("|")+"|\n";
for(const character of CATALOG) {
 catalog += "\n## " + character.name + " (" + character.id + ")\n\n";
 catalog += character.classification + ". " + character.editorialNote + "\n\n";
 catalog += "[Referência Marvel](" + character.source + ")\n\n";
 catalog += "| Eixo | Valor | Justificativa interpretativa |\n|---|---|---|\n";
 for(const axis of AXES) catalog += "|"+[axis.label,character.profile[axis.id],character.rationale[axis.id]].map(escape).join("|")+"|\n";
}
let questionnaire = "# Questionário editorial\n\n" + QUESTIONNAIRE_VERSION + "\n\n";
questionnaire += "Não validado cientificamente. Imagine o contexto indicado e escolha o comportamento habitual. Os polos descrevem alternativas com custos próprios, não uma resposta correta. Alguns cenários ainda podem induzir desejabilidade social.\n\n";
questionnaire += "Resposta bipolar de 1 a 5: 1 = A, 2 = mais próximo de A, 3 = entre A e B, 4 = mais próximo de B, 5 = B. Normalização direta: (resposta - 1) × 25. Polaridade -1: 100 menos o valor direto. Peso de cada item = 1; ausência não equivale a resposta neutra.\n\n";
questionnaire += "Rápido: itens 1–16, duas perguntas por eixo com polaridades opostas. Completo: os mesmos 16, seguidos de 24 itens (três por eixo). Ordem fixa; sem sorteio. Pesos iguais por ausência de calibração empírica.\n\n";
for(const [index,q] of QUESTIONS.entries()) {
 questionnaire += "## " + (index+1) + ". " + q.id + "\n\n" + q.text + "\n\n";
 questionnaire += "- A: " + q.left + "\n- B: " + q.right + "\n- Metadados: " + questionMetadata(q) + "\n\n";
}
const outputs = {"CATALOG.md":catalog,"QUESTIONNAIRE.md":questionnaire};
const directory = new URL("../docs/",import.meta.url);
if(!process.argv.includes("--check")) await mkdir(directory,{recursive:true});
for(const [name,content] of Object.entries(outputs)) {
 const url = new URL(name,directory);
 if(process.argv.includes("--check")) {
  if(await readFile(url,"utf8") !== content) throw new Error(name + " está desatualizado");
 } else await writeFile(url,content,"utf8");
}
console.log(process.argv.includes("--check") ? "Documentação editorial consistente." : "Catálogo e questionário exportados.");
