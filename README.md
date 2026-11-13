# HeroAxes

Next.js + TypeScript. Quiz recreativo com 24 personagens Marvel Terra-616, oito eixos e modos de 16/40 perguntas. Sem APIs externas, serviços pagos ou alegação de validade científica.

## Executar

Node.js 24 ou superior:

```powershell
npm install
npm run dev
```

Abra http://localhost:3000.

## Validação

```powershell
npm test
npm run typecheck
npm run lint
npm run catalog:check
npm run audit:check
npm run build
npm run test:e2e
```

Os testes Playwright usam o build de produção (execute build antes), iniciam o servidor em 127.0.0.1:3211 e cobrem desktop e mobile. Em Windows, usam Chrome já instalado. Para Edge no PowerShell: `$env:PLAYWRIGHT_CHANNEL = "msedge"`. Em outros sistemas, instale o Chromium de teste com `npx playwright install chromium`. Relatório HTML: `playwright-report/index.html`; screenshots e traces ficam em `test-results/`. São artefatos locais ignorados no Git.

## Conteúdo e auditoria

- [Auditoria original](docs/AUDIT.md)
- [Sprint 3: revisão, persistência, testes e pendências](docs/SPRINT3.md)
- [24 perfis, valores e justificativas](docs/CATALOG.md)
- [40 perguntas e metadados](docs/QUESTIONNAIRE.md)
- [Distribuição, alcance e limitações](docs/RESULTS_AUDIT.md)

Após editar conteúdo, aumente sua versão e gere os documentos com `npm run catalog:export` e `npm run audit:results`. Os comandos check detectam divergências.

## Retomada local

Respostas, etapa atual e até cinco resultados são salvos no navegador com formato e versões validados. Atualizar continua o quiz. O rápido continua na pergunta 17 do completo sem repetir as 16 iniciais.

“Reiniciar e apagar progresso” remove somente a sessão desta versão. Sem segredos ou autenticação no localStorage. Se o navegador bloquear armazenamento, o quiz funciona em memória e informa a limitação.

Versões de modelo usam chaves separadas; arquivos de versões antigas são preservados, sem migração nem tela de consulta automática. Não há sincronização entre abas/dispositivos; duas abas podem sobrescrever a mesma sessão. Dados locais podem ser removidos pelo navegador.

Compatibilidade é proximidade matemática entre perfis. Cobertura, profundidade e concordância das respostas são indicadores distintos; nenhum declara probabilidade de acerto psicológico.
