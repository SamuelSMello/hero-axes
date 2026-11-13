import { AXES, type AxisId } from "./axes.ts";
export const QUESTIONNAIRE_VERSION = "behavioral-1.1.0";
export type Mode = "quick" | "full";
export type Answer = 1 | 2 | 3 | 4 | 5;
export type Question = {
  id: string; axis: AxisId; core: boolean; polarity: 1 | -1; weight: number;
  format: "bipolar-5"; text: string; left: string; right: string;
};
type Draft = [string, string, string, 1 | -1];
// Five concrete trade-offs per axis. The first two form the quick mode.
// Polarity describes increasing response 1 -> 5, not whether an answer is desirable.
const drafts: Record<AxisId, Draft[]> = {
 strategy: [
  ["Você tem uma tarde para organizar uma mudança. Como começa?", "Começo pelas caixas disponíveis e decido no percurso.", "Faço uma sequência de tarefas e separo materiais antes de começar.", 1],
  ["Uma entrega tem prazo curto e requisitos conhecidos. Qual abordagem você escolhe?", "Reservo o início para mapear etapas e dependências.", "Inicio uma parte viável e organizo o restante à medida que avanço.", -1],
  ["Você vai conduzir uma reunião com decisões difíceis.", "Uso a conversa para descobrir o caminho.", "Preparo uma pauta com cenários e pontos de decisão.", 1],
  ["Você planeja um passeio com três paradas flexíveis, sem reservas obrigatórias.", "Defino a ordem e alternativas de percurso antes de sair.", "Escolho a primeira parada e decido as outras ao longo do passeio.", -1],
  ["Você tem três pequenas tarefas domésticas independentes e tempo suficiente para todas.", "Começo pela que chama minha atenção e escolho a próxima ao terminar.", "Defino a ordem das três antes de começar.", 1],
 ],
 empathy: [
  ["Uma pessoa recusa sua proposta, mas não explica por quê. Seu próximo passo?", "Peço critérios objetivos para ajustar a proposta.", "Pergunto como a proposta afeta a experiência dela.", 1],
  ["Você precisa dar um retorno sobre um trabalho que não funcionou.", "Procuro entender como a pessoa recebeu o problema antes dos detalhes.", "Começo pelas falhas observáveis e pelos ajustes necessários.", -1],
  ["Um colega fica calado depois de uma mudança de função.", "Dou espaço e sigo tratando das tarefas.", "Convido a pessoa a falar de como viveu a mudança.", 1],
  ["Há duas soluções de custo semelhante para reorganizar uma sala.", "Investigo como cada pessoa se sente usando o espaço.", "Comparo o uso e a eficiência de cada disposição.", -1],
  ["Um amigo adia um compromisso importante para vocês.", "Busco renegociar data e condições.", "Primeiro tento compreender o que está acontecendo com ele.", 1],
 ],
 autonomy: [
  ["Você recebe uma tarefa nova sem instruções detalhadas.", "Peço um exemplo e confirmo a direção antes de agir.", "Defino uma abordagem própria e começo.", 1],
  ["Há dois cursos adequados para sua próxima etapa profissional.", "Escolho com base no meu próprio critério.", "Busco a recomendação de alguém experiente para decidir.", -1],
  ["Você já sabe executar uma tarefa rotineira e pode escolher como conduzi-la.", "Uso o procedimento recomendado e confirmo ajustes com alguém.", "Defino meus ajustes e avalio o resultado sem pedir direção.", 1],
  ["Você é responsável por uma etapa e duas prioridades igualmente viáveis entram em conflito.", "Escolho a prioridade com meu próprio critério e comunico a decisão.", "Peço a uma pessoa de referência que indique qual prioridade seguir.", -1],
  ["Uma instrução permite várias interpretações, todas aceitáveis.", "Confirmo qual interpretação esperam de mim.", "Escolho a interpretação que considero mais adequada.", 1],
 ],
 impulsivity: [
  ["Você lê uma mensagem que parece criticar seu trabalho.", "Espero alguns minutos e releio antes de responder.", "Respondo assim que termino de ler.", 1],
  ["Uma oferta inesperada aparece enquanto você já tem um plano.", "Mudo de direção se a ideia me entusiasmar no momento.", "Dou um intervalo antes de decidir se mudo o plano.", -1],
  ["Durante uma conversa, você tem uma ideia que muda o assunto.", "Anoto e espero avaliar se cabe naquele momento.", "Coloco a ideia na conversa imediatamente.", 1],
  ["Uma atualização muda uma função que você usa todos os dias e isso incomoda.", "Altero de imediato as configurações para desfazer o que me incomodou.", "Uso a função por um tempo antes de decidir se altero as configurações.", -1],
  ["Você recebe um convite de última hora para a noite.", "Verifico energia e compromissos antes de responder.", "Aceito ou recuso pela minha reação imediata.", 1],
 ],
 dominance: [
  ["Duas pessoas da equipe preferem caminhos diferentes e o prazo está próximo.", "Proponho que a decisão seja dividida entre quem executará.", "Assumo a decisão final para manter uma direção única.", 1],
  ["Você coordena uma atividade com voluntários experientes.", "Peço que decisões importantes passem por mim.", "Delego decisões e aceito abordagens diferentes da minha.", -1],
  ["Um projeto que você iniciou cresceu e ganhou novos participantes.", "Distribuo a definição das prioridades entre os participantes.", "Mantenho comigo a definição das prioridades.", 1],
  ["Você organiza um evento e recebe sugestões incompatíveis.", "Defino a programação final depois de ouvir as sugestões.", "Deixo cada grupo decidir sua parte da programação.", -1],
  ["Sua equipe pode escolher como gastar um recurso compartilhado.", "Prefiro uma decisão negociada com responsabilidade distribuída.", "Prefiro que uma pessoa tenha a palavra final e responda por ela.", 1],
 ],
 cooperation: [
  ["Duas tarefas podem ser feitas em dupla ou separadamente, com esforço parecido.", "Divido em partes independentes para cada um trabalhar sozinho.", "Trabalho em conjunto para ajustar as partes durante a execução.", 1],
  ["Você estuda um assunto novo e tem acesso a colegas interessados.", "Organizo um grupo para construir o entendimento junto.", "Estudo sozinho e comparo conclusões no final.", -1],
  ["Você prepara uma apresentação com outra pessoa.", "Cada um prepara seu trecho e combinamos uma revisão no final.", "Construímos e revisamos a apresentação juntos.", 1],
  ["Você pode resolver um problema sozinho ou com um parceiro, no mesmo prazo.", "Prefiro trocar tentativas ao longo de todo o processo.", "Prefiro conduzir sozinho e apresentar a solução pronta.", -1],
  ["Um grupo começa um projeto criativo sem divisão de papéis.", "Sugiro frentes separadas com pouca dependência entre elas.", "Sugiro etapas conjuntas com decisões frequentes em grupo.", 1],
 ],
 risk: [
  ["Duas rotas chegam a um passeio: uma conhecida e outra pouco documentada.", "Escolho a conhecida, com duração previsível.", "Escolho a pouco conhecida pela possibilidade de descobrir algo.", 1],
  ["Você pode testar uma ferramenta nova em uma tarefa sem consequências graves.", "Experimento mesmo sem saber se vou ganhar tempo.", "Uso a ferramenta conhecida para evitar imprevistos.", -1],
  ["Você reserva uma pequena quantia só para lazer.", "Prefiro uma atividade cuja qualidade já conheço.", "Tento uma atividade desconhecida que pode surpreender ou decepcionar.", 1],
  ["Duas tarefas têm o mesmo prazo e benefício esperado, mas resultados com previsibilidade diferente.", "Escolho a de resultado variável, que pode ficar acima ou abaixo do esperado.", "Escolho a de resultado estável, próximo do esperado.", -1],
  ["Você tem uma hora livre em uma cidade nova.", "Visito um local que pesquisei e sei que estará aberto.", "Exploro uma região sem roteiro, aceitando não encontrar nada interessante.", 1],
 ],
 flexibility: [
  ["No meio de uma tarefa, aparece um método diferente com indícios de ser útil.", "Concluo o método atual para manter a continuidade.", "Testo o novo método e considero mudar.", 1],
  ["Seu grupo tem uma rotina que funciona, mas alguém sugere outra.", "Proponho um teste para comparar as duas.", "Mantenho a rotina até existir um problema concreto.", -1],
  ["Um dado novo enfraquece parte de uma hipótese que você usa.", "Preservo a hipótese enquanto procuro mais evidências.", "Reformulo provisoriamente a hipótese com o dado novo.", 1],
  ["Uma reunião muda de objetivo porque surgiu uma necessidade diferente.", "Reorganizo minha contribuição para o novo objetivo.", "Tento concluir o objetivo original antes de mudar.", -1],
  ["Você revisita uma opinião após uma experiência inesperada.", "Espero observar o padrão se repetir antes de revisá-la.", "Ajusto minha opinião agora e aceito revisá-la novamente depois.", 1],
 ],
};
export function validateQuestions(input: readonly Question[]): void {
 if (input.length !== 40 || new Set(input.map(q => q.id)).size !== 40) throw new Error("São necessárias 40 perguntas únicas");
 for (const q of input) {
  if (!AXES.some(a => a.id === q.axis) || ![1,-1].includes(q.polarity) ||
      !Number.isFinite(q.weight) || q.weight <= 0 || typeof q.core !== "boolean" ||
      q.format !== "bipolar-5" || !q.id || !q.text?.trim() || !q.left?.trim() || !q.right?.trim() ||
      q.left === q.right) throw new Error("Pergunta inválida");
 }
 for (const axis of AXES) {
  const items = input.filter(q => q.axis === axis.id);
  if (items.length !== 5 || items.filter(q => q.core).length !== 2 ||
      new Set(items.filter(q => q.core).map(q => q.polarity)).size !== 2)
    throw new Error("Cada eixo precisa de duas fundamentais de polaridade oposta e três adicionais");
 }
 if (input.slice(0,16).some(q => !q.core) || input.slice(16).some(q => q.core))
  throw new Error("As 16 fundamentais devem abrir o modo completo");
}
export const QUESTIONS: readonly Question[] = Object.freeze(
 [0,1,2,3,4].flatMap(round => AXES.map(axis => {
  const [text, left, right, polarity] = drafts[axis.id][round];
  return Object.freeze({
   id: axis.id + "-" + (round + 1), axis: axis.id, core: round < 2,
   polarity, weight: 1, format: "bipolar-5" as const, text, left, right,
  });
 }))
);
validateQuestions(QUESTIONS);
export function questionsFor(mode: Mode): readonly Question[] {
 if (mode !== "quick" && mode !== "full") throw new Error("Modo inválido");
 return mode === "quick" ? QUESTIONS.slice(0,16) : QUESTIONS;
}
export function answerOptions(q: Question): readonly {value: Answer; label: string}[] {
 return [
  {value:1,label:"A — " + q.left}, {value:2,label:"Mais próximo de A"},
  {value:3,label:"Entre A e B, sem preferência predominante"},
  {value:4,label:"Mais próximo de B"}, {value:5,label:"B — " + q.right},
 ];
}
