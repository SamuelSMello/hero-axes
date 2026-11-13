import { ALLOWED_CHARACTERS, type CharacterId } from "../domain/catalog.ts";
import type { AxisId } from "../domain/axes.ts";
import type { EditorialSource, Work, TraitEvidence, NarrativeRole, RecommendationCatalog, MediaType, Continuity, Spoilers } from "../core/recommendation-types.ts";

const sources:EditorialSource[]=[];
function source(id:string,title:string,url:string,kind:EditorialSource["kind"]="official-synopsis",publisher="Marvel",verification:EditorialSource["verification"]="indexed-text") {
 sources.push({id,title,url,kind,publisher,checkedOn:"2026-11-13",verification});return id;
}
const s={
 armor:source("armor","Iron Man: Armor Wars — guia","https://www.marvel.com/comics/guides/1971/iron_man_armor_wars","official-guide"),
 prime:source("prime","Avengers Prime (2010) #5","https://www.marvel.com/comics/issue/30098/avengers_prime_2010_5"),
 winter:source("winter","Captain America: Winter Soldier — guia","https://share.marvel.com/comics/discover/998/captain-america-winter-soldier","official-guide"),
 spider:source("spider","Amazing Spider-Man Must-Reads","https://share.marvel.com/comics/discover/109/amazing-spider-man-must-reads","official-guide"),
 spider31:source("spider31","Start Here: Spider-Man","https://share.marvel.com/comics/discover/1130/start-here-spider-man","official-guide"),
 hela:source("hela","Hela — guia de leitura","https://latency.marvel.com/comics/discover/499/hela","official-guide"),
 planet:source("planet","Planet Hulk — lista de edições","https://share.marvel.com/comics/discover/376/planet-hulk","official-guide"),
 starters:source("starters","30 Comics to Start Reading Comics — Planet Hulk","https://www.marvel.com/comics/guides/2289/30_comics_to_start_reading_comics","official-guide"),
 wwh:source("wwh","World War Hulk — coleção","https://www.marvel.com/comics/collection/64697/hulk_world_war_hulk_omnibus_hc_trade_paperback"),
 oath:source("oath","Doctor Strange: The Oath","https://www.marvel.com/comics/collection/61780/doctor_strange_the_oath_-_lcsd_exclusive_2016"),
 triumph:source("triumph","Mephisto's Most Impactful Deals — Triumph and Torment","https://share.marvel.com/comics/discover/2503/mephistos-most-impactful-deals","official-guide"),
 panther:source("panther","Black Panther: Enemy of the State","https://www.marvel.com/comics/collection/1040/black_panther_vol_ii_enemy_of_the_state_trade_paperback"),
 priest:source("priest","Black Panther by Christopher Priest Omnibus Vol. 1","https://www.marvel.com/comics/collection/98743/black_panther_by_christopher_priest_omnibus_vol_1_hardcover"),
 widow:source("widow","Black Widow: The Finely Woven Thread","https://www.marvel.com/comics/issue/47946/black_widow_vol_1_the_finely_woven_thread_trade_paperback"),
 widow01:source("widow01","Yelena Belova — Black Widow (2001) #1","https://share.marvel.com/comics/discover/2490/yelena-belovas-most-traumatic-moments","official-guide"),
 hawkeye:source("hawkeye","Hawkeye: My Life as a Weapon","https://www.marvel.com/comics/guides/1828/hawkeye-my-life-as-a-weapon","official-guide"),
 tales:source("tales","Tales of Suspense: The Healing Begins","https://www.marvel.com/articles/comics/tales-of-suspense-the-healing-begins","official-guide"),
 wanda:source("wanda","Scarlet Witch: Witches’ Road","https://www.marvel.com/comics/collection/57095/scarlet_witch_vol_1_witches_road_trade_paperback"),
 door:source("door","Scarlet Witch (2023) #1","https://www.marvel.com/comics/issue/97133/scarlet-witch-2023-1"),
 quartet:source("quartet","Quicksilver Fast Facts — Avengers #16","https://www.marvel.com/articles/comics/pietro-maximoff-quicksilver-comics-history?linkId=112067650","official-guide"),
 wolverine:source("wolverine","Wolverine (1982) — minissérie","https://www.marvel.com/comics/series/2096/Wolverine_%281982%29"),
 wolverineBattle:source("wolverineBattle","Marvel Games Comic Connection: Wolverine — confronto com Shingen","https://www.marvel.com/amp/articles/games/marvel-games-comic-connection-wolverine","official-guide"),
 age:source("age","Age of Ultron — evento","https://www.marvel.com/comics/guides/87/age-of-ultron-the-complete-event.","official-guide"),
 born:source("born","Daredevil: Born Again — guia","https://www.marvel.com/comics/guides/1032/daredevil-born-again?pubDate=20250308","official-guide"),
 guardian:source("guardian","Guardian Devil — participantes e premissa","https://marvel.fandom.com/wiki/Guardian_Devil","secondary-analysis","Marvel Database / Fandom"),
 doom:source("doom","One World Under Doom — guia","https://share.marvel.com/comics/discover/2493/one-world-under-doom","official-guide"),
 gauntlet:source("gauntlet","Marvel Cosmic Events: Explained","https://www.marvel.com/articles/comics/marvel-cosmic-events-explained","official-guide"),
 quest:source("quest","Thanos Quest: Marvel Tales","https://www.marvel.com/comics/collection/92768/thanos_quest_marvel_tales_trade_paperback"),
 ultron:source("ultron","Ultron: The Living Automaton","https://share.marvel.com/comics/discover/188/ultron-the-living-automaton","official-guide"),
 loki:source("loki","Loki — história em quadrinhos","https://www.marvel.com/characters/loki/in-comics","official-guide"),
 lokiseries:source("lokiseries","Loki: Agent of Asgard (2014–2015)","https://www.marvel.com/comics/series/18340/loki_agent_of_asgard_2014_-_2015"),
 magneto:source("magneto","Magneto — guia oficial","https://share.marvel.com/comics/discover/1038/magneto","official-guide"),
 cube:source("cube","Cosmic Cube — Captain America","https://latency.marvel.com/comics/discover/745/cosmic-cube","official-guide"),
 goblin:source("goblin","Green Goblin — guia oficial","https://share.marvel.com/comics/discover/984/green-goblin","official-guide"),
 reign:source("reign","Devil’s Reign (2021) #1","https://www.marvel.com/comics/issue/96212/devil-s-reign-2021-1"),
 kang:source("kang","Kang the Conqueror — guia","https://share.marvel.com/comics/discover/1989/kang-the-conqueror","official-guide"),
 mysterio:source("mysterio","The Amazing Spider-Man #13 — registro GCD","https://www.comics.org/issue/18444/","secondary-analysis","Grand Comics Database"),
 killmonger:source("killmonger","Killmonger — guia oficial","https://share.marvel.com/comics/discover/904/killmonger","official-guide"),
 pantherRage:source("pantherRage","Sharing Stories by Marvel’s Black Storytellers — Panther's Rage","https://www.marvel.com/articles/comics/sharing-stories-by-marvel-s-black-storytellers","official-guide"),
 annual5:source("annual5","Iron Man Annual #5 — identidade e data","https://www.comics.org/issue/36836/","secondary-analysis","Grand Comics Database"),
 annual5Caution:source("annual5Caution","Iron Man Annual #5 — ressalva de agência","https://www.comicspriceguide.com/titles/iron-man-annual/5/pbvvh","secondary-analysis","Comics Price Guide"),
 winterfilm:source("winterfilm","Captain America: The Winter Soldier — sinopse","https://movies.disney.com/captain-america-the-winter-soldier","official-synopsis","Disney"),
 ragnarok:source("ragnarok","Thor: Ragnarok — sinopse","https://movies.disney.com/thor-ragnarok","official-synopsis","Disney"),
 helaMovie:source("helaMovie","Hela's Thor: Ragnarok Origins Explained — tomada do trono","https://comicbook.com/marvel/news/hela-origin-thor-ragnarok-spoilers/","secondary-analysis","ComicBook.com"),
 agefilm:source("agefilm","Avengers: Age of Ultron — sinopse","https://movies.disney.com/marvels-avengers-age-of-ultron","official-synopsis","Disney"),
 pantherfilm:source("pantherfilm","Black Panther — sinopse","https://movies.disney.com/black-panther","official-synopsis","Disney"),
 strangefilm:source("strangefilm","Doctor Strange — sinopse","https://movies.disney.com/doctor-strange","official-synopsis","Disney"),
 hawkeyetv:source("hawkeyetv","Hawkeye — parceria Clint/Kate","https://www.marvel.com/articles/tv-shows/save-the-city-hawkeye-avengers-rogers-musical-song","official-guide"),
 wandatv:source("wandatv","WandaVision — série e episódios","https://www.marvel.com/tv-shows/wandavision/1?cache=update1"),
 wandafinale:source("wandafinale","WandaVision: The Series Finale — recap","https://www.tvinsider.com/990060/wandavision-season-1-episode-9-finale-recap/","secondary-analysis","TV Insider","page-text"),
 logan:source("logan","Logan — sinopse oficial","https://www.20thcenturystudios.com/movies/logan","official-synopsis","20th Century Studios"),
 ddtv:source("ddtv","Marvel’s Daredevil — série de 2015","https://d23.com/a-to-z/marvels-daredevil-television/","official-synopsis","Disney / D23"),
 ddscreen:source("ddscreen","Daredevil — perfil audiovisual","https://www.marvel.com/characters/daredevil-matthew-murdock/on-screen","official-guide"),
};
const works:Work[]=[],evidence:TraitEvidence[]=[];
type EvidenceInput=[CharacterId,AxisId,"low"|"high",string,string,string[]?,Spoilers?];
function add(id:string,title:string,year:number,reference:string,sourceIds:string[],cast:[CharacterId,NarrativeRole][],traits:EvidenceInput[],settings:{type?:MediaType;continuity?:Continuity;spoilers?:Spoilers;storyKey?:string}={}){
 const spoilers=settings.spoilers??"premise";
 works.push({id,storyKey:settings.storyKey??id,type:settings.type??"comic",title,year,reference,continuity:settings.continuity??"comics-616",spoilers,review:"source-verified",externalIds:{},sources:sourceIds,
  links:sourceIds.map(sid=>{const src=sources.find(x=>x.id===sid)!;return {label:src.title,url:src.url,official:src.kind!=="secondary-analysis"};}),
  participants:cast.map(([characterId,role])=>({characterId,incarnation:ALLOWED_CHARACTERS[characterId]+(settings.continuity==="mcu" ? " — adaptação MCU" : settings.continuity==="fox-xmen" ? " — adaptação X-Men/Fox" : " — Terra-616"),role,sourceIds})),
 });
 traits.forEach(([characterId,axis,pole,manifestation,rationale,evidenceSources,evidenceSpoilers],i)=>evidence.push({id:`${id}:${characterId}:${axis}:${i}`,workId:id,characterId,axis,pole,manifestation,rationale,locator:reference,sourceIds:evidenceSources??sourceIds,review:"source-verified",spoilers:evidenceSpoilers??spoilers}));
}

