# Sprint 3 — experiência real e confiabilidade

Continuação: [Sprint 4A — interpretação, distribuição e segurança](SPRINT4A.md). O relato de sete vulnerabilidades abaixo é histórico; os audits atuais e seus limites estão documentados nessa continuação.

Data: 2026-11-12. Base inspecionada: docs/AUDIT.md, docs/CATALOG.md, docs/QUESTIONNAIRE.md, os quatro módulos de domínio, página real, CSS e 20 testes existentes.

## Diagnóstico confirmado

1. Progresso, seleção atual e snapshots existiam só em memória; atualizar perdia a sessão.
2. Os 24 perfis eram alcançáveis como vetores, mas faltava provar alcance com respostas realizáveis na resolução dos modos. A síntese antiga de testes arredondava cada resposta a 25 pontos, sem explorar os incrementos de 12,5 (rápido) e 5 (completo).
3. O catálogo concentra autonomia em 75–98 e tolerância ao risco em 45–95. Nenhum personagem representa bem a combinação de forte busca de orientação e baixo risco.
4. O perfil neutro tem Feiticeira Escarlate em primeiro (77,9206%); não significa certeza nem uma caracterização neutra da personagem. É a menor distância entre os perfis disponíveis.
5. Algumas justificativas confundiam construtos: improvisação com impulsividade, resolução sob pressão com planejamento, imposição de limites com centralização, retenção de conhecimento com retenção de decisões.
6. Sete perguntas adicionais tinham problemas suficientemente claros para correção. As 16 fundamentais foram mantidas byte a byte em sua representação JSON, com teste de hash, preservando ordem, IDs, alternativas, polaridades e pesos.

Não foi encontrada randomização na seleção de personagens. Não foi alterado nenhum valor numérico de personagem, peso ou fórmula para modificar frequências.

## Revisão das 40 perguntas

A classificação abaixo é revisão editorial, não resultado de validação com participantes. “Mantida” significa ausência de motivo claro para editar nesta sprint; não significa ausência de viés.

