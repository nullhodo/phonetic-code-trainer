import { atom } from "jotai";
import { NATO_ALPHABET } from "../constants/natoAlphabet";
import {
    WEIGHT_DECREASE,
    WEIGHT_INCREASE,
    WEIGHT_INITIAL,
    WEIGHT_MAX,
    WEIGHT_MIN
} from "../constants/practiceWords";
import type { MultipleStatsUpdate, Stats, ViewType, Weights } from "../types";

export const currentViewAtom = atom<ViewType>("quiz");

const initialWeights: Weights = {};
const initialStats: Stats = {};
for (const key of Object.keys(NATO_ALPHABET)) {
    initialWeights[key] = WEIGHT_INITIAL;
    initialStats[key] = { correct: 0, wrong: 0 };
}

export const weightsAtom = atom<Weights>(initialWeights);
export const statsAtom = atom<Stats>(initialStats);

export const updateMultipleStatsAndWeightsAtom = atom(
    null,
    (get, set, updates: MultipleStatsUpdate[]) => {
        const prevWeights = get(weightsAtom);
        const newWeights = { ...prevWeights };

        const prevStats = get(statsAtom);
        const newStats = { ...prevStats };

        for (const { letter, isCorrect } of updates) {
            const currentWeight = newWeights[letter] ?? WEIGHT_INITIAL;
            const newWeight = isCorrect
                ? currentWeight - WEIGHT_DECREASE
                : currentWeight + WEIGHT_INCREASE;
            newWeights[letter] = Math.max(
                WEIGHT_MIN,
                Math.min(WEIGHT_MAX, newWeight)
            );

            const stat = prevStats[letter] || { correct: 0, wrong: 0 };
            newStats[letter] = {
                correct: stat.correct + (isCorrect ? 1 : 0),
                wrong: stat.wrong + (isCorrect ? 0 : 1)
            };
        }

        set(weightsAtom, newWeights);
        set(statsAtom, newStats);
    }
);
