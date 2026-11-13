# Sprint 4C — histórias por traços compartilhados

Data: 2026-11-13. Implementação local com curadoria versionada. Build completo e homologação Playwright permanecem pendentes por `spawn EPERM`; nenhum teste de navegador é declarado aprovado.

## Arquitetura e preservação

Foram inspecionados AGENTS.md, documentação das Sprints 4A/4B e Sprint 3 já presente no contexto do projeto, contratos de assessment/sessão, interpretação, componentes, CSS e testes. A documentação local do Next sobre fronteiras servidor/cliente foi consultada antes da implementação dos adaptadores.

Fluxo: snapshot versionado → personagem pelo ID armazenado → `recommend()` + catálogo editorial local → seção de recomendações. A rede não participa desse fluxo.

|Arquivo|Responsabilidade|
|---|---|
|src/core/recommendation-types.ts|Tipos de mídia, obra, continuidade, participação, evidência, fonte e lacuna editorial.|
|src/core/recommendations.ts|Motor puro e determinístico; não usa relógio, aleatoriedade, rede, storage ou estado global mutável.|
|src/data/recommendation-catalog.ts|Obras, relações e evidências locais; fontes e curadoria pendente. Estrutura congelada recursivamente após a construção.|
|src/components/recommendations.tsx|Seção de histórias, justificativas rastreáveis, fontes, filtro de spoilers e fallback.|
|src/components/results.tsx|Inclui a nova seção após os indicadores existentes; o restante da composição permanece.|
|src/app/globals.css|Somente classes adicionais para cards, fontes e filtro; reutiliza tokens da Sprint 4B.|
|src/server/metadata.ts|Adaptadores opcionais de metadados TMDB e Open Library, com fronteira server-only. Não importado pela aplicação cliente.|
|scripts/audit-recommendations.mjs|Gera catálogo documental e relatório reprodutível por personagem.|
|scripts/register-server-test-loader.mjs|Shim de testes Node para o marcador server-only que o compilador Next aplica em produção.|
|tests/recommendations.test.ts e tests/metadata.test.ts|Seleção, evidências, integridade e falhas dos adaptadores com fetch simulado.|
|tests/ui.test.ts e e2e/quiz.spec.ts|Comparação do HTML com a seleção e cenário de navegador para fontes/spoilers/snapshot.|

Não foram alterados os oito arquivos de domínio, o hook de sessão, perguntas, eixos, perfis, pesos, algoritmo de matching, interpretação, versões do quiz, package.json ou lockfile. O teste de hashes da Sprint 4B continua aprovado. Não existem scoring.ts/matching.ts nesta estrutura; o cálculo em assessment.ts não foi tocado. Não há dependência nova, Supabase, backend, API pública ou IA generativa em execução.

Recomendações são uma camada de apresentação externa ao snapshot: não se acrescenta nenhum campo salvo e não se migram resultados. Um resultado antigo compatível recebe a curadoria atual, identificada separadamente; isso não significa que aquelas indicações faziam parte de seu snapshot original. Para reproduzir uma seleção histórica, são necessários o snapshot, a versão do motor e a versão correspondente do catálogo editorial. Não há arquivo de versões históricas da curadoria nesta entrega inicial.

## Modelo de dados

