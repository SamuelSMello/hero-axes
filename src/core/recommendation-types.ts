import type { AxisId } from "../domain/axes.ts";
import type { CharacterId } from "../domain/catalog.ts";

export type MediaType = "movie" | "series" | "comic";
export type Continuity = "comics-616" | "mcu" | "fox-xmen";
export type ReviewState = "source-verified" | "pending" | "rejected";
export type Spoilers = "none" | "premise" | "major";
export type NarrativeRole = "lead" | "co-lead" | "antagonist" | "supporting" | "cameo";
export type EditorialSource = {
 id: string; title: string; url: string; publisher: string;
 kind: "official-synopsis" | "official-guide" | "secondary-analysis";
 checkedOn: string; verification: "indexed-text" | "page-text";
};
export type Work = {
 id: string; storyKey: string; type: MediaType; title: string; year: number;
 continuity: Continuity; reference: string; review: ReviewState; spoilers: Spoilers;
 externalIds: {marvel?: string; tmdb?: number; isbn?: string; openLibrary?: string};
 links: readonly {label: string; url: string; official: boolean}[];
 sources: readonly string[];
 participants: readonly {characterId: CharacterId; incarnation: string; role: NarrativeRole; sourceIds: readonly string[]}[];
};
export type TraitEvidence = {
 id: string; workId: string; characterId: CharacterId; axis: AxisId; pole: "low" | "high";
 manifestation: string; rationale: string; locator: string;
 sourceIds: readonly string[]; review: ReviewState; spoilers: Spoilers;
};
export type CuratorialGap = {characterId: CharacterId; media: MediaType | "any"; reason: string; candidateTitle?: string};
export type RecommendationCatalog = {
 version: string;
 supportedModels: readonly {algorithm:string; questionnaire:string; catalog:string}[];
 sources: readonly EditorialSource[]; works: readonly Work[]; evidence: readonly TraitEvidence[];
 pending: readonly CuratorialGap[];
};
export const CONTINUITY_LABELS: Record<Continuity,string> = {
 "comics-616":"Quadrinhos · Terra-616", mcu:"MCU · adaptação audiovisual", "fox-xmen":"Filmes X-Men / Fox · outra continuidade",
};