|Item / eixo|Decisão e observação|
|---|---|
|strategy-1|Mantida: organização concreta, polos com ações distintas.|
|empathy-1|Mantida: prioridade por experiência alheia versus critérios; possível efeito de estilo de comunicação.|
|autonomy-1|Mantida: orientação versus direção própria; familiaridade com a tarefa ainda pode influenciar.|
|impulsivity-1|Mantida: intervalo antes da reação, sem trocar risco por velocidade.|
|dominance-1|Mantida: decisão compartilhada versus final centralizada; urgência pode favorecer centralização.|
|cooperation-1|Mantida: mesmo esforço nos dois formatos, contrapõe trabalho independente e conjunto.|
|risk-1|Mantida: previsibilidade versus exploração; também pode refletir curiosidade.|
|flexibility-1|Mantida: mudança de método versus continuidade; custo do teste é limitação contextual.|
|strategy-2|Mantida: preparação versus organização durante execução; prazo é contextual.|
|empathy-2|Mantida: ordem de prioridades no feedback; não mede toda a empatia.|
|autonomy-2|Mantida: escolha por critério próprio versus recomendação; experiência profissional pode influenciar.|
|impulsivity-2|Mantida: entusiasmo imediato versus intervalo; cenário complementa reação a crítica.|
|dominance-2|Mantida: voluntários experientes tornam delegação plausível; polaridade invertida correta.|
|cooperation-2|Mantida: construção conjunta versus estudo independente; cenário distinto de execução de tarefas.|
|risk-2|Mantida: experiência sem consequência grave versus previsibilidade; mede risco cotidiano, não físico.|
|flexibility-2|Mantida: teste de uma nova rotina versus preservação; pode sofrer desejabilidade por inovação.|
|strategy-3|Mantida: reunião complementa organização material; ainda pertence ao contexto profissional.|
|empathy-3|Mantida com ressalva: dar espaço também pode ser empático; o eixo registra prioridade expressa, não competência afetiva.|
|autonomy-3|Corrigida: atividade rotineira já conhecida, reduz confundimento entre autonomia e necessidade de aprender uma tarefa nova.|
|impulsivity-3|Mantida com ressalva: intervenção imediata pode refletir extroversão; não usada isoladamente para diagnóstico.|
|dominance-3|Mantida: centralização explícita de prioridades ao crescer o grupo.|
|cooperation-3|Corrigida: revisão final combinada em vez de juntar perto do prazo, reduzindo a impressão de que trabalho separado é descuidado.|
|risk-3|Mantida: custo limitado e resultados possíveis explícitos; amplia contexto fora do trabalho.|
|flexibility-3|Mantida: evidência nova versus manutenção provisória, sem declarar uma resposta correta.|
|strategy-4|Corrigida: passeio com paradas flexíveis e sem reservas; elimina vantagem óbvia de planejar conexões obrigatórias.|
|empathy-4|Mantida com ressalva: emoção versus eficiência são parcialmente compatíveis; preferência de prioridade, não exclusão mútua.|
|autonomy-4|Corrigida: prioridades igualmente viáveis em uma etapa já atribuída; mede fonte da decisão, não iniciativa ou indefinição de papel.|
|impulsivity-4|Corrigida: alteração de configurações imediata versus após experimentar; deixa de depender de publicar opiniões.|
|dominance-4|Mantida: decisão final concentrada versus distribuída entre grupos; contexto diferente de gestão de equipe.|
|cooperation-4|Mantida: mesmo prazo nos dois formatos; troca contínua versus solução independente.|
|risk-4|Corrigida: mesmo prazo e benefício esperado; remove aprendizado extra como vantagem exclusiva da alternativa incerta.|
|flexibility-4|Mantida: reorganização frente a novo objetivo; urgência e autoridade da mudança podem influenciar.|
|strategy-5|Corrigida: tarefas domésticas independentes e tempo suficiente; reduz repetição de projetos com dependências e oferece duas ordens viáveis.|
|empathy-5|Mantida: relação pessoal complementa contextos de equipe; negociação e compreensão não são mutuamente exclusivas.|
|autonomy-5|Mantida: interpretações aceitáveis limitam risco de a resposta própria parecer descumprimento.|
|impulsivity-5|Mantida: convite cotidiano amplia variedade; disponibilidade real pode influenciar.|
|dominance-5|Mantida: recurso compartilhado e responsabilidade final; ambos os polos têm custos.|
|cooperation-5|Mantida: frentes independentes versus interdependência criativa; ainda compartilha construto com itens 1/3/4.|
|risk-5|Mantida: exploração de baixo impacto; pode se correlacionar com planejamento e curiosidade.|
|flexibility-5|Mantida: revisão provisória versus aguardar repetição; não equivale a medir verdade ou inteligência.|

Cada eixo continua com duas fundamentais (uma em cada polaridade) e três adicionais. As cinco respostas continuam 1–5, com normalização e inversão anteriores. A versão passou de behavioral-1.0.0 para behavioral-1.1.0. IDs e progressão 16/40 foram preservados.

## Revisão editorial dos 24 perfis

A revisão verifica coerência interna entre número, justificativa e recorte Terra-616 já declarado; não é conferência exaustiva de histórias, nem validação oficial Marvel.

