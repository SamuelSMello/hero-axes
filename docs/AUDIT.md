# Auditoria de confiabilidade — 2026-11-11

## Estado inspecionado antes das alterações

O checkout recebido não continha modos rápido/completo, oito eixos ou matching por distância. Continha uma implementação inicial de seis perguntas e quatro eixos. Não foram encontrados outros diretórios de aplicação. Não se assume a existência de uma implementação diferente fora deste checkout.

### Causas confirmadas

Referências à versão anterior de `src/app/page.tsx`, preservadas aqui como evidência histórica:

- Linhas 3–12: quatro eixos; seis situações com quatro alternativas, sempre na mesma ordem temática.
- Linhas 13–18: array local `heroes`; Mulher-Maravilha na linha 14 e Batman na linha 15. Ambos DC. Não havia importação de Batman de API ou módulo: era uma declaração literal nesta página.
- Linha 25: `answers.filter(answer => answer === axis).length`. O índice de cada alternativa era tratado como atributo. Respostas competiam entre si: marcar estratégia impedia somar empatia, mesmo quando ambas fossem plausíveis.
- Linha 26: selecionava personagens cujo índice correspondia ao eixo mais contado. Preferir a alternativa B produzia Batman sem comparar qualquer personalidade.
- Linha 35: exibia percentuais de frequência de resposta; o personagem não tinha vetor de atributos. Descrições eram textos fixos. Empate de eixos era apresentado como empate de personagens.
- Bloco de alternativas (options e onChange): seleção por posição, sem identificação estável de pergunta.
- `README.md` anterior: documentava seis perguntas/quatro eixos e estado apenas em memória.

Não havia normalização independente por eixo, polaridade invertida, pesos ou compatibilidade matemática. Também não havia fetch, API, randomização, fallback de personagem, autenticação ou persistência em `src/`. Os dados locais eram demonstrativos; não dados psicométricos ou pontuações oficiais.

### Avaliação das seis perguntas anteriores

1. Ameaça na cidade: situação ampla e fantasiosa; alternativas misturavam velocidade, planejamento, cuidado e autonomia.
2. Equipe em perigo: opção “ninguém fica para trás” induzia desejabilidade; coragem e empatia se sobrepunham.
3. Missão impossível: sem prazo, custo ou resultado definidos; coragem/risco e estratégia/organização se confundiam.
4. Discordância de aliado: defender convicção e seguir intuição não distinguiam autonomia de rigidez; ouvir e concordar não eram diferenciados.
5. Novo poder: repetia ação/estudo/ajuda/experimentação; media preferência pela descrição, não comportamento contextualizado.
6. Decisão final: formulações abstratas (“coragem”, “pessoas”, “convicções”); praticamente repetia a chave de pontuação.
Todas usavam a posição A/B/C/D como eixo fixo, incentivando repetição e reduzindo variação.

### Hipóteses e limites da evidência

- Uma contaminação por API externa poderia ocorrer em outra versão, mas não explica este checkout.
- A percepção de atributos incoerentes é compatível com o acoplamento índice/personagem confirmado; não há respostas originais do usuário para reproduzir exatamente sua sessão.
- Desejabilidade social e redundância são avaliação editorial de conteúdo, sem estudo com participantes.
- Não foi possível comparar histórico Git porque o executável não está no PATH.

## Correção implementada

- `src/domain/axes.ts`: oito IDs estáveis, polos explícitos, mesma escala 0–100 e mesmos pesos em ambos os modos.
- `src/domain/catalog.ts`: allowlist independente de 24 IDs e nomes, continuidade Terra-616, recortes por persona, classificação e justificativa por eixo. Importações externas devem passar por `validateCatalog`; identidade, completude, duplicatas e dados inválidos falham de forma explícita. Não há fallback.
- `src/domain/questions.ts`: 40 dilemas bipolares concretos; 16 fundamentais são prefixo fixo, 24 adicionais completam cinco itens por eixo. IDs preservados entre modos, polaridade e peso explícitos.
- `src/domain/assessment.ts`: respostas validadas, média ponderada por eixo após inversão, matching por RMS ponderado. Fórmula: compatibilidade = 100 − sqrt(sum(peso × diferença²) / sum(pesos)). Pesos de matching positivos, iguais a 1. Nenhum arredondamento antes do ranking.
- Ausência produz null para o eixo ainda não respondido, nunca 50 inventado. Matching exige todas as perguntas do modo.
- Empates matemáticos são exibidos juntos (tolerância numérica 1e-9); ordenação secundária por ID estável.
- Cobertura = respondidas / itens do modo; profundidade = respondidas / 40; concordância = média por eixo de 1 − variância / 2500. Concordância não prova qualidade: respostas neutras ou deliberadamente coordenadas podem elevá-la. Sem intervalo de confiança estatístico.
- `resultAxisRows` usa exatamente o perfil calculado do usuário; atributos editoriais do personagem aparecem separados. Polos e interpretação usam a definição preservada no snapshot.
- `src/app/page.tsx`: mantém composição e classes visuais; integra seleção de modos, continuidade na pergunta 17, comparação de atributos e transparência. `globals.css` não foi alterado nesta auditoria.
- Resultados em memória são snapshots imutáveis com versões do algoritmo/questionário/catálogo, perguntas, respostas, pesos, definições, catálogo e ranking. Completar não substitui o snapshot rápido. Não havia persistência anterior a migrar; nenhum localStorage foi introduzido. Uma futura persistência deve armazenar o snapshot completo, nunca recalcular silenciosamente resultados antigos.