- `MediaType`: movie, series ou comic.
- `Work`: ID local, storyKey, título, ano do material original/início, recorte bibliográfico, continuidade, revisão e spoilers. Coleções reeditadas registram a data original do material no ano e a edição consultada no recorte, sem supor edição brasileira.
- Continuidade: comics-616, mcu ou fox-xmen. MCU não é tratado como o mesmo recorte Terra-616 em quadrinhos. Logan está explicitamente na continuidade audiovisual X-Men/Fox. Outras continuidades exigem extensão editorial, não classificação automática.
- Participação: ID de um dos 24 personagens, identidade/incarnação descrita, papel narrativo (lead, co-lead, antagonist, supporting, cameo) e fontes. Kate Bishop pode aparecer na justificativa de uma história de Clint, mas não substitui o personagem do quiz.
- `externalIds`: Marvel com namespace de issue/collection/series, TMDB, ISBN ou Open Library. São opcionais. O catálogo inicial só preenche IDs Marvel extraídos das URLs consultadas. Não foram adivinhados IDs TMDB ou ISBNs. ID de coleção é referência dessa edição, não uma alegação de ID da edição original.
- `TraitEvidence`: obra + personagem + eixo + polo, manifestação observada, leitura editorial do HeroAxes, localização da referência, fontes, revisão e spoilers. Uma obra pode ter várias evidências, personagens e eixos.
- `EditorialSource`: URL, título, publicador, categoria (sinopse oficial, guia oficial ou análise secundária), data e modo de conferência. `indexed-text` significa texto retornado pelo índice de busca; `page-text` significa página aberta e consultada. Não se declara leitura integral das obras.
- Revisão: source-verified, pending ou rejected. Source-verified significa que a relação/premissa foi conferida nas fontes registradas; a associação ao eixo é interpretação editorial explícita e não uma validação Marvel ou psicométrica.
- Spoilers: none, premise ou major, tanto na obra quanto na evidência. A evidência pode exigir mais proteção que a premissa da obra.

## Catálogo confirmado e pendente

O [catálogo completo com fontes](RECOMMENDATIONS_CATALOG.md) lista separadamente as relações confirmadas para os 24 personagens e as 17 lacunas/exclusões editoriais. O [relatório de cobertura e seleção](RECOMMENDATIONS_AUDIT.json) registra o que o motor retorna com e sem spoilers usando respostas realizáveis próximas de cada personagem, no modo completo.

São 50 registros de obras: **49 com revisão de fonte aprovada e um excluído**, distribuídos em 41 registros de HQ, seis filmes e três séries (uma das HQs está excluída). Há 64 evidências, das quais 63 aprovadas e uma pendente, apoiadas em 53 registros de fonte. Todos os 24 personagens têm pelo menos uma evidência aprovada elegível para seu perfil realizável quando spoilers são permitidos. Isso não garante quatro indicações em qualquer perfil ou no filtro padrão.

Fontes oficiais incluem Marvel, Disney/D23 e 20th Century Studios. Fontes secundárias identificadas têm peso menor e são usadas, por exemplo, para o registro de Mysterio no GCD, proteção do bebê em Guardian Devil, tomada do trono por Hela no filme e o episódio final de WandaVision. Várias páginas Marvel retornam 403 na abertura direta; onde foi possível conferir apenas o índice, isso está registrado no dado. Revisão independente e leitura integral continuam desejáveis; verificações estruturais não provam o conteúdo de uma história.

Exemplos de referências específicas: Scarlet Witch (2023) #1; WandaVision T1E9; Avengers Prime #5; The Amazing Spider-Man #1, #13 e #31; Black Widow (2001) #1; Moon Knight Annual (2019) #1; Devil’s Reign #1. Não foram inventados diálogos, minutagens ou episódios. Quando o guia só sustenta a parceria ao longo de uma série, não se atribui uma cena a um episódio específico.

Decisões de curadoria relevantes:

- **Iron Man Annual #5:** a participação de Killmonger aparece em guia oficial, mas registros adicionais indicam corpo/LMD sob manipulação do Mandarim. Obra excluída como evidência da agência de Erik. Sua presença na lista não autoriza atribuir-lhe o planejamento. A divergência de mês entre registros não afeta o ano confirmado de 1982; não foi escolhido um mês arbitrário.
- **Guardian Devil / Mysterio:** antagonista confirmado, porém a premissa consultada não sustenta o detalhamento necessário da manifestação de planejamento. Essa evidência está pendente e não é selecionada. A obra permanece elegível para Matt pela proteção do bebê, com spoiler importante.
- **Born Again / Matt:** sofrer uma ofensiva não demonstra, por si só, aceitação voluntária do perigo. Não se criou indicação por risco para Matt. A mesma obra sustenta a preparação coordenada de Fisk e pode ser selecionada para ele.
- **Planet Hulk:** a arena imposta não foi usada como prova de preferência por risco. A busca de liberdade sustenta o recorte de autonomia registrado.
- **Black Panther / Killmonger no filme:** presença confirmada, sem evidência por eixo aprovada nesta versão. O filme não aparece como recomendação de Erik apenas por isso.
- **Coleções de Priest:** Enemy of the State e a coleção inicial #1–33 se sobrepõem; compartilham storyKey para evitar duas sugestões da mesma história.
- **Hela:** a evidência audiovisual usa tomada do trono e expansão do domínio, com fonte específica e spoiler importante; não equipara mera violência a centralização.
- **Avengers: Doomsday:** fica pendente para Doom, pois ainda não estreou na data desta curadoria. Elenco e material promocional não verificam uma manifestação narrativa do traço.

