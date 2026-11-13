# Sprint 4A — interpretação, distribuição e segurança

Data: 2026-11-13. Base: SPRINT3.md, RESULTS_AUDIT.md, CATALOG.md, domínio, sessão, página e testes. Não houve mudança de algoritmo, perguntas, pesos, valores editoriais, classificações, CSS, versões do modelo ou formato/chave de persistência.

## Interpretação e interface

`src/domain/interpretation.ts` é um módulo puro: recebe o snapshot, usa seus pesos, perfis, orientação e justificativas, sem buscar conteúdo no catálogo global. Não acrescenta campos a `assess()` nem regrava resultados. A versão atual continua validando e restaurando snapshots anteriores exatamente como antes; chaves de outras versões permanecem intocadas.

Para cada eixo, a contribuição ao erro quadrático médio é `peso × (usuário − personagem)² / soma dos pesos`. As três menores contribuições são as semelhanças relativas e as duas maiores, divergências relativas. Empates seguem a ordem dos eixos armazenada. Mesmo uma semelhança relativa pode ter distância grande; a interface declara isso. Valores baixos não são invertidos nem classificados como inferiores. A polaridade das perguntas já foi aplicada ao calcular o perfil; inverter novamente produziria erro.

A explicação sempre mostra os dois valores, a distância e o polo sustentado pelo valor do usuário: abaixo de 40, polo baixo; acima de 60, polo alto; inclusive 40–60, equilíbrio. A justificativa editorial é explicitamente atribuída ao personagem, nunca ao participante. Os eixos não sustentam inferências sobre inteligência, diagnóstico ou valor moral.

A comparação entre primeiro e segundo apresenta todas as diferenças de contribuição, incluindo vantagens do segundo. A soma explica a diferença de erros quadráticos; não se somam essas parcelas como percentuais de compatibilidade, pois a RMS inclui raiz quadrada. Empate dentro da tolerância existente de 1e-9 não é descrito como vitória. A ordem por ID é apresentada como desempate de exibição.

Na página existente foram inseridas as explicações e os melhores resultados separados em herói, vilão e anti-herói, preservando empates por classificação. O vencedor geral permanece o mesmo. Os oito meters do usuário foram preservados e cada personagem empatado recebe um meter identificado, na mesma escala, ao lado de seus dados editoriais. CSS e composição principal foram mantidos.

Compatibilidade continua sendo proximidade matemática; cobertura é respondidas/itens do modo; profundidade é respondidas/40; concordância interna é descritiva. Nenhum deles representa probabilidade de acerto ou validação científica.

## Exemplo calculado: oito eixos em 50

Feiticeira Escarlate: 77,9206%; Thor: 74,1398%; diferença exibida: 3,78 pontos. Cobertura rápida: 100%; profundidade: 16/40. Isso não torna Wanda uma personagem neutra nem o resultado uma certeza.

- Planejamento: usuário 50, personagem 55, distância 5; contribuição 3,125. Usuário em equilíbrio; justificativa do personagem: “Planejamento variável”.
- Centralização: 50 versus 40, distância 10; contribuição 12,5.
- Impulsividade: 50 versus 65, distância 15; contribuição 28,125.
- Maiores divergências: empatia 50 versus 85 (35 pontos) e autonomia 50 versus 80 (30 pontos). O texto não chama o usuário de altamente empático ou autônomo.

Contra Thor, risco favorece Wanda em 175 unidades de erro quadrático médio; cooperação em 62,5; impulsividade em 50; centralização em 15,625. Empatia favorece Thor em 75 e flexibilidade em 46,875; planejamento e autonomia empatam. Saldo favorável a Wanda: 181,25. Números completos e explicações geradas: [DISTRIBUTION_4A.json](DISTRIBUTION_4A.json).

## Investigação da distribuição

Reprodução: `node scripts/audit-distribution-4a.mjs`; integridade: acrescentar `--check`. Os relatórios da Sprint 3 também continuam reproduzíveis com `npm run audit:check`.

|Entrada sintética|Rápido: Wanda|Completo: Wanda|
|---|---|---|
|4096 Halton com alternativas independentes por item|28,80%|53,16%|
|4096 Halton uniformes por eixo, sintetizados em respostas realizáveis|21,36%|22,18%|
|Grade anterior {0,50,100}, 6561 perfis|11,13%|11,13%|

O protocolo uniforme por eixo atribui uma coordenada por traço e a aproxima à resolução realizável (12,5 rápido; 5 completo). Ele não é uniforme sobre todas as sequências de respostas nem é amostra humana. A grade tem grande massa nos extremos; não estima volume contínuo das regiões de matching. Nenhuma das frequências acima deve ser interpretada como prevalência populacional.

**Demonstrado:** as alternativas quase uniformes por item não geram perfis uniformes. A média de duas respostas tem desvio padrão aproximado de 25; a média de cinco, 15,7–16,3. Para escolhas 1–5 uniformes independentes a variância normalizada é 1250 e o desvio da média é `sqrt(1250/n)`: 25 e 15,81. O perfil uniforme por eixo preserva desvio próximo de 29. As médias empíricas por eixo estão no JSON. A concentração central é, portanto, parte demonstrável da diferença entre os modos no protocolo anterior.

**Geometria demonstrada:** Wanda é o perfil mais próximo do centro entre os 24. Seu planejamento 55 e risco 75 ficam mais próximos de 50 que os de muitos concorrentes. O catálogo só representa autonomia 75–98 e risco 45–95. Todos os 24 continuam alcançáveis por respostas válidas nos dois modos. Ausência em uma amostra não demonstra impossibilidade.