|Personagem|Conclusão da revisão|
|---|---|
|Homem de Ferro|Números mantidos; justificativa de impulsividade agora fala de reagir antes de ponderar, não de improvisar.|
|Capitão América|Mantido: liderança cooperativa não equivale a baixa autonomia; recorte Steve Rogers exclui Hydra.|
|Homem-Aranha|Números mantidos; planejamento passa a combinar preparação técnica com decisão no momento, sem usar pressão como evidência isolada.|
|Thor|Mantido: orgulho guerreiro e pertencimento sustentam impulsividade/cooperação; recorte de amadurecimento explícito.|
|Hulk|Números mantidos; centralização fala de impor a própria decisão, não apenas de defender limites; persona raivosa protetora delimitada.|
|Doutor Estranho|Números mantidos; centralização fala de reter decisões estratégicas, não simplesmente conhecimento.|
|Pantera Negra|Mantido: planejamento e responsabilidade régia coexistem com alianças; não confundido com mera agressividade.|
|Viúva Negra|Mantido: reparação, empatia reservada, autonomia operacional e cooperação seletiva.|
|Gavião Arqueiro|Mantido: contestação de autoridade e lealdade de equipe são compatíveis com autonomia/cooperatividade elevadas.|
|Feiticeira Escarlate|Mantido: recorte de reparação, laços afetivos e variabilidade; não representa toda fase de crise ou coerção.|
|Wolverine|Mantido: protetor/mentor com métodos violentos; autonomia alta não implica centralização alta.|
|Demolidor|Mantido: compromisso local, risco e rigidez de código; a classificação não elimina transgressões.|
|Doutor Destino|Mantido: antagonista soberano, controle concentrado e alianças limitadas; fases de aliado não universalizadas.|
|Thanos|Mantido: obsessão nos quadrinhos, sem importar a motivação populacional do MCU.|
|Ultron|Mantido: antagonista sintético; organização de subordinados não é cooperação compartilhada.|
|Loki|Mantido com ressalva: fase de mudança explicitamente anti-heroica; classificações variam por arco.|
|Magneto|Mantido com ressalva: empatia seletiva não equivale a empatia universal; aliado/antagonista depende do arco.|
|Caveira Vermelha|Mantido: rigidez e coerção do antagonista; não representa julgamento moral ou clínico do participante.|
|Duende Verde|Mantido: Norman, sem mistura com Harry; impulsividade alta pode coexistir com preparação de planos.|
|Rei do Crime|Mantido: Wilson Fisk; cuidado privado seletivo não implica empatia geral elevada.|
|Kang|Mantido: identidade conquistadora delimitada, sem agregar variantes como identidades independentes.|
|Hela|Mantido: soberana de Hel nos quadrinhos; genealogia do MCU explicitamente excluída.|
|Mystério|Mantido: Quentin Beck; flexibilidade de artifícios não implica flexibilidade de propósito.|
|Killmonger|Mantido: Erik nos quadrinhos e métodos coercivos; não reduzido à versão cinematográfica.|

marvel-616-editorial-1.0.1 registra apenas quatro justificativas mais precisas. Um teste fixa todos os 192 valores numéricos da sprint anterior e a lista exata de 24 identidades.

## Distribuição e resultados contraintuitivos

Veja [o relatório reprodutível](RESULTS_AUDIT.md) e [os dados completos](RESULTS_AUDIT.json). Comandos: npm run audit:results e npm run audit:check.

- 4.096 cenários determinísticos por modo com escolhas quase uniformes por item, sem consistência de traço imposta (sequência Halton). Feiticeira Escarlate: 28,80% no rápido e 53,16% no completo.
- 6.561 perfis por modo na grade {0,50,100} em oito dimensões. Feiticeira Escarlate: 11,13%; todos os 24 personagens aparecem.
- 48 testemunhas realizáveis: 24 personagens × dois modos, todos alcançáveis com respostas 1–5.
- Doze cenários comportamentais distintos, incluindo perfis estratégicos, compassivos, impulsivos, autoritários, cautelosos/cooperativos e especialistas reservados.
- Doutor Destino não apareceu na amostra Halton rápida. No completo, Doutor Destino, Thanos, Ultron, Duende Verde e Kang não apareceram nessa amostra. Zero numa amostra não prova impossibilidade, como demonstram a grade e as testemunhas.
- A média de respostas sem consistência de traço tende a valores centrais conforme cresce o número de itens. Personagens com vetores periféricos podem ficar raros nesse protocolo. Isso não justifica alterar personagens para forçar uniformidade.
- A interface agora avisa quando algum eixo está fora da faixa representada no catálogo, e quando a margem entre os dois primeiros é de até 1 ponto de compatibilidade. A margem é descrição matemática, não confiança estatística.

Compatibilidade continua distância RMS ponderada. Cobertura continua respondidas/itens do modo. Confiança permanece composta por indicadores descritivos (profundidade/concordância), sem transformar qualquer um deles em probabilidade de acerto.

## Persistência e experiência