// Each entry below is a paraphrase of the linked synopsis, followed by HeroAxes interpretation.
add("armor-wars","Iron Man: Armor Wars",1987,"Iron Man (1968), núcleo #225–230 do guia",[s.armor],[["iron-man","lead"]],[
 ["iron-man","autonomy","high","Tony recupera sua tecnologia apesar da oposição de governo, colegas e outros heróis.","Decidir por critérios próprios contra recomendações permite discutir autonomia; não significa aprovar seus métodos."],
]);
add("prime","Avengers Prime",2010,"Avengers Prime (2010) #1–5; manifestação confirmada em #5",[s.prime],[["iron-man","co-lead"],["captain-america","co-lead"],["thor","co-lead"],["hela","antagonist"]],[
 ["captain-america","cooperation","high","Steve, Tony e Thor unem forças contra Hela.","O enfrentamento conjunto depende de colaboração entre os três."],
 ["thor","cooperation","high","Thor enfrenta Hela ao lado de Steve e Tony.","A ação em conjunto é evidência de trabalho interdependente."],
 ["iron-man","risk","high","Tony participa da luta contra uma ameaça à existência dos Nove Reinos.","Entrar nesse confronto envolve aceitar perigo e incerteza elevados."],
]);
add("winter-soldier","Captain America: Winter Soldier",2004,"Captain America (2004) #1–6, recorte do guia",[s.winter],[["captain-america","lead"]],[
 ["captain-america","risk","high","Steve enfrenta um antigo companheiro transformado em um combatente aprimorado.","O confronto oferece um recorte de exposição ao perigo, não uma medida de coragem do usuário."],
]);
add("spider-astronauts","The Amazing Spider-Man #1",1963,"The Amazing Spider-Man (1963) #1",[s.spider],[["spider-man","lead"]],[
 ["spider-man","risk","high","Peter tenta salvar astronautas em uma nave com problemas.","O resgate exemplifica ação em condições incertas."],
 ["spider-man","empathy","high","Peter se volta a salvar uma tripulação em perigo.","O foco nas pessoas ameaçadas sustenta a leitura editorial de atenção aos outros."],
]);
add("spider-master-planner","The Amazing Spider-Man #31",1965,"The Amazing Spider-Man (1963) #31; início do arco do Master Planner",[s.spider31],[["spider-man","lead"]],[
 ["spider-man","risk","high","Peter persegue criminosos com carga nuclear enquanto sua tia está doente.","Enfrentar esse perigo permite discutir tolerância à incerteza, sem inferir todo o perfil a partir de uma aventura."],
]);
add("wolves-north","Thor: Wolves of the North",2010,"Thor: Wolves of the North (2010) #1",[s.hela],[["thor","lead"],["hela","antagonist"]],[
 ["thor","risk","high","Thor precisa negociar uma aliança para impedir Hela e proteger os asgardianos restantes.","Enfrentar a ameaça e depender de uma negociação incerta sustentam o recorte de risco."],
 ["hela","dominance","high","Hela ameaça eliminar os asgardianos após devastar Asgard.","O uso coercivo de poder é lido como imposição da própria vontade; não atribui violência ao usuário."],
]);
add("planet-hulk","Planet Hulk",2006,"Hulk (1999) #92–105 e Giant-Size Hulk (2006) #1, conforme o guia",[s.planet,s.starters],[["hulk","lead"]],[
 ["hulk","autonomy","high","Exilado em um planeta opressivo, Hulk busca sua liberdade.","A recusa da tutela imposta e a busca de um caminho próprio permitem discutir autonomia; o perigo imposto não foi tratado como prova de tolerância ao risco."],
]);
add("world-war-hulk","World War Hulk",2007,"World War Hulk #1–5; núcleo listado na coleção",[s.wwh],[["hulk","lead"]],[
 ["hulk","autonomy","high","Hulk retorna à Terra para confrontar os responsáveis por seu exílio.","Conduzir seu próprio confronto, em vez de aceitar a decisão imposta, permite discutir autonomia."],
 ["hulk","risk","high","Hulk enfrenta Iron Man, Strange e outros adversários poderosos.","A ofensiva contra vários oponentes é um recorte de aceitação de perigo."],
]);
add("oath","Doctor Strange: The Oath",2006,"Doctor Strange: The Oath (2006) #1–5",[s.oath],[["doctor-strange","lead"]],[
 ["doctor-strange","risk","high","Strange investiga um atentado e busca ajuda para um amigo, atravessando dimensões perigosas.","A investigação em ambientes explicitamente mortais fundamenta o recorte de risco."],
]);
add("triumph","Doctor Strange and Doctor Doom: Triumph and Torment",1989,"Graphic novel de 1989; sem numeração adicional atribuída",[s.triumph],[["doctor-strange","co-lead"],["doctor-doom","co-lead"]],[
 ["doctor-strange","risk","high","Strange entra no domínio de Mephisto com Doom para tentar libertar a mãe de Victor.","A incursão em território hostil sustenta a leitura de risco elevado."],
 ["doctor-doom","risk","high","Victor entra no domínio de Mephisto para tentar resgatar sua mãe.","A missão envolve incerteza e perigo; a obra não altera sua classificação no quiz."],
]);
add("panther-enemy","Black Panther: Enemy of the State",1999,"Black Panther Vol. II: Enemy of the State — coleção de 1999",[s.panther],[["black-panther","lead"]],[
 ["black-panther","empathy","high","T’Challa protege Wakanda contra quem pretende tomar o trono e explorar sua nação.","O foco na comunidade é um recorte de atenção ao impacto sobre os outros."],
],{storyKey:"panther-priest-initial"});
add("panther-priest","Black Panther by Christopher Priest — recorte inicial",1998,"Black Panther (1998) #1–33; descrito no Omnibus Vol. 1",[s.priest],[["black-panther","lead"]],[
 ["black-panther","strategy","high","T’Challa articula planos em uma trama política que inclui um golpe em Wakanda.","A sinopse destaca preparação estratégica; não confunde inteligência com planejamento."],
],{storyKey:"panther-priest-initial"});
add("widow-thread","Black Widow: The Finely Woven Thread",2014,"Black Widow (2014) #1–6 e material de All-New Marvel NOW! Point One #1",[s.widow],[["black-widow","lead"]],[
 ["black-widow","autonomy","high","Natasha conduz missões de reparação fora de suas atribuições nos Vingadores e na S.H.I.E.L.D.","Atuar por critérios próprios fora da aprovação das equipes demonstra direção própria."],
]);
add("widow-identity","Black Widow #1",2001,"Black Widow (2001) #1; Natasha, não a identidade de Yelena",[s.widow01],[["black-widow","lead"]],[
 ["black-widow","flexibility","high","Natasha muda a aparência para se passar por Yelena e enganar um inimigo.","Trocar a abordagem da operação é uma manifestação de revisão do método, não de moralidade."],
]);
add("hawkeye-weapon","Hawkeye: My Life as a Weapon",2012,"Hawkeye (2012) #1–5, recorte do guia",[s.hawkeye],[["hawkeye","lead"]],[
 ["hawkeye","cooperation","high","Clint divide suas aventuras com Kate Bishop.","A parceria ativa, destacada na sinopse, fundamenta colaboração."],
]);
add("tales100","Tales of Suspense #100",2017,"Tales of Suspense (2017) #100",[s.tales],[["hawkeye","co-lead"]],[
 ["hawkeye","cooperation","high","Clint e Bucky investigam mortes ligadas a Natasha, apesar de discordarem sobre os métodos.","Cooperação pode existir com atritos; o objetivo partilhado sustenta a relação editorial."],
],{spoilers:"major"});
add("witches-road","Scarlet Witch: Witches’ Road",2015,"Scarlet Witch (2015) #1–5; coleção publicada em 2016",[s.wanda],[["scarlet-witch","lead"]],[
 ["scarlet-witch","risk","high","Wanda viaja por diferentes regiões, enfrenta inimigos e investiga a ruptura da magia.","A investigação em contextos hostis oferece um recorte de aceitação de incerteza."],
]);
add("last-door","Scarlet Witch #1 — a Última Porta",2023,"Scarlet Witch (2023) #1",[s.door],[["scarlet-witch","lead"]],[
 ["scarlet-witch","empathy","high","Wanda oferece ajuda a pessoas sem ninguém a quem recorrer.","A atenção declarada ao sofrimento alheio sustenta empatia no recorte de reparação."],
]);
add("avengers16","Avengers #16 — nova formação",1965,"Avengers (1963) #16",[s.quartet],[["scarlet-witch","supporting"]],[
 ["scarlet-witch","cooperation","high","Wanda deixa a Irmandade e se junta à nova formação dos Vingadores.","Integrar uma equipe com objetivos compartilhados é um exemplo de cooperação."],
]);
add("wolverine-japan","Wolverine",1982,"Wolverine (1982) #1–4",[s.wolverine,s.wolverineBattle],[["wolverine","lead"]],[
 ["wolverine","risk","high","Logan enfrenta Lord Shingen no Japão.","Entrar no confronto oferece um recorte de exposição ao perigo, sem confundir honra com um eixo psicológico."],
]);
add("age-ultron","Age of Ultron",2013,"Age of Ultron (2013), evento de dez partes; guia de leitura",[s.age,s.ultron],[["ultron","antagonist"],["wolverine","co-lead"]],[
 ["ultron","dominance","high","Drones de Ultron patrulham e dominam as ruínas de Nova York.","O comando de um aparato de dominação é um exemplo extremo de controle concentrado na ficção."],
 ["wolverine","risk","high","Logan e a Mulher Invisível tentam uma missão temporal que pode comprometer a linha do tempo.","A missão envolve uma incerteza explicitamente descrita pela fonte."],
]);
add("born-again","Daredevil: Born Again",1986,"Daredevil (1964) #227–233; o guia também lista o prelúdio #226",[s.born],[["daredevil","lead"],["kingpin","antagonist"]],[
 ["kingpin","strategy","high","Fisk usa o segredo de Matt para atacar relações, carreira e condições de vida.","A ofensiva coordenada em várias frentes permite discutir preparação, sem aprovar os abusos."],
],{spoilers:"major"});
add("guardian-devil","Daredevil: Guardian Devil",1998,"Daredevil (1998) #1–8; revelar o antagonista é spoiler",[s.guardian],[["daredevil","lead"],["mysterio","antagonist"]],[
 ["daredevil","empathy","high","Matt tenta proteger um bebê em meio a crises que atingem seus amigos.","A proteção de uma pessoa vulnerável fundamenta a leitura de cuidado."],
 ["mysterio","strategy","high","Mysterio está associado à trama de crises pessoais e encenação religiosa contra Matt.","A encenação em várias frentes é lida como preparação; a referência revela o mistério do arco."],
],{spoilers:"major"});
add("one-world-doom","One World Under Doom",2025,"One World Under Doom (2025) #1–9, conforme o guia",[s.doom],[["doctor-doom","lead"]],[
 ["doctor-doom","dominance","high","Victor propõe proteger o mundo reunindo-o sob seu governo.","Subordinar o mundo a uma autoridade pessoal é uma manifestação de centralização."],
]);
add("infinity-gauntlet","Infinity Gauntlet",1991,"Infinity Gauntlet (1991), evento original",[s.gauntlet],[["thanos","antagonist"]],[
 ["thanos","dominance","high","Thanos usa a Manopla para impor sua vontade sobre a vida no universo.","O domínio unilateral permite discutir controle concentrado; a motivação não é importada do MCU."],
],{spoilers:"major"});
add("thanos-quest","Thanos Quest",1990,"Thanos Quest (1990) #1–2; fonte: reedição de 2021",[s.quest],[["thanos","lead"]],[
 ["thanos","strategy","high","Thanos percorre o cosmos para reunir as seis Joias antes da ofensiva com a Manopla.","Reunir recursos necessários à etapa seguinte constitui preparação antecipada."],
]);
add("ultron-imperative","Avengers: The Ultron Imperative",2001,"Avengers: The Ultron Imperative (2001) #1",[s.ultron],[["ultron","antagonist"]],[
 ["ultron","dominance","high","Os Vingadores enfrentam Ultron e as forças sob seu comando.","O comando de forças em uma ofensiva permite discutir centralização; não basta a presença de Ultron."],
]);
add("loki-asgard","Loki: Agent of Asgard",2014,"Loki: Agent of Asgard (2014) #1–17; perfil oficial descreve a reinvenção",[s.loki,s.lokiseries],[["loki","lead"]],[
 ["loki","flexibility","high","Loki rejeita o roteiro de seu futuro e se reinventa como Deus das Histórias.","Mudar o próprio curso e a forma de agir sustenta revisão de métodos e papéis."],
],{spoilers:"major"});
add("magneto-solo","Magneto #1",2014,"Magneto (2014) #1",[s.magneto],[["magneto","lead"]],[
 ["magneto","autonomy","high","Magneto deixa de ser peça na guerra de outro líder e age em seus próprios termos.","A fonte explicita direção própria; os métodos violentos não são atribuídos ao usuário."],
]);
add("magneto-rex","Magneto Rex #1",1999,"Magneto Rex (1999) #1",[s.magneto],[["magneto","lead"]],[
 ["magneto","dominance","high","Magneto assume o governo de Genosha em meio a uma guerra civil.","A soberania sob conflito oferece um recorte de decisões concentradas no governante."],
]);
add("redskull-cube","Captain America #115",1969,"Captain America (1968) #115",[s.cube],[["red-skull","antagonist"],["captain-america","lead"]],[
 ["red-skull","dominance","high","Caveira Vermelha planeja tomar o mundo usando o Cubo Cósmico.","O objetivo de domínio total é controle concentrado extremo na ficção."],
]);
add("redskull-preparation","Captain America #1 — o Cubo Cósmico",2004,"Captain America (2004) #1",[s.cube],[["red-skull","antagonist"]],[
 ["red-skull","strategy","high","Caveira Vermelha prepara um ataque contra Steve e seu país.","A sinopse descreve preparação antes da ofensiva, não apenas uma aparição."],
],{storyKey:"winter-soldier"});
add("dark-avengers","Dark Avengers #1",2009,"Dark Avengers (2009) #1",[s.goblin],[["green-goblin","lead"]],[
 ["green-goblin","dominance","high","Norman Osborn assume as rédeas do poder após a Invasão Secreta.","A autoridade concentrada é o traço considerado; trata-se de Norman, não de Harry."],
]);
add("siege","Siege #1",2010,"Siege (2010) #1",[s.goblin],[["green-goblin","antagonist"]],[
 ["green-goblin","dominance","high","Osborn ataca Asgard para remover o obstáculo ao controle total.","A fonte explicita o objetivo de concentrar poder; isso não julga o usuário."],
]);
add("devils-reign","Devil’s Reign #1",2021,"Devil’s Reign (2021) #1",[s.reign],[["kingpin","antagonist"]],[
 ["kingpin","dominance","high","Fisk combina poder político e criminal e comanda vilões contra os heróis.","A concentração dos instrumentos de poder sustenta centralização."],
 ["kingpin","strategy","high","Fisk prepara sua ofensiva contra os heróis por anos.","A preparação antes do ataque é destacada pela sinopse."],
]);
add("kang-origin","Kang the Conqueror #1",2021,"Kang the Conqueror (2021) #1",[s.kang],[["kang","lead"]],[
 ["kang","strategy","high","Um Kang mais velho conduz sua versão jovem por um caminho escolhido para seu futuro.","A orientação de acontecimentos futuros é lida como preparação, sem agregar variantes ao quiz."],
]);
add("kang-moonknight","Moon Knight Annual #1",2019,"Moon Knight Annual (2019) #1",[s.kang],[["kang","antagonist"]],[
 ["kang","dominance","high","Kang tenta reescrever a história à sua própria imagem.","Impor uma vontade à história permite discutir controle concentrado."],
]);
add("mysterio13","The Amazing Spider-Man #13 — Mysterio",1964,"The Amazing Spider-Man (1963) #13; Quentin Beck",[s.mysterio],[["mysterio","antagonist"]],[
 ["mysterio","strategy","high","Beck arma crimes para incriminar Spider-Man antes de desafiá-lo.","Preparar a acusação antes do confronto sustenta planejamento, sem associar o usuário a fraude."],
]);
add("killmonger-origin","Killmonger #1",2018,"Killmonger (2018) #1",[s.killmonger],[["killmonger","lead"]],[
 ["killmonger","strategy","high","N’Jadaka se prepara para transformar sua vingança em uma ofensiva contra o Pantera.","O treinamento para um objetivo futuro permite discutir preparação antecipada."],
]);
add("killmonger-plot","Iron Man Annual #5",1982,"Iron Man Annual (1976) #5; agência do corpo de Killmonger sob ressalva",[s.killmonger,s.annual5,s.annual5Caution],[["killmonger","antagonist"],["iron-man","co-lead"],["black-panther","co-lead"]],[]);
works.find(w=>w.id==="killmonger-plot")!.review="rejected";
add("panthers-rage","Panther’s Rage",1973,"Jungle Action (1972), arco Panther’s Rage; introdução de Killmonger em #6",[s.killmonger,s.pantherRage],[["killmonger","antagonist"],["black-panther","lead"]],[
 ["killmonger","dominance","high","Killmonger dirige sua ofensiva contra o trono de Wakanda.","O objetivo de substituir a autoridade vigente por seu próprio comando sustenta centralização no antagonista, não um juízo sobre o usuário."],
]);

// Adaptations are not interchangeable with the quiz's comics continuity.
add("winter-film","Captain America: The Winter Soldier",2014,"Longa de 2014; parceria descrita na sinopse",[s.winterfilm],[["captain-america","lead"],["black-widow","co-lead"]],[
 ["captain-america","cooperation","high","Steve e Natasha unem forças para expor uma conspiração.","O objetivo comum exige trabalho conjunto, também presente no recorte em quadrinhos."],
 ["black-widow","risk","high","Natasha investiga com Steve enquanto é perseguida por agentes enviados para silenciá-los.","A operação sob ameaça é um recorte de aceitação de perigo; não transfere a biografia do MCU ao quiz."],
],{type:"movie",continuity:"mcu"});
add("ragnarok-film","Thor: Ragnarok",2017,"Longa de 2017; arena e tomada de Asgard",[s.ragnarok,s.helaMovie],[["thor","lead"],["hulk","co-lead"],["hela","antagonist"]],[
 ["thor","risk","high","Thor precisa sobreviver à arena e retornar para impedir a destruição de Asgard.","A exposição ao confronto e à incerteza motiva esta sugestão.",[s.ragnarok]],
 ["hulk","risk","high","Hulk enfrenta Thor no combate de gladiadores descrito na premissa.","A arena oferece um recorte de perigo; não é a mesma fase editorial do quiz.",[s.ragnarok]],
 ["hela","dominance","high","Hela toma o trono de Asgard e pretende expandir seu domínio.","A concentração de autoridade, e não a simples violência, fundamenta o traço; a genealogia MCU difere dos quadrinhos.",[s.helaMovie],"major"],
],{type:"movie",continuity:"mcu"});
add("age-film","Avengers: Age of Ultron",2015,"Longa de 2015; projeto de Ultron descrito na sinopse",[s.agefilm],[["ultron","antagonist"],["iron-man","co-lead"]],[
 ["ultron","dominance","high","Ultron pretende impor sua versão de paz por meio de extinção em massa.","Decidir unilateralmente o destino dos outros é controle concentrado; não associa o usuário a atrocidades."],
],{type:"movie",continuity:"mcu"});
add("panther-film","Black Panther",2018,"Longa de 2018; T’Challa, não Shuri",[s.pantherfilm],[["black-panther","lead"],["killmonger","antagonist"]],[
 ["black-panther","cooperation","high","T’Challa reúne aliados para proteger sua nação em meio à traição e ao conflito.","A coordenação com aliados sustenta cooperação."],
 ["black-panther","empathy","high","T’Challa luta pela segurança de seu povo.","O foco na comunidade permite explorar atenção ao impacto sobre os outros."],
],{type:"movie",continuity:"mcu"});
add("strange-film","Doctor Strange",2016,"Longa de 2016; sinopse de Kamar-Taj",[s.strangefilm],[["doctor-strange","lead"]],[
 ["doctor-strange","flexibility","high","O cirurgião procura uma cura e encontra a prática da magia em Kamar-Taj.","Trocar a abordagem exclusivamente médica por outro caminho sustenta revisão do método, não um juízo sobre medicina."],
],{type:"movie",continuity:"mcu"});
add("hawkeye-tv","Hawkeye",2021,"Temporada 1; parceria da série, sem atribuir cena a episódio não verificado",[s.hawkeyetv],[["hawkeye","lead"]],[
 ["hawkeye","cooperation","high","Clint divide a ação com a arqueira Kate Bishop.","A parceria ativa sustenta o traço; o quiz se refere a Clint, não a Kate."],
],{type:"series",continuity:"mcu"});
add("wandavision","WandaVision",2021,"Temporada 1, episódio 9: The Series Finale",[s.wandatv,s.wandafinale],[["scarlet-witch","lead"]],[
 ["scarlet-witch","flexibility","high","Wanda aplica as runas que aprendeu para mudar sua abordagem contra Agatha.","A adaptação ao aprendizado recente fundamenta flexibilidade; a evidência é de uma adaptação MCU."],
 ["scarlet-witch","empathy","high","Wanda ouve o sofrimento dos moradores e, ao final, desfaz o Hex e lamenta o dano causado.","Reconhecer o impacto sobre outras pessoas fundamenta apenas esse momento; não apaga a coerção anterior."],
],{type:"series",continuity:"mcu",spoilers:"major"});
add("logan-film","Logan",2017,"Longa de 2017; sinopse oficial",[s.logan],[["wolverine","lead"]],[
 ["wolverine","empathy","high","Logan cuida de um Professor Xavier debilitado.","O cuidado concreto com outra pessoa sustenta empatia, em uma continuidade audiovisual distinta."],
],{type:"movie",continuity:"fox-xmen"});
add("daredevil-tv","Marvel’s Daredevil",2015,"Série iniciada em 2015; confronto Matt/Fisk no perfil oficial",[s.ddtv,s.ddscreen],[["daredevil","lead"],["kingpin","antagonist"]],[
 ["daredevil","empathy","high","Matt enfrenta injustiças como advogado e vigilante em Hell’s Kitchen.","O foco em proteger pessoas do bairro sustenta atenção aos outros, sem atribuir seus métodos ao usuário."],
 ["kingpin","strategy","high","Fisk articula nos bastidores uma operação que ameaça partes de Hell’s Kitchen.","O comando oculto de uma operação estruturada permite discutir planejamento."],
],{type:"series",continuity:"mcu"});