Entre as demais lacunas estão curadoria audiovisual para Iron Man, Spider-Man/Peter, Thanos, Red Skull, Green Goblin/Norman, Mysterio/Quentin, Magneto, Kang e Loki; segunda HQ independente para Hela, Loki e T’Challa. Não se completa a interface com referências não revisadas. A lista exata de candidatas e motivos está no catálogo documental.

## Seleção determinística

Versões: motor `shared-evidence-1.0.0`; curadoria `marvel-stories-1.0.0`. `recommend(result, characterId, catalog, options)` usa o personagem do catálogo **armazenado no resultado**, não um perfil recebido de uma API ou o perfil global atual.

1. A combinação exata das três versões do modelo precisa constar em supportedModels. Versão ainda não revisada ou personagem ausente gera fallback, sem recalcular ou substituir o quiz.
2. Os perfis e pesos são validados pela função existente. Para cada eixo, calcula-se `peso × diferença² / soma dos pesos`. Os eixos compartilhados são ordenados pelas menores contribuições de erro, com a ordem dos eixos do snapshot como desempate.
3. Uma evidência só é elegível quando usuário e personagem estão no **mesmo polo específico**: ambos abaixo de 40 ou ambos acima de 60, com diferença absoluta de até 15 pontos, inclusive. 40–60 é neutro e não sustenta um polo específico. O limite 15 é uma regra editorial transparente, não um intervalo de confiança ou mudança no matching.
4. Obra e evidência precisam estar aprovadas, com fontes identificadas e participação narrativa além de cameo. Uma ficha de elenco sem evidência por eixo não basta. Spoilers major da obra ou da evidência são filtrados por padrão, inclusive quando a relação personagem/obra revela a solução de um mistério.
5. Pontuação de seleção por eixo: `100 × peso/soma × (1 − diferença/100)² × qualidade × participação`. Fontes oficiais valem 1; a presença de fonte secundária na evidência reduz a qualidade a 0,75. Lead/co-lead/antagonist valem 1, supporting 0,75, cameo 0. Isso estima prioridade editorial, não compatibilidade percentual do quiz.
6. Repetições de evidências do mesmo eixo não somam: usa-se a maior contribuição daquele eixo. Assim, acrescentar notas redundantes não infla a relevância da obra.
7. Preenchem-se audiovisual, HQ 1, HQ 2 e alternativa, nessa ordem. Cada escolha acrescenta cinco pontos de prioridade por eixo ainda não apresentado, favorecendo diversidade quando houver evidência. Empates usam ID local em ordem lexical. Nenhuma escolha depende da ordem de entrada, idioma do sistema, data ou sorteio.
8. storyKey evita repetição de reedições/coleções sobrepostas. Nenhuma obra selecionada reaparece em outro espaço. Vagas sem candidato ficam sem indicação, com motivo explícito. A alternativa pode ser outra HQ; não se promete sempre um segundo audiovisual.

Os motivos retornam valores reais do usuário/personagem, polo, erro ponderado, ID da evidência, localização e fontes. Manifestação narrativa e interpretação editorial são campos distintos. Há suporte genérico ao polo baixo, exercitado por fixture de teste; o catálogo inicial não inventa exemplos de polos baixos para fabricar cobertura. Assim, nem todos os traços ou todas as partes do espaço de perfis têm a mesma oferta de histórias.

