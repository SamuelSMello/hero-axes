# Sprint 4B — identidade visual e experiência

Continuação: [Sprint 4C — histórias por traços compartilhados](SPRINT4C.md). As recomendações preservam esta identidade; a homologação visual pendente abaixo não foi encerrada pela nova sprint.

Data: 2026-11-13. Status: implementação pronta para revisão; homologação visual e execução completa de build/Playwright pendentes por `spawn EPERM`. Não se declara a sprint concluída com essas verificações pendentes.

## Base e limites preservados

Foram lidos AGENTS.md, SPRINT4A.md, SPRINT3.md, os recortes do catálogo, a página, CSS, layout, hook de sessão, domínio e testes existentes. A orientação local do Next foi conferida em `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`.

Não se recriou o projeto. Os oito arquivos de domínio, incluindo assessment, eixos, perguntas, catálogo, interpretação, diagnósticos, sessão e geração sintética, permanecem byte a byte iguais. O hook `use-quiz-session.ts`, package.json e lockfile também não mudaram. Não existem arquivos scoring.ts/matching.ts nesta estrutura: o cálculo existente em assessment.ts foi preservado. Não se acrescentaram APIs, autenticação, backend, dependências, fontes remotas ou chamadas de imagem.

A regressão por hashes, usando `tests/fixtures/sprint4b-contracts.json` capturado antes do redesign, verifica esses limites. Permanecem cobertura dos resultados anteriores, validação de storage, retomada, reload, snapshots, transição 16→40 e reinício restrito à chave atual. O redesign não migra nem grava novos campos em resultados.

## Identidade visual

Grafite quase preto `#0B0D12`, painéis `#181D27`, vermelho `#D92535` para ações e dourado `#F0B94B` para destaque editorial. Textos usam branco quente `#F5F4F1` e cinza claro `#B6BDCC`. O vermelho claro `#FF8993` é usado para pequenos textos, seleção e gráficos onde o vermelho de ação teria menos contraste.

Títulos usam a pilha local Arial Narrow / Franklin Gothic Medium / Arial, com peso forte, espaçamento compacto e tamanhos fluidos; texto usa Arial / Helvetica e metadados usam Cascadia Code / Consolas / monospace. Não há download ou troca tardia de fontes. Grids, índices editoriais, linhas técnicas e um diagrama octogonal original compõem a linguagem cinematográfica sem reproduzir logotipos ou layouts oficiais.

Todos os tokens estão em `src/app/globals.css`: cores de fundo/superfície/ação/texto/contorno/foco, fontes, oito espaçamentos de 4 a 72 px, três raios, sombras e duração/easing. O `@theme inline` expõe fundo, painel, primária e dourado ao Tailwind já instalado. Classes de componentes usam os mesmos tokens; não se adicionou biblioteca de UI.

## Componentes

`src/components/ui.tsx` reúne primitivas sem lógica de domínio. Importadas pela página cliente, integram a fronteira React existente.

|Componente|Responsabilidade e estados|
|---|---|
|Button|Variantes primary, secondary e ghost; botão nativo; hover em dispositivos compatíveis, focus-visible dourado, disabled e loading com aria-busy e bloqueio de ação.|
|Card|Superfície, contorno, raio e sombra consistentes; recebe atributos HTML e classes de composição.|
|Progress|Respondidas/total visíveis e progressbar com mínimo, máximo e valor; usado com o cursor original.|
|QuizOption|Radio nativo dentro de label clicável; número, marca de seleção e borda; teclado nativo preservado; foco na opção inteira.|
|SectionHeading|Índice editorial, h2 e descrição opcional; empilha em mobile.|
|ResultStat|Rótulo, valor e descrição separados; sem conversão ou nova interpretação da métrica.|
|CharacterPortrait|Fallback tipográfico geométrico com iniciais e dimensões reservadas; decorativo para leitores de tela.|

