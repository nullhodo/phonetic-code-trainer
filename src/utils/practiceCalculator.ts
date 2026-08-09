import { NATO_ALPHABET } from "../constants/natoAlphabet";
import type { PracticeResult, PracticeResultStatus } from "../types";
import { levenshteinDistance, normalizeString } from "./levenshtein";

export const calculatePracticeResults = (
    inputStr: string,
    word: string
): PracticeResult[] => {
    const letters = word.toUpperCase().split("");
    const expectedCodes = letters.map((char) =>
        normalizeString(NATO_ALPHABET[char]?.code ?? "")
    );
    const n = expectedCodes.length;
    const m = inputStr.length;

    const dp: number[][] = Array.from({ length: n + 1 }, () =>
        Array(m + 1).fill(Number.POSITIVE_INFINITY)
    );
    const back: number[][] = Array.from({ length: n + 1 }, () =>
        Array(m + 1).fill(0)
    );

    dp[0][0] = 0;

    for (let i = 1; i <= n; i++) {
        const expected = expectedCodes[i - 1];
        for (let j = 0; j <= m; j++) {
            for (let k = 0; k <= j; k++) {
                if (dp[i - 1][k] === Number.POSITIVE_INFINITY) continue;
                const subInput = inputStr.substring(k, j);
                const dist = levenshteinDistance(subInput, expected);
                const totalDist = dp[i - 1][k] + dist;
                if (totalDist < dp[i][j]) {
                    dp[i][j] = totalDist;
                    back[i][j] = k;
                }
            }
        }
    }

    let currJ = m;
    const results: PracticeResult[] = [];
    for (let i = n; i > 0; i--) {
        const prevJ = back[i][currJ];
        const subInput = inputStr.substring(prevJ, currJ);
        const expected = expectedCodes[i - 1];
        const letter = letters[i - 1];
        const dist = levenshteinDistance(subInput, expected);

        let status: PracticeResultStatus = "wrong";
        if (dist === 0) status = "correct";
        else if (dist <= 1) status = "typo_correct";

        results.unshift({
            letter,
            expected,
            input: subInput,
            distance: dist,
            status
        });

        currJ = prevJ;
    }
    return results;
};