// Only verified URL identifiers are populated; TMDB and ISBN are never guessed.
for(const work of works){
 const url=work.links.find(l=>l.official)?.url;
 const match=url?.match(/\/comics\/(issue|collection|series)\/(\d+)/);
 if(match)work.externalIds.marvel=match[1]+":"+match[2];
}
export const RECOMMENDATION_CATALOG:RecommendationCatalog={
 version:"marvel-stories-1.0.0",
 supportedModels:[{algorithm:"weighted-rms-1.0.0",questionnaire:"behavioral-1.1.0",catalog:"marvel-616-editorial-1.0.1"}],
 sources,works,evidence,
 pending:[
  {characterId:"doctor-doom",media:"movie",candidateTitle:"Avengers: Doomsday",reason:"Ainda não lançado na data da curadoria; divulgação e elenco não verificam traços narrativos."},
  {characterId:"iron-man",media:"movie",candidateTitle:"Iron Man (2008)",reason:"Falta registrar fonte narrativa específica que sustente o traço, além da premissa conhecida."},
  {characterId:"thanos",media:"movie",candidateTitle:"Avengers: Infinity War",reason:"Revisar referências sem transportar a motivação MCU aos quadrinhos."},
  {characterId:"red-skull",media:"movie",candidateTitle:"Captain America: The First Avenger",reason:"Falta evidência narrativa específica por eixo nesta curadoria."},
  {characterId:"green-goblin",media:"movie",candidateTitle:"Spider-Man (2002)",reason:"Verificar fonte narrativa, continuidade Sony, Norman e spoilers antes de recomendar."},
  {characterId:"mysterio",media:"movie",candidateTitle:"Spider-Man: Far From Home",reason:"Necessita referência oficial da obra e revisão de spoilers do antagonista."},
  {characterId:"magneto",media:"movie",candidateTitle:"X-Men: First Class",reason:"Verificar narrativa e distinguir adaptação Fox de MCU e Terra-616."},
  {characterId:"kang",media:"movie",candidateTitle:"Ant-Man and the Wasp: Quantumania",reason:"Falta verificar manifestação do traço, além de presença no elenco."},
  {characterId:"loki",media:"series",candidateTitle:"Loki",reason:"Revisão específica da temporada/episódio e manifestação do traço pendente."},
  {characterId:"hela",media:"comic",reason:"Segunda HQ com evidência por eixo pendente; presença em Avengers Prime não basta."},
  {characterId:"loki",media:"comic",reason:"Segunda HQ sem sobreposição com Agent of Asgard e com evidência por eixo pendente."},
  {characterId:"black-panther",media:"comic",reason:"Coleções de Priest se sobrepõem; uma segunda história independente precisa de curadoria."},
  {characterId:"killmonger",media:"movie",candidateTitle:"Black Panther",reason:"Participação confirmada, mas falta evidência por eixo nesta versão; não recomendar só por aparição."},
  {characterId:"spider-man",media:"movie",reason:"Falta curadoria audiovisual com Peter Parker e traço verificável."},
  {characterId:"killmonger",media:"comic",candidateTitle:"Iron Man Annual #5",reason:"Excluída da seleção: há referência a corpo/LMD manipulado pelo Mandarim; não usar o plano como evidência de agência de Erik."},
  {characterId:"daredevil",media:"comic",candidateTitle:"Born Again",reason:"Obra confirmada para Fisk; o perigo imposto a Matt não basta para recomendar tolerância ao risco. Falta evidência por eixo para Matt."},
  {characterId:"mysterio",media:"comic",candidateTitle:"Guardian Devil",reason:"Associação como antagonista confirmada, mas a demonstração específica de planejamento requer fonte mais detalhada que a premissa consultada."},
 ],
};
// A character credit alone does not verify the detailed manifestation of a trait.
for(const e of evidence)if(e.workId==="guardian-devil" && e.characterId==="mysterio")e.review="pending";
function freezeDeep<T>(value:T):T {
 if(value && typeof value==="object" && !Object.isFrozen(value)){
  Object.values(value).forEach(freezeDeep);Object.freeze(value);
 }
 return value;
}
freezeDeep(RECOMMENDATION_CATALOG);
