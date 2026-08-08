export type ResultDetail = {
  questionId: string;
  statement: string;
  selectedChoices: string[];
  correctChoices: string[];
  isCorrect: boolean;
  explanation: string | null;
};