## Exemplos calculados

Os exemplos abaixo usam respostas realizáveis do modo completo que reproduzem os valores editoriais desses personagens (com arredondamento para a resolução do modo quando necessário). Não são relatos de usuários reais.

**Wanda:** empatia 85, risco 75, cooperação 70 e flexibilidade 70. Com spoilers permitidos, a seleção é:

|Espaço|Indicação|Motivação calculada|
|---|---|---|
|Audiovisual|WandaVision, T1E9|Empatia 85/85 e flexibilidade 70/70; evidência secundária revisada, spoiler importante.|
|HQ 1|Witches’ Road, #1–5|Risco 75/75; acrescenta um eixo à seleção.|
|HQ 2|Avengers #16|Cooperação 70/70; acrescenta outro eixo, apesar do papel de apoio.|
|Alternativa|Scarlet Witch (2023) #1|Empatia 85/85; ajuda a quem não tem a quem recorrer.|

Sem spoilers, WandaVision não é emitida e o espaço audiovisual tem fallback; as HQs restantes ainda podem ser indicadas. Para oito eixos em 50, não há indicação por polo, mesmo que Wanda vença o matching global. A interface explica essa diferença sem contradizer o resultado salvo.

**Doom:** centralização 100/100 indica One World Under Doom; risco 70/70 indica Triumph and Torment. Audiovisual e alternativa ficam sem indicação. **Steve:** cooperação 95/95 sustenta o filme The Winter Soldier; a HQ homônima e Avengers Prime cobrem risco e cooperação. As adaptações mantêm rótulo MCU.

## APIs opcionais e condições de uso

Os adaptadores estão isolados em arquivo com `import "server-only"`, marcador aplicado pelo compilador Next. Não há rota que exponha suas funções, tokens, JSONs ou cabeçalhos. Nada na home, no quiz, nos resultados ou no motor importa esse módulo. Não houve chamada real a provedor ou uso de credencial nesta sprint.

Configuração opcional, somente no ambiente do servidor:

|Variável|Uso|
|---|---|
|EXTERNAL_METADATA_ENABLED=true|Habilita consultas explicitamente solicitadas ao adaptador; sozinho não conecta a UI.|
|TMDB_READ_TOKEN|Token de leitura TMDB; nunca usar prefixo NEXT_PUBLIC.|
|TMDB_TERMS_ACKNOWLEDGED=true|Registra que a integração avaliou os termos aplicáveis; não substitui licença/atribuição.|
|OPEN_LIBRARY_TERMS_ACKNOWLEDGED=true|Confirma avaliação das condições do provedor bibliográfico.|
|OPEN_LIBRARY_CONTACT|Email de contato usado para identificar a aplicação em User-Agent.|