`src/components/results.tsx` concentra a apresentação do snapshot e usa resultAxisRows(), interpretResult() e matchingDiagnostics() existentes. Não recalcula o quiz nem muda o ranking.

## Páginas e fluxos

**Home:** hero com proposta simples, CTA para escolher modo e retomada quando existem respostas. Dois cards explicam 16 e 40 perguntas, continuidade sem repetição e duração aproximada de 3–5 / 8–12 minutos. As durações são estimativas editoriais, não medidas de estudo com usuários. Abaixo, os oito eixos e seus polos originais e a natureza recreativa da experiência.

**Questionário:** uma pergunta por vez; modo, posição e progresso respondido; polos A/B preservados; cinco alternativas em linhas completas; seleção reconhecível por cor, contorno, radio e check. Próxima permanece desabilitada sem resposta. Voltar, foco no título após mudança, retomar, reiniciar e salvar usam as mesmas ações de sessão. A entrada de pergunta tem transição de 180 ms e 4 px, sem deslocamento estrutural do layout.

**Resultado:** título com todos os vencedores empatados, cards com classificação, recorte editorial e compatibilidade matemática em destaque. Os melhores herói, vilão e anti-herói aparecem em três cards, preservando empates e rótulos. Semelhanças e divergências usam as explicações calculadas existentes. Em empate geral, a análise detalhada identifica o primeiro da ordem de exibição; não o declara superior.

Os oito eixos mostram meter do usuário em vermelho claro e do personagem em dourado, ambos em 0–100, com valores e rótulos textuais. As justificativas editoriais, a comparação detalhada com o segundo e as versões ficam em disclosures nativos. A comparação pode ser aberta pelo teclado. Indicadores de cobertura, profundidade e concordância são separados e mantêm seus avisos; compatibilidade não é apresentada como certeza psicológica. Os avisos de lacuna do catálogo e margem pequena continuam visíveis.

Continuar para 40, reiniciar e resultados anteriores da mesma versão permanecem disponíveis. Nenhuma classificação ou pontuação foi alterada para combinar com o novo visual.

## Imagens e direitos

Não foram usadas fotografias, artes, pôsteres, logotipos oficiais ou imagens dos personagens. O hero é SVG geométrico original; os retratos são CSS e iniciais, não ilustrações dos personagens. Todos são decorativos; nomes reais do catálogo ficam no texto adjacente. O fallback é a experiência padrão, não uma imagem remota que pode falhar. Espaço/aspect ratio reservados evitam deslocamento por carregamento de imagens. Assets padrão do Next já existentes não foram incorporados ao novo layout.

## Responsividade e acessibilidade

Base com uma coluna e 16–20 px de margem; ampliação para duas colunas a partir de 640 px, composição editorial a partir de 768 px e hero lado a lado/quatro eixos por linha a partir de 1024 px. Máximo de conteúdo: 1240 px. Grids usam minmax(0,1fr); textos longos e versões podem quebrar; não se usa overflow-x:hidden para esconder erros de layout. Elementos decorativos têm recorte local.

Há link de pular conteúdo com destino focável, main, headings hierárquicos, fieldset/legend, radios nativos, progressbar e meters identificados. Botões têm ao menos 48 px de altura e opções ao menos 64 px; summaries têm 48 px. Foco de 3 px com offset; a seleção não depende só da cor. Status de storage continua em aria-live polite. Não há animação contínua de fundo; o spinner só aparece durante restauração. prefers-reduced-motion desativa animações e transições. Há tratamento básico de forced-colors; precisa de revisão real nesse modo.

A checagem matemática de dez pares opacos principais passou. Branco sobre primária: 4,922:1; texto secundário sobre superfície: 8,956:1; contorno da alternativa sobre superfície: 3,479:1; foco dourado: 9,443:1. Evidência: [UI_CONTRAST_4B.json](UI_CONTRAST_4B.json). Reprodução: `node scripts/audit-ui-contrast.mjs --check`. Isso não é certificação de acessibilidade: ainda faltam revisão de estados compostos, zoom, cores forçadas e leitor de tela em navegador.