**Sensibilidade demonstrada, não intervenção recomendada:** a auditoria omitiu uma coordenada por vez, apenas no experimento. No completo independente, omitir planejamento reduz Wanda de 53,16% para 28,66%; omitir risco, para 26,40%; omitir autonomia, para 39,16%; omitir empatia aumenta para 66,85%. Logo, nem todo eixo favorece Wanda. Essas ablações alteram a geometria simultaneamente para todos os personagens, não isolam causas psicológicas nem justificam alterar pesos. Resultados das oito ablações nos quatro protocolos estão no JSON.

**Perguntas e pesos:** os oito pesos de matching são 1; cada eixo tem duas fundamentais de polaridades opostas e três adicionais. O JSON registra todos os pesos/polaridades dos 40 itens. Sob alternativas uniformes, inverter polaridade preserva a distribuição marginal. Não foi encontrado tratamento especial ou seleção aleatória para Wanda. As limitações editoriais já descritas na Sprint 3 continuam relevantes: contexto de trabalho, desejabilidade social, correlação entre traços e influência da familiaridade com tarefas.

**Hipóteses não verificadas:** a intensidade desses efeitos em participantes reais, estabilidade temporal, correlações humanas e validade dos valores editoriais precisam de amostra humana e revisão independente. A síntese por traço também não valida psicometria. Não se alteraram perguntas, personagens ou pesos para obter frequências iguais.

## Segurança

Evidências: [auditoria completa](SECURITY_AUDIT_4A.json), [produção](SECURITY_AUDIT_PRODUCTION_4A.json), [árvore instalada](DEPENDENCIES_4A.json).

`npm audit --json` e `npm audit --omit=dev --json` concluíram com código 0 e zero vulnerabilidades de qualquer severidade na árvore atual. A metadata enumera 434 dependências (20 prod, 377 dev, 82 opcionais; categorias não são aditivas). Nenhuma atualização foi aplicada: não há pacote vulnerável identificado pelo audit atual que justifique uma alteração. Não foi usado `audit fix`, `--force` ou upgrade breaking.

O único registro anterior disponível diz “sete vulnerabilidades moderadas” em SPRINT3.md, sem nomes de pacotes, IDs de advisory, caminhos ou saída JSON histórica. Não é possível identificar honestamente essas sete, determinar se eram diretas/transitivas, atribuir sua correção a uma versão ou provar a causa do desaparecimento. O resultado atual não as reproduz; não constitui uma reconstrução da auditoria histórica. Recuperar o relatório/lockfile exato daquela instalação continua pendente.

|Cadeia atual|Tipo e ambiente|Exposição observada|
|---|---|---|
|next 16.4.6, react/react-dom 19.3.0|Diretas de produção|Next atende a aplicação; React renderiza a interface. Incluem transitivas de runtime/build; árvore exata no JSON.|
|eslint 9.39.5, eslint-config-next 16.4.6, TypeScript 5.9.3 e tipos|Diretas de desenvolvimento e suas transitivas|Lint e checagem local/CI; não são endpoints da aplicação.|
|Tailwind e @tailwindcss/turbopack 4.3.3|Diretas de desenvolvimento e transitivas de compilação|Processam CSS durante build/dev; saída CSS chega ao navegador.|
|@playwright/test 1.65.0|Direta de desenvolvimento e transitivas de teste|Automação local/CI; não integra o bundle do quiz.|

A aplicação inspecionada tem página cliente, storage local e layout; não há API de quiz, autenticação, upload ou integração externa. Isso limita superfícies próprias de entrada no servidor, mas não elimina exposição do framework servido nem da cadeia de build. Valores do storage são validados; nenhuma dependência dev deve ser confundida com uma rota pública. Audit sem alertas não garante ausência de vulnerabilidades desconhecidas.

Plano: manter o lockfile, executar os dois audits em futuras atualizações/CI e guardar seus JSONs; recuperar os sete advisories históricos para análise individual de pacote/caminho, versão corrigida e pré-condições de exploração. Se reaparecerem, priorizar runtime publicamente alcançável; aplicar atualizações compatíveis com revisão do lockfile e repetir unitários, TypeScript, lint, build e navegador. Upgrades breaking exigem análise própria.

## Validação desta execução

|Comando|Resultado|
|---|---|
|npm test|Bloqueado ao iniciar workers: spawn EPERM.|
|node --experimental-strip-types --test --test-isolation=none tests/*.test.ts|50/50 aprovados, incluindo os 43 anteriores; nenhuma falha ou teste ignorado.|
|npm run typecheck|Aprovado.|
|npm run lint|Aprovado.|
|npm run build|Compilação Turbopack aprovada; build interrompido por spawn EPERM ao iniciar a etapa TypeScript. Não concluído.|
|npm run test:e2e|Bloqueado por spawn EPERM antes de executar os cenários.|
|npm run catalog:check e npm run audit:check|Aprovados, sem mudar relatórios históricos.|
|node scripts/audit-distribution-4a.mjs --check|Aprovado.|
|npm audit e audit --omit=dev|Zero vulnerabilidades, código 0.|

Os sete testes novos cobrem valores reais, orientação, pesos, contribuições e reconciliação RMS, empates reais, limites 0/40/60/100, polos do snapshot, classificações, ausência de segundo colocado e interpretação após serialização/continuação sem alterar os dados. As regressões anteriores cobrem resultados, versões, storage inválido/bloqueado, snapshots e transição rápido→completo.

Playwright foi atualizado para conferir a região de interpretação e os novos meters, preservando os cenários desktop/mobile, reload e transição. Falta executar esses cenários e concluir o build em ambiente com criação de subprocessos permitida; não houve validação visual nesta execução. A restrição de execução não foi contornada com escalada de permissões. Permanecem pendentes também a identificação dos sete advisories históricos e a validação editorial/psicométrica com evidência independente.