- src/domain/session.ts concentra transições, envelope de formato, validação e adaptação de storage.
- src/app/use-quiz-session.ts usa useSyncExternalStore, com snapshot de servidor estável; nenhum acesso a window/localStorage ocorre durante SSR. Leitura acontece antes de qualquer gravação.
- Chave própria com versão do formato e versões de algoritmo, questionário e catálogo. Outra versão usa outra chave: não sobrescreve nem reinterpreta progressos ou snapshots antigos.
- Progresso inclui modo, etapa, cursor, respostas por ID e até cinco snapshots completos. Não inclui segredos, tokens ou dados de autenticação.
- JSON, tamanho (até um milhão de caracteres), tipos, campos, IDs, valores, cursor, prefixo respondido, versões e integridade matemática dos snapshots são validados. Um snapshot da versão atual é comparado ao cálculo da mesma versão antes de ser aceito; versões antigas não são recalculadas.
- Payload inválido não é aplicado. O registro corrompido não é apagado silenciosamente; iniciar um novo quiz pode substituí-lo.
- Storage bloqueado, quota excedida ou falha de gravação mantêm a sessão em memória e exibem aviso claro.
- A transição rápida/completa abre a pergunta 17 com as 16 respostas e o snapshot rápido intactos; reload preserva a seleção da pergunta atual.
- Voltar preserva respostas. Ao retornar ao início com respostas, há ação de retomar.
- “Reiniciar e apagar progresso” apaga somente a chave desta versão e reinicia o quiz; não usa localStorage.clear().
- Não há sincronização entre abas, dispositivos ou usuários. Duas abas da mesma versão podem sobrescrever o progresso uma da outra (última gravação vence).
- Não há migração automática, importação ou tela para navegar arquivos de versões antigas. Essas chaves ficam preservadas; retenção pode ser encerrada pelas configurações do navegador. A janela de cinco snapshots é um limite explícito, não um arquivo ilimitado.

## Testes e verificação

Resultados efetivamente executados nesta sprint:

|Verificação|Resultado|
|---|---|
|npm test|43/43 aprovados, incluindo os 20 anteriores; zero falhas, cancelados ou ignorados.|
|npm run typecheck|Aprovado.|
|npm run lint|Aprovado, zero erros e zero avisos.|
|npm run build|Aprovado, rotas inicial e not-found pré-renderizadas.|
|npm run catalog:check|Documentação de catálogo/perguntas sincronizada com os dados.|
|npm run audit:check|Relatório de distribuição reproduzível a partir do código.|
|npm run test:e2e|14/14 aprovados em Chrome headless local, sem retries nem testes ignorados; duração total aproximada 1,3 minuto.|
|Capturas|Início desktop/mobile e resultado completo mobile inspecionados visualmente; sem overflow horizontal nos cenários automatizados.|

Sete cenários de navegador foram executados em dois projetos: desktop 1440 × 1000 e mobile emulado Pixel 7 (412 × 839). Cobriram início e modos, navegação/teclado/foco/reload, rápido→completo com snapshots e gráficos, modo completo direto/reinício, JSON corrompido, versão inválida e storage bloqueado. A transição rápida/completa percorreu as 40 perguntas em ambos os viewports e comparou os oito valores dos meters, os textos e o snapshot local com assess().

Os 20 testes anteriores permanecem, com regressões adicionais de conteúdo, sessão e diversidade sintética. O relatório executável fica em playwright-report/index.html; screenshots em test-results/. Não houve teste manual em aparelho físico, Firefox, WebKit ou Edge.

Playwright foi adicionado como dependência de desenvolvimento gratuita; usa o Chrome local em Windows por padrão, podendo usar PLAYWRIGHT_CHANNEL=msedge. Em outros sistemas, usa Chromium instalado pelo Playwright. A configuração segue as referências oficiais de [configuração](https://playwright.dev/docs/test-configuration), [servidor local](https://playwright.dev/docs/test-webserver) e [browsers](https://playwright.dev/docs/browsers). O servidor de teste usa o build de produção e a porta local 3211, sem reutilizar um servidor possivelmente desatualizado.

Não há redesenho: classes e CSS foram mantidos; teste de hash verifica que globals.css não mudou. Avisos, ações e atributos de teste foram integrados à composição existente.

## Pendências editoriais e técnicas

- Não existe validação científica, amostra humana, análise fatorial, teste-reteste ou calibração de confiança. Frequência sintética não estima distribuição entre pessoas.
- A desejabilidade social, o contexto profissional e correlações entre construtos continuam sendo limitações documentadas. Modificar as fundamentais exigirá outra revisão/versionamento.
- As classificações Terra-616 são recortes; não uma afirmação de estado atual em todos os arcos. Revisão independente com referências por edição continua desejável.
- Os 24 personagens não cobrem uniformemente o espaço de oito eixos, especialmente autonomia baixa e risco baixo. Isso foi exposto, sem “corrigir” números para fabricar cobertura.
- Emulação mobile no Chrome não equivale a um aparelho físico, Safari/WebKit ou Firefox.
- A instalação de dependências reportou sete vulnerabilidades moderadas; não foi executado npm audit fix nem upgrade amplo fora do escopo. A cadeia de dependências requer triagem separada.