**TMDB:** lookup exato por ID previamente curado, nos endpoints movie ou tv. O retorno contém apenas título, data, ID, atribuição e link fixo do provedor. Não usa popularidade para escolher histórias, não busca por nome para preencher IDs automaticamente e não transforma sinopses externas em evidências. A [FAQ oficial](https://developer.themoviedb.org/docs/faq) informa gratuidade para uso não comercial com atribuição; uso comercial requer avaliação com o provedor. Antes de conectar metadados à UI, ainda é necessário implementar os créditos/notice e logotipo aprovado exigidos pela política. O adaptador devolve o notice, mas não afirma que a futura UI já cumpre essa integração. Referências técnicas: [movie details](https://developer.themoviedb.org/reference/movie-details) e [autenticação](https://developer.themoviedb.org/docs/authentication-application).

**Open Library:** adaptador de ISBN para metadados de edições coletadas de HQs, sem promessa de cobertura de fascículos. Não infere personagem, continuidade ou narrativa a partir do título retornado. A [documentação de APIs](https://openlibrary.org/developers/api) pede identificação, cache e uso moderado; publica limites de 1 requisição/s sem identificação e 3/s identificada. O adaptador não faz varredura, usa cache de fetch e não é chamado automaticamente. Um consumidor futuro deve implementar limitação global de taxa e registrar o caso de uso antes de tráfego regular. A [política de licenciamento](https://openlibrary.org/developers/licensing) não elimina direitos preexistentes de contribuições; não se presumiu licença sobre capas. Referência do [Books API](https://openlibrary.org/dev/docs/api/books?v=18).

Timeout de quatro segundos, host/caminho fixos, IDs validados, redirects rejeitados e respostas não esperadas retornam null. Não se registram tokens em logs nem se devolvem credenciais. Campos de imagens, sinopses, personagens e justificativas externos são descartados. O caller não deve mesclar metadados com o catálogo curatorial; precisa conferir a edição/identidade antes de apresentar qualquer enriquecimento. O cache do fetch depende do ambiente servidor; a aplicação atual não depende dele.

**Imagens:** não houve consulta, download ou exibição de capas/pôsteres. A aprovação dos termos de uma API não é tratada como licença geral sobre imagens. A interface usa apenas texto e o sistema visual existente. Logo, a falta de API ou de licença de imagem não bloqueia nenhuma recomendação local.

## Testes executados

|Comando|Resultado nesta execução|
|---|---|
|npm test|Bloqueado por spawn EPERM antes de executar os oito arquivos de teste. Não equivale a oito regressões funcionais.|
|node --experimental-strip-types --test --test-isolation=none tests/*.test.ts|68/68 aprovados; execução final também aprovada com reporter dot, código 0.|
|npm run typecheck|Aprovado.|
|npm run lint|Aprovado, sem erros ou avisos.|
|npm run build|Compilação Turbopack aprovada; build interrompido por spawn EPERM ao iniciar etapa TypeScript. Não concluído.|
|npm run test:e2e|Bloqueado por spawn EPERM antes da execução; nenhum cenário de navegador aprovado.|
|npm run test:e2e -- --list|26 cenários coletados corretamente nos projetos desktop/mobile; coleta não é execução.|
|node scripts/audit-recommendations.mjs --check|Aprovado; catálogo documental e cobertura reproduzíveis.|
|npm run catalog:check / npm run audit:check|Aprovados; catálogo, perguntas e distribuição anteriores preservados.|
|node scripts/audit-ui-contrast.mjs --check|Aprovado; os novos componentes reutilizam os tokens existentes.|

Os 15 testes novos (nove de recomendação, cinco de adaptadores e um de UI) cobrem relações por personagem, 24 perfis realizáveis, proximidade/polaridade, valores reais e pesos, limites 40/60 e distância 15, determinismo/ordem, empate, diversidade, duplicação por storyKey, catálogo vazio, fonte ausente, revisão pendente, cameo, spoilers, versão não revisada, imutabilidade e fallback neutro. Os adaptadores foram testados somente com fetch simulado: configuração ausente, host/cabeçalho, JSON/ID inválido, erro HTTP, timeout e descarte de campos de narrativa/imagem/segredos. O teste React compara IDs de obras emitidos ao motor e continua verificando os meters existentes.

O novo cenário Playwright, nos dois viewports já configurados, restaura um snapshot, compara as indicações ao motor, liga spoilers, abre justificativas/fontes, verifica que o storage não mudou, recarrega e confirma que o filtro não foi persistido. Os cenários de 320/375/768/1024/1440 px da Sprint 4B continuam configurados, mas não foram executados aqui. Falta confirmar overflow, foco, espaçamento e fontes na prática; os testes unitários não substituem essa validação.

## Pendências e execução local

Permanecem a curadoria detalhada listada separadamente no catálogo, revisão independente das inferências e referências com indexação/403, cobertura de mais polos/eixos e mais obras audiovisuais. A licença de imagens e ativação/atribuição real das APIs não foram concluídas porque os provedores não estão conectados ao produto; a aplicação funciona inteiramente com os dados locais.

Para concluir a validação em ambiente que permita subprocessos, executar em heroaxes:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
node scripts/audit-recommendations.mjs --check
```

Não se desabilitou a checagem do build nem se contornou a restrição do ambiente. As pendências visuais da Sprint 4B também continuam abertas.
