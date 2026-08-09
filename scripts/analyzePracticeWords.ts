import { PRACTICE_WORDS } from "../src/constants/practiceWords";

function analyze() {
    const totalWords = PRACTICE_WORDS.length;
    let totalChars = 0;
    const wordLengthCount: Record<number, number> = {};
    const letterFrequency: Record<string, number> = {};
    const wordCoverage: Record<string, number> = {};

    // A-Z 初期化
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        letterFrequency[char] = 0;
        wordCoverage[char] = 0;
    }

    for (const word of PRACTICE_WORDS) {
        const upperWord = word.toUpperCase();
        const len = upperWord.length;
        totalChars += len;
        wordLengthCount[len] = (wordLengthCount[len] || 0) + 1;

        const uniqueCharsInWord = new Set(upperWord);
        for (const char of uniqueCharsInWord) {
            if (wordCoverage[char] !== undefined) {
                wordCoverage[char]++;
            }
        }

        for (const char of upperWord) {
            if (letterFrequency[char] !== undefined) {
                letterFrequency[char]++;
            } else {
                letterFrequency[char] = 1;
            }
        }
    }

    const sortedFrequency = Object.entries(letterFrequency).sort(
        (a, b) => b[1] - a[1]
    );

    console.log("==========================================");
    console.log("       PRACTICE WORDS STATISTICS          ");
    console.log("==========================================");
    console.log(`総単語数 (Total Words): ${totalWords}`);
    console.log(`総文字数 (Total Characters): ${totalChars}`);
    console.log(
        `平均単語長 (Average Length): ${(totalChars / totalWords).toFixed(2)} 文字`
    );
    console.log("\n--- 単語長分布 (Word Length Distribution) ---");
    for (const [len, count] of Object.entries(wordLengthCount).sort(
        (a, b) => Number(a[0]) - Number(b[0])
    )) {
        console.log(
            `  ${len} 文字: ${count} 単語 (${((count / totalWords) * 100).toFixed(1)}%)`
        );
    }

    console.log("\n--- アルファベット別出現頻度 (Letter Frequencies) ---");
    console.log("順位 | 文字 | 出現回数 | 構成比 (%) | 登場単語数 (カバー率)");
    console.log("-----+------+----------+------------+-----------------------");
    sortedFrequency.forEach(([char, count], idx) => {
        const pct = ((count / totalChars) * 100).toFixed(2);
        const cov = wordCoverage[char] || 0;
        const covPct = ((cov / totalWords) * 100).toFixed(1);
        console.log(
            ` #${(idx + 1).toString().padStart(2, " ")} |   ${char}  | ${count
                .toString()
                .padStart(6, " ")}   |   ${pct.padStart(5, " ")}%   | ${cov
                .toString()
                .padStart(4, " ")} / ${totalWords} (${covPct}%)`
        );
    });

    const unusedLetters = Object.entries(letterFrequency)
        .filter(([_, count]) => count === 0)
        .map(([char]) => char);

    console.log("\n--- 出現しない文字 (Unused Letters) ---");
    console.log(
        unusedLetters.length > 0
            ? unusedLetters.join(", ")
            : "なし (全26文字が出現)"
    );
    console.log("==========================================\n");
}

analyze();
