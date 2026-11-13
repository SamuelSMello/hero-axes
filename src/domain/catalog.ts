import { AXES, assertProfile, type Profile } from "./axes.ts";

export const CATALOG_VERSION = "marvel-616-editorial-1.0.1";
export const CONTINUITY = "Marvel Comics, Terra-616; síntese editorial de caracterizações recorrentes, não um estado atual ou versão do MCU.";
export const EDITORIAL_NOTICE = "Avaliações interpretativas, não pontuações oficiais ou medidas psicológicas. Sem associação entre semelhança e valor moral.";
// Identity is validated against this independent map, never inferred from publisher.
export const ALLOWED_CHARACTERS = Object.freeze({
  "iron-man": "Homem de Ferro", "captain-america": "Capitão América",
  "spider-man": "Homem-Aranha", thor: "Thor", hulk: "Hulk",
  "doctor-strange": "Doutor Estranho", "black-panther": "Pantera Negra",
  "black-widow": "Viúva Negra", hawkeye: "Gavião Arqueiro",
  "scarlet-witch": "Feiticeira Escarlate", wolverine: "Wolverine", daredevil: "Demolidor",
  "doctor-doom": "Doutor Destino", thanos: "Thanos", ultron: "Ultron", loki: "Loki",
  magneto: "Magneto", "red-skull": "Caveira Vermelha", "green-goblin": "Duende Verde",
  kingpin: "Rei do Crime", kang: "Kang", hela: "Hela", mysterio: "Mystério", killmonger: "Killmonger",
});
export type CharacterId = keyof typeof ALLOWED_CHARACTERS;
export type Character = {
  id: CharacterId; name: string; publisher: "Marvel"; continuity: typeof CONTINUITY;
  classification: "herói" | "vilão" | "anti-herói";
  editorialNote: string; profile: Profile; rationale: Record<keyof Profile, string>;
  source: string;
};
type Row = [CharacterId, Character["classification"], string, number[], string[]];
// Order for both vectors: strategy, empathy, autonomy, impulsivity, dominance, cooperation, risk, flexibility.
const rows: Row[] = [
 ["iron-man","herói","Tony Stark adulto; pragmatismo e controle, sem reduzir a personalidade à inteligência.",[90,55,90,60,75,60,85,80],["Projeta contingências","Empatia limitada pelo pragmatismo","Confia no próprio julgamento","Às vezes reage antes de ponderar consequências","Busca dirigir operações","Integra equipes com atritos","Experimenta soluções arriscadas","Reinventa os próprios métodos"]],
 ["captain-america","herói","Steve Rogers, liderança cooperativa; não a identidade Hydra de eventos específicos.",[85,90,80,25,45,95,80,60],["Planeja taticamente","Prioriza pessoas concretas","Contesta ordens por convicção","Controla reações","Lidera sem exigir controle total","Constrói confiança coletiva","Aceita perigo por missão","Adapta tática preservando princípios"]],
 ["spider-man","herói","Peter Parker adulto, protetor cotidiano; humor não significa ausência de reflexão.",[65,95,75,65,20,70,80,90],["Combina preparação técnica com decisões no momento","Se envolve com o sofrimento alheio","Atua sem supervisão","Reage espontaneamente","Não busca comandar","Aceita parcerias","Se expõe para ajudar","Improvisa continuamente"]],
 ["thor","herói","Thor Odinson amadurecido; alterna orgulho guerreiro e vínculo comunitário.",[55,75,80,75,65,80,95,55],["Prefere ação a antecipação extensa","Protege aliados e povos","Segue convicções próprias","Reage com intensidade","Assume liderança régia","Valoriza companheiros","Enfrenta riscos extremos","Aprende mas mantém tradições"]],
 ["hulk","anti-herói","Hulk clássico em fase de raiva protetora; não representa todas as personas de Bruce Banner.",[20,60,95,95,55,25,95,30],["Pouca antecipação nessa persona","Vínculos protetores seletivos","Resiste à tutela","Reage imediatamente","Tenta impor a própria decisão quando contrariado","Prefere isolamento","Pouca evitação do perigo","Repete respostas defensivas"]],
 ["doctor-strange","herói","Stephen Strange como protetor místico; segredos e decisões unilaterais fazem parte do recorte.",[95,65,90,20,75,55,75,80],["Antecipa ameaças complexas","Protege com distanciamento","Decide sem autorização","Contém a reação inicial","Retém decisões estratégicas sob sua responsabilidade","Coopera de forma seletiva","Assume riscos calculados","Revê soluções diante do desconhecido"]],
 ["black-panther","herói","T’Challa estrategista e soberano; dever institucional pode limitar abertura.",[95,80,85,20,70,80,60,75],["Planeja vários movimentos","Considera sua comunidade","Decide com autonomia régia","Mantém autocontrole","Concentra responsabilidade política","Forma alianças","Pesa consequências antes de arriscar","Adapta tradição e inovação"]],
 ["black-widow","herói","Natasha Romanoff em trajetória de reparação, não sua fase inicial como antagonista.",[90,65,85,25,40,75,75,90],["Prepara operações","Empatia reservada","Atua independentemente","Controla impulsos","Influencia sem comando absoluto","Confia em parceiros escolhidos","Aceita exposição operacional","Muda abordagem rapidamente"]],
 ["hawkeye","herói","Clint Barton, lealdade prática e contestação de autoridade.",[70,80,80,65,30,85,85,80],["Planeja soluções práticas","Cuida de aliados próximos","Questiona superiores","Fala e reage espontaneamente","Evita controle rígido","Valoriza a equipe","Age mesmo vulnerável","Improvisa com recursos limitados"]],
 ["scarlet-witch","herói","Wanda Maximoff em fase de reparação; crises e coerção não definem todas as suas aparições.",[55,85,80,65,40,70,75,70],["Planejamento variável","Laços afetivos intensos","Busca autodeterminação","Emoções aceleram ações","Não procura domínio permanente","Busca pertencimento","Tolera incerteza elevada","Reconstrói suas formas de agir"]],
 ["wolverine","anti-herói","Logan protetor e mentor, com métodos violentos; não uma média de todas as versões.",[65,65,95,80,35,60,95,45],["Experiência tática","Cuidado seletivo e profundo","Resiste a controle","Reage com intensidade","Evita governar outros","Coopera com atrito","Aceita perigo extremo","Métodos persistentes"]],
 ["daredevil","herói","Matt Murdock como vigilante; conflitos e transgressões convivem com compromisso comunitário.",[80,90,90,60,45,55,90,40],["Investiga antes de agir","Sensível ao sofrimento local","Age por consciência própria","Conflitos geram reações intensas","Insiste na própria responsabilidade","Parcerias limitadas pelo segredo","Se expõe repetidamente","Mantém códigos e rotinas"]],
 ["doctor-doom","vilão","Victor von Doom soberano antagonista; passagens como aliado não apagam o padrão de controle.",[98,20,98,35,100,25,70,55],["Contingências extensas","Instrumentaliza interesses alheios","Recusa tutela","Orgulho pode romper autocontrole","Exige controle absoluto","Alianças instrumentais","Riscos sob seu comando","Inova meios preservando objetivos"]],
 ["thanos","vilão","Titã dos quadrinhos, obsessão e conquista; não a motivação populacional do MCU.",[95,10,95,30,95,15,90,35],["Planos de longo alcance","Distanciamento do sofrimento","Atua por propósito próprio","Paciência operacional","Busca impor vontade","Usa aliados como instrumentos","Aceita apostas cósmicas","Fixação em objetivos"]],
 ["ultron","vilão","Ultron antagonista sintético recorrente; não variantes cooperativas.",[90,5,95,45,100,10,80,65],["Prepara campanhas","Desconsidera experiência humana","Rejeita criadores","Hostilidade interfere na análise","Controle total","Subordina em vez de colaborar","Aceita destruição como custo","Reconfigura estratégias"]],
 ["loki","anti-herói","Loki em fase de agente de mudança; histórias de antagonismo tornam a classificação ambígua.",[90,45,95,55,70,40,85,95],["Trama antecipadamente","Empatia seletiva","Rejeita papéis impostos","Vaidade gera reações","Influencia escolhas alheias","Alianças instáveis","Aposta em saídas incertas","Reinventa identidade e método"]],
 ["magneto","anti-herói","Max Eisenhardt como protetor mutante disposto à coerção; alterna aliado e antagonista.",[90,55,95,55,90,60,85,50],["Organiza movimentos","Empatia intensa mas seletiva","Recusa submissão","Trauma alimenta reações","Liderança centralizadora","Coopera por causa comum","Aceita confronto arriscado","Revê alianças mais que convicções"]],
 ["red-skull","vilão","Johann Schmidt antagonista autoritário; classificação não é diagnóstico do participante.",[90,0,90,45,100,15,65,20],["Planeja dominação","Nega consideração aos outros","Busca poder próprio","Raiva interfere na execução","Autoritarismo extremo","Subordina colaboradores","Usa riscos assimétricos","Rigidez ideológica"]],
 ["green-goblin","vilão","Norman Osborn como Duende Verde; não Harry Osborn.",[85,10,90,90,95,20,95,60],["Prepara manipulações","Explora vulnerabilidades","Busca agenda própria","Instabilidade acelera reações","Exige domínio","Alianças utilitárias","Escala perigos","Alterna táticas e disfarces"]],
 ["kingpin","vilão","Wilson Fisk como chefe criminal; afeto privado não equivale a empatia geral.",[95,20,90,25,95,40,45,60],["Constrói redes duradouras","Cuidado restrito ao círculo íntimo","Segue interesses próprios","Controla expressão pública","Centraliza a organização","Coordena redes instrumentais","Protege posição estabelecida","Negocia novos meios"]],
 ["kang","vilão","Nathaniel Richards como Kang conquistador; exclui Rama-Tut, Immortus e variantes como perfis próprios.",[98,15,95,30,95,25,90,80],["Antecipação temporal","Pessoas como peças","Segue projeto próprio","Contenção tática","Impõe governo","Alianças por conveniência","Apostas em linhas temporais","Reformula campanhas"]],
 ["hela","vilão","Hela dos quadrinhos como soberana de Hel; não mistura com sua genealogia no MCU.",[85,15,90,30,95,30,60,35],["Tramas de longo prazo","Distanciamento afetivo","Autonomia soberana","Paciência antes de atacar","Controle de seu domínio","Pactos instrumentais","Risco medido ao poder","Persistência nas prerrogativas"]],
 ["mysterio","vilão","Quentin Beck ilusionista; não outros portadores do nome.",[90,20,80,55,75,35,65,90],["Prepara cenários ilusórios","Manipula percepções alheias","Busca autoria e reconhecimento","Frustração quebra planos","Controla a narrativa","Coopera por vantagem","Aposta em encenações","Inventa truques e identidades"]],
 ["killmonger","vilão","Erik Killmonger dos quadrinhos; oposição política não justifica seus métodos coercivos.",[90,30,95,65,90,45,90,45],["Organiza tomada de poder","Cuidado subordinado à causa","Rejeita autoridade vigente","Ressentimento acelera confronto","Governo centralizador","Mobiliza aliados por objetivo","Aceita ruptura perigosa","Firmeza nos meios de conquista"]],
];
const sources: Partial<Record<CharacterId, string>> = {
 "iron-man":"iron-man-tony-stark", "captain-america":"captain-america-steve-rogers",
 "spider-man":"spider-man-peter-parker", "doctor-strange":"doctor-strange-stephen-strange",
 "black-panther":"black-panther-t-challa", "black-widow":"black-widow-natasha-romanoff",
 hawkeye:"hawkeye-clint-barton", "scarlet-witch":"scarlet-witch-wanda-maximoff",
 "green-goblin":"green-goblin-norman-osborn", kingpin:"kingpin", kang:"kang",
};
export function validateCatalog(input: unknown): readonly Character[] {
  if (!Array.isArray(input) || input.length !== Object.keys(ALLOWED_CHARACTERS).length)
    throw new Error("Catálogo deve ter os 24 personagens permitidos");
  const seen = new Set<string>();
  for (const value of input) {
    if (!value || typeof value !== "object") throw new Error("Personagem inválido");
    const c = value as Character;
    if (!Object.hasOwn(ALLOWED_CHARACTERS, c.id) || seen.has(c.id) ||
        c.name !== ALLOWED_CHARACTERS[c.id] || c.publisher !== "Marvel" ||
        c.continuity !== CONTINUITY || !["herói","vilão","anti-herói"].includes(c.classification) ||
        typeof c.editorialNote !== "string" || !c.editorialNote.trim() ||
        typeof c.source !== "string" || !c.source.startsWith("https://www.marvel.com/characters/"))
      throw new Error("Identidade, continuidade ou classificação inválida");
    assertProfile(c.profile);
    if (!c.rationale || Object.keys(c.rationale).length !== AXES.length ||
        AXES.some(axis => typeof c.rationale[axis.id] !== "string" || !c.rationale[axis.id].trim()))
      throw new Error("Justificativa editorial ausente");
    seen.add(c.id);
  }
  // Defensive copy and freezing: imported data cannot later mutate matching.
  return Object.freeze(input.map((c: Character) => Object.freeze({
    ...c, profile: Object.freeze({...c.profile}), rationale: Object.freeze({...c.rationale}),
  })));
}
export const CATALOG = validateCatalog(rows.map(([id, classification, editorialNote, values, rationale]) => ({
  id, name: ALLOWED_CHARACTERS[id], publisher: "Marvel", continuity: CONTINUITY,
  classification, editorialNote,
  profile: Object.fromEntries(AXES.map((axis, i) => [axis.id, values[i]])),
  rationale: Object.fromEntries(AXES.map((axis, i) => [axis.id, rationale[i]])),
  source: "https://www.marvel.com/characters/" + (sources[id] ?? id) + "/in-comics",
})));