## Validação e regressões corrigidas

|Verificação executada|Resultado|
|---|---|
|npm test|Bloqueado antes de executar arquivos por spawn EPERM.|
|node --experimental-strip-types --test --test-isolation=none tests/*.test.ts|53/53 aprovados; sem falhas ou ignorados.|
|npm run typecheck|Aprovado após corrigir a tipagem do loader exclusivo de testes.|
|npm run lint|Aprovado após corrigir passagem de children no teste React.|
|npm run build|Turbopack compilou com sucesso; interrompido por spawn EPERM na etapa TypeScript. Build completo não aprovado.|
|npm run test:e2e|Bloqueado por spawn EPERM antes de executar cenários; nenhum teste de navegador declarado aprovado.|
|npm run test:e2e -- --list|24 casos descobertos corretamente; apenas coleta, sem execução de navegador.|
|npm run catalog:check / npm run audit:check|Aprovados; relatórios editoriais e de distribuição preservados.|
|node scripts/audit-distribution-4a.mjs --check|Aprovado.|
|node scripts/audit-ui-contrast.mjs|Dez pares principais aprovados.|

Três testes novos exercitam a renderização real do React, incluindo 12 perfis em ambos os modos (24 resultados), todos os meters, classificações, valores de compatibilidade e imutabilidade do snapshot; também cobrem apresentação de empate e semântica de loading, seleção e progresso. O loader TSX usa somente TypeScript já instalado e Node >=24 já exigido pelo projeto; não participa da aplicação.

O teste histórico que travava o hash do CSS da Sprint 3 foi substituído pela preservação dos contratos desta sprint: manter aquele CSS contrariaria o redesign solicitado. Uma verificação antiga procurava o gráfico dentro de page.tsx: foi ajustada para results.tsx, para onde a apresentação se moveu. A incompatibilidade entre tipos Node 20 instalados e registerHooks de Node >=24 foi resolvida isolando o loader de testes em JavaScript, sem modificar dependências ou suprimir erros de tipos da aplicação. A falha de lint no teste de botão também foi corrigida. A suíte final não apresenta regressões conhecidas nas verificações executadas.

Playwright mantém os sete cenários anteriores e acrescenta cinco cenários parametrizados (320, 375, 768, 1024 e 1440 px) em cada projeto desktop/mobile: home, pergunta e resultado, sem overflow, skip link, alvos de botão, redução de movimento, meters comparados ao cálculo, disclosure da comparação e continuidade na pergunta 17. São 24 casos configurados no total. Screenshots são solicitados para as três telas por largura quando a suíte puder rodar. Não foram produzidas nem inspecionadas capturas desta execução; a existência do código de teste não significa aprovação visual.

## Execução local e pendências

Em terminal local que permita criação de subprocessos, na pasta heroaxes:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
node scripts/audit-ui-contrast.mjs --check
```

O Playwright inicia o build de produção na porta 3211 e usa Chrome local no Windows; se necessário, `$env:PLAYWRIGHT_CHANNEL='msedge'` seleciona Edge. É preciso concluir `npm run build` antes da suíte. Os relatórios ficam em playwright-report e capturas/traces em test-results. Não se desabilitou a checagem do build para mascarar o bloqueio.

Faltam homologação das cinco larguras, inspeção das capturas, teste de teclado no navegador, zoom 200%/400%, leitor de tela, forced-colors, aparelho físico e browsers além de Chrome. Não se afirma ausência de overflow, layout shift ou regressões visuais sem essa execução. Qualquer regressão encontrada deve ser corrigida antes de concluir a Sprint 4B. As pendências editoriais, psicométricas e de advisories históricos da Sprint 4A permanecem fora do redesign.
