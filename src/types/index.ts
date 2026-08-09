export type NatoAlphabet = Record<
    string,
    {
        code: string;
        display: string;
    }
>;

export type StatItem = {
    correct: number;
    wrong: number;
};

export type Stats = Record<string, StatItem>;

export type Weights = Record<string, number>;

export type QuizStep = "question" | "feedback";

export type FeedbackType =
    | "correct"
    | "typo_correct"
    | "wrong"
    | "skipped"
    | null;

export type ViewType = "quiz" | "practice" | "list";

export type PracticeResultStatus =
    | "correct"
    | "typo_correct"
    | "wrong"
    | "skipped";

export type PracticeResult = {
    letter: string;
    expected: string;
    input: string;
    distance: number;
    status: PracticeResultStatus;
};

export type MultipleStatsUpdate = {
    letter: string;
    isCorrect: boolean;
};
