# Auditoria de distribuição e alcance

Diagnóstico determinístico, não estimativa de prevalência humana. Halton: alternativas 1–5 independentes por item, 4096 casos por modo. Grade: 3^8 perfis {0,50,100}, 6561 por modo. Empates dividem a contagem. Testemunhas de alcance arredondam cada eixo ao valor alcançável mais próximo.

Versões: weighted-rms-1.0.0 / behavioral-1.1.0 / marvel-616-editorial-1.0.1

## Alcance

quick: 24/24 personagens com uma testemunha realizável pelo questionário.

full: 24/24 personagens com uma testemunha realizável pelo questionário.

Uma testemunha prova possibilidade, não frequência provável nem robustez a mudanças nas respostas.

## Faixas do catálogo

|Eixo|Mínimo|Máximo|
|---|---|---|
|strategy|20|98|
|empathy|0|95|
|autonomy|75|98|
|impulsivity|20|95|
|dominance|20|100|
|cooperation|10|95|
|risk|45|95|
|flexibility|20|95|

## Frequência sintética

Não se busca distribuição uniforme. Respostas independentes tendem ao centro conforme aumenta o número de itens; a grade explora extremos sem representar usuários reais.

|Personagem|Halton rápido (4096)|Halton completo (4096)|Grade rápido (6561)|Grade completo (6561)|
|---|---|---|---|---|
|Homem de Ferro|0.77%|0.65%|0.86%|0.86%|
|Capitão América|2.88%|0.76%|5.16%|5.16%|
|Homem-Aranha|2.04%|0.31%|5.93%|5.93%|
|Thor|7.09%|5.29%|7.32%|7.32%|
|Hulk|7.70%|3.34%|12.06%|12.06%|
|Doutor Estranho|1.64%|0.89%|2.18%|2.18%|
|Pantera Negra|3.98%|2.26%|4.88%|4.88%|
|Viúva Negra|4.00%|2.37%|5.00%|5.00%|
|Gavião Arqueiro|0.83%|0.05%|2.22%|2.22%|
|Feiticeira Escarlate|28.80%|53.16%|11.13%|11.13%|
|Wolverine|4.33%|3.41%|4.10%|4.10%|
|Demolidor|4.71%|2.92%|4.94%|4.94%|
|Doutor Destino|0.00%|0.00%|0.08%|0.08%|
|Thanos|0.29%|0.00%|1.56%|1.56%|
|Ultron|0.05%|0.00%|0.43%|0.43%|
|Loki|0.57%|0.18%|1.13%|1.13%|
|Magneto|1.50%|1.18%|1.24%|1.24%|
|Caveira Vermelha|0.59%|0.10%|3.02%|3.02%|
|Duende Verde|0.39%|0.00%|1.80%|1.80%|
|Rei do Crime|4.08%|3.27%|5.49%|5.49%|
|Kang|0.15%|0.00%|0.75%|0.75%|
|Hela|9.91%|7.64%|7.58%|7.58%|
|Mystério|12.65%|11.67%|9.81%|9.81%|
|Killmonger|1.05%|0.55%|1.34%|1.34%|

## Cenários comportamentais

|Cenário|Modo|Primeiro|Compatibilidade|Segundo|
|---|---|---|---|---|
|neutral|quick|scarlet-witch|77.92%|thor|
|strategic|quick|doctor-strange|91.95%|black-panther|
|compassionate|quick|captain-america|87.85%|black-widow|
|impulsive|quick|hulk|95.16%|wolverine|
|authoritarian|quick|hela|92.00%|thanos|
|cautious-collaborator|quick|captain-america|66.12%|black-widow|
|independent-explorer|quick|scarlet-witch|71.92%|wolverine|
|structured-coordinator|quick|captain-america|75.02%|black-panther|
|reserved-specialist|quick|mysterio|65.59%|kingpin|
|reactive-collaborator|quick|scarlet-witch|76.63%|spider-man|
|rigid-independent|quick|hela|76.42%|red-skull|
|flexible-facilitator|quick|spider-man|78.37%|hawkeye|
|neutral|full|scarlet-witch|77.92%|thor|
|strategic|full|doctor-strange|91.16%|black-panther|
|compassionate|full|captain-america|85.86%|black-widow|
|impulsive|full|hulk|96.05%|wolverine|
|authoritarian|full|red-skull|92.29%|hela|
|cautious-collaborator|full|captain-america|64.47%|black-panther|
|independent-explorer|full|scarlet-witch|71.06%|wolverine|
|structured-coordinator|full|black-panther|74.32%|captain-america|
|reserved-specialist|full|mysterio|63.94%|kingpin|
|reactive-collaborator|full|scarlet-witch|75.25%|spider-man|
|rigid-independent|full|hela|76.02%|red-skull|
|flexible-facilitator|full|spider-man|78.79%|hawkeye|

## Interpretação

O catálogo se concentra em autonomia elevada (75–98) e risco elevado (45–95). Perfis dependentes de orientação ou avessos a risco ficam fora dessas faixas. O mais próximo entre 24 pode ainda ser distante em eixos relevantes. Autonomia não é domínio sobre outras pessoas; empatia não é cooperação. Não houve ajuste de pesos ou valores para mudar a frequência de personagens.

Respostas neutras podem produzir concordância interna de 100% por construção. Isso não significa certeza ou validade. O modo completo pode alterar o resultado por coletar respostas novas; aumentar itens não garante estabilidade para respostas contraditórias ou independentes.
