export type CurriculumLayer = "kenya-cbc" | "usa-standards" | "england-national";

export type LearningMode =
  | "learn"
  | "play"
  | "explore"
  | "solve"
  | "explain"
  | "challenge"
  | "practice"
  | "master"
  | "create";

export type MasteryState = "not_attempted" | "needs_support" | "developing" | "mastered";

export interface CurriculumContext {
  layer: CurriculumLayer;
  frameworkCode: string;
  displayName: string;
  level: string;
  subject: string;
}

export interface MasteryEvidence {
  skillCode: string;
  score: number;
  confidence: number;
  state: MasteryState;
  evidenceCount: number;
}