## Fontes editoriais e limites

O catálogo segue a lista explícita solicitada e referências de identidade no [diretório oficial Marvel](https://www.marvel.com/characters). [Loki](https://www.marvel.com/characters/loki/in-comics) e [Kang](https://www.marvel.com/characters/kang/in-comics) exemplificam identidades e continuidades que exigem recorte. A consulta direta às páginas oficiais retornou HTTP 403 neste ambiente; os links são referências para revisão humana, não comprovação de valores. Nenhum dado foi importado dessas páginas para pontuar personagens.

As notas numéricas e classificações são decisões editoriais interpretativas. Terra-616 não elimina mudanças entre autores e arcos. Casos Hulk, Wolverine, Loki e Magneto são tratados explicitamente como anti-heróis no recorte; Wanda como heroína em reparação; Doom como vilão apesar de fases de aliança. Não são rótulos universais nem julgamentos do participante.

Risco e impulsividade, autonomia e centralização, empatia e cooperação podem se correlacionar, mas representam construtos distintos. Os itens procuram separar antecipação de reação imediata, preferência por trabalho conjunto de sensibilidade afetiva, e direção própria de controle dos outros. Falta validação empírica de separação dos fatores.

Não há alegação científica: não houve amostra, análise fatorial, teste-reteste, calibração de pesos ou revisão independente. Similaridade a um vilão não implica autoritarismo clínico ou falha moral. Alterações editoriais exigem aumento de versão e revisão dos testes.

## Verificação executada

- `npm test`: 20 testes aprovados, zero falhas. Inclui lista fechada Marvel, identidade fraudulenta com publisher Marvel, ausência de DC, dados inválidos, neutralidade, extremos, inversão, respostas ausentes, distância ponderada, identidade exata de perfil, determinismo, empate real, quatro perfis sintéticos, continuidade 16/40, snapshots e equivalência entre eixos calculados e dados dos gráficos.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado, zero erros e zero avisos.
- `npm run build`: aprovado; página inicial e not-found pré-renderizadas.
- `npm run catalog:check`: aprovado; documentação editorial igual aos dados executados.
- Servidor do build iniciado temporariamente em 127.0.0.1:3210; GET / retornou HTTP 200. HTML continha modos 16/40, oito eixos e título HeroAxes, sem Batman ou Mulher-Maravilha. Servidor encerrado após o teste.
- Não houve teste visual nem automação de interação em navegador: ferramenta de navegador indisponível. A cobertura da interface inclui TypeScript, lint, build, HTML servido, transformação dos dados de resultado e verificação da ligação dos valores aos meters; não equivale a E2E.

Durante a validação foram corrigidos um import do gerador documental, a tipagem de um fixture mutável e o link interno do logotipo. O runner de testes inicialmente recebeu spawn EPERM da sandbox; os testes foram executados novamente com permissão apropriada. Esses bloqueios não foram contados como testes aprovados. Nenhuma dependência foi adicionada e nenhum teste foi desabilitado.
## Sprint 3 — 2026-11-12

A revisão seguinte e seus resultados estão em [SPRINT3.md](SPRINT3.md). A sessão agora possui persistência local versionada e validada. Sete perguntas adicionais e quatro justificativas foram refinadas; as 16 fundamentais e os 192 valores editoriais foram preservados. A suíte passou a 43 testes unitários aprovados e 14 testes Playwright aprovados no Chrome local, cobrindo desktop/mobile, reload, transição 16→40, reinício, dados inválidos e equivalência dos gráficos. Consulte [RESULTS_AUDIT.md](RESULTS_AUDIT.md) para concentração de personagens e limites de cobertura do catálogo. As limitações descritas na auditoria original sobre ausência de persistência e browser testing são históricas; esta seção registra sua resolução.