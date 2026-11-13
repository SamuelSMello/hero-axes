export const AXES = [
  { id: "strategy", label: "Planejamento", low: "Decisão no momento", high: "Preparação antecipada" },
  { id: "empathy", label: "Empatia", low: "Distanciamento afetivo", high: "Atenção à experiência alheia" },
  { id: "autonomy", label: "Autonomia", low: "Busca de orientação", high: "Direção própria" },
  { id: "impulsivity", label: "Impulsividade", low: "Pausa antes de reagir", high: "Reação imediata" },
  { id: "dominance", label: "Centralização", low: "Decisão distribuída", high: "Controle concentrado" },
  { id: "cooperation", label: "Cooperação", low: "Trabalho individual", high: "Trabalho interdependente" },
  { id: "risk", label: "Tolerância ao risco", low: "Preferência por previsibilidade", high: "Aceitação de incerteza" },
  { id: "flexibility", label: "Flexibilidade", low: "Persistência no método", high: "Revisão do método" },
] as const;
export type AxisId = typeof AXES[number]["id"];
export type Profile = Record<AxisId, number>;
export type PartialProfile = Record<AxisId, number | null>;
export const AXIS_WEIGHTS: Readonly<Profile> = Object.freeze({
  strategy: 1, empathy: 1, autonomy: 1, impulsivity: 1,
  dominance: 1, cooperation: 1, risk: 1, flexibility: 1,
});
export function assertProfile(value: unknown): asserts value is Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Perfil inválido");
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== AXES.length || AXES.some(axis =>
    !Object.hasOwn(record, axis.id) || typeof record[axis.id] !== "number" || !Number.isFinite(record[axis.id]) ||
    (record[axis.id] as number) < 0 || (record[axis.id] as number) > 100))
    throw new Error("O perfil deve conter exatamente os oito eixos, entre 0 e 100");
}
export function describeAxis(id: AxisId, value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error("Valor de eixo inválido");
  const axis = AXES.find(axis => axis.id === id)!;
  return value < 40 ? axis.low : value > 60 ? axis.high : "Equilíbrio entre os dois polos";
}
