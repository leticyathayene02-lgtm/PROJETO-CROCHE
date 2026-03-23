export type StageBreakdown = {
  stage: string;
  label: string;
  minutes: number;
};

export type OrderTimeSummary = {
  totalMinutes: number;
  stages: StageBreakdown[];
};
