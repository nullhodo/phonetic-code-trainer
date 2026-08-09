import { useAtom, useSetAtom } from "jotai";
import { AlertCircle, ArrowRight, Check, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NATO_ALPHABET } from "../constants/natoAlphabet";
import { PRACTICE_WORDS } from "../constants/practiceWords";
import {
    currentViewAtom,
    updateMultipleStatsAndWeightsAtom
} from "../store/atoms";
import type { FeedbackType, PracticeResult, QuizStep } from "../types";
import { normalizeString } from "../utils/levenshtein";
import { calculatePracticeResults } from "../utils/practiceCalculator";
import { Kbd } from "./Kbd";

export const PracticeView: React.FC = () => {
    const updateStatsAndWeights = useSetAtom(updateMultipleStatsAndWeightsAtom);
    const [currentView] = useAtom(currentViewAtom);

    const [currentWord, setCurrentWord] = useState<string>("");
    const [practiceInputValue, setPracticeInputValue] = useState<string>("");
    const [practiceStep, setPracticeStep] = useState<QuizStep>("question");
    const [practiceFeedbackType, setPracticeFeedbackType] =
        useState<FeedbackType>(null);
    const [practiceResults, setPracticeResults] = useState<PracticeResult[]>(
        []
    );

    const practiceInputRef = useRef<HTMLInputElement>(null);

    const selectNextPracticeWord = useCallback(() => {
        setCurrentWord((prevWord) => {
            if (PRACTICE_WORDS.length <= 1) return PRACTICE_WORDS[0] || "apple";
            let randomIndex = Math.floor(Math.random() * PRACTICE_WORDS.length);
            while (PRACTICE_WORDS[randomIndex] === prevWord) {
                randomIndex = Math.floor(Math.random() * PRACTICE_WORDS.length);
            }
            return PRACTICE_WORDS[randomIndex] || "apple";
        });
    }, []);

    const handlePracticeSubmit = () => {
        if (!practiceInputValue.trim()) return;

        const normalizedInput = normalizeString(practiceInputValue);
        const results = calculatePracticeResults(normalizedInput, currentWord);

        const hasWrong = results.some((r) => r.status === "wrong");
        const hasTypo = results.some((r) => r.status === "typo_correct");

        if (hasWrong) {
            setPracticeFeedbackType("wrong");
        } else if (hasTypo) {
            setPracticeFeedbackType("typo_correct");
        } else {
            setPracticeFeedbackType("correct");
        }

        setPracticeResults(results);
        setPracticeStep("feedback");

        const updates = results.map((r) => ({
            letter: r.letter,
            isCorrect: r.status === "correct" || r.status === "typo_correct"
        }));
        updateStatsAndWeights(updates);
    };

    const handlePracticeSkip = () => {
        const letters = currentWord.toUpperCase().split("");
        const results: PracticeResult[] = letters.map((letter) => ({
            letter,
            expected: normalizeString(NATO_ALPHABET[letter]?.code || ""),
            input: "",
            distance: 0,
            status: "skipped"
        }));

        setPracticeResults(results);
        setPracticeFeedbackType("skipped");
        setPracticeStep("feedback");

        const updates = letters.map((letter) => ({
            letter,
            isCorrect: false
        }));
        updateStatsAndWeights(updates);
    };

    const goToNextPracticeWord = useCallback(() => {
        setPracticeInputValue("");
        setPracticeStep("question");
        setPracticeFeedbackType(null);
        setPracticeResults([]);
        selectNextPracticeWord();
    }, [selectNextPracticeWord]);

    useEffect(() => {
        selectNextPracticeWord();
    }, [selectNextPracticeWord]);

    useEffect(() => {
        if (currentView === "practice" && practiceStep === "question") {
            const timer = setTimeout(() => {
                practiceInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentView, practiceStep]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (practiceStep === "question") {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handlePracticeSubmit();
            } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                handlePracticeSkip();
            }
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (currentView === "practice" && practiceStep === "feedback") {
                if (e.key === "Enter") {
                    e.preventDefault();
                    goToNextPracticeWord();
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [currentView, practiceStep, goToNextPracticeWord]);

    return (
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
                <div className="text-7xl font-bold text-gray-800 tracking-tighter uppercase">
                    {currentWord}
                </div>
            </div>

            {practiceStep === "question" && (
                <div className="space-y-4">
                    <input
                        ref={practiceInputRef}
                        type="text"
                        value={practiceInputValue}
                        onChange={(e) => setPracticeInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        className="w-full text-center text-xl p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handlePracticeSkip}
                            className="flex-1 py-4 text-gray-600 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>スキップ</span>
                            <Kbd>Esc</Kbd>
                        </button>
                        <button
                            type="button"
                            onClick={handlePracticeSubmit}
                            disabled={!practiceInputValue.trim()}
                            className="flex-1 py-4 text-white bg-blue-600 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                            <span>判定する</span>
                            <Kbd className="bg-blue-500/80 text-white border-blue-400/50 shadow-none">
                                Enter
                            </Kbd>
                        </button>
                    </div>
                </div>
            )}

            {practiceStep === "feedback" && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-200">
                    <div
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center ${
                            practiceFeedbackType === "correct"
                                ? "bg-green-100 text-green-700"
                                : practiceFeedbackType === "typo_correct"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : practiceFeedbackType === "wrong"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                        }`}
                    >
                        {practiceFeedbackType === "correct" && (
                            <>
                                <Check className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    正解！
                                </span>
                            </>
                        )}
                        {practiceFeedbackType === "typo_correct" && (
                            <>
                                <AlertCircle className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    正解（タイポ許容）
                                </span>
                            </>
                        )}
                        {practiceFeedbackType === "wrong" && (
                            <>
                                <X className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    不正解
                                </span>
                            </>
                        )}
                        {practiceFeedbackType === "skipped" && (
                            <span className="text-2xl font-bold py-2">
                                全文字不正解扱い
                            </span>
                        )}
                    </div>

                    {/* 文字ごとの判定結果をリスト表示 */}
                    <div className="flex flex-col items-stretch space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {practiceResults.map((result, index) => (
                            <div
                                key={`${result.letter}-${index}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center text-xl mb-1 sm:mb-0">
                                    <span className="font-bold text-blue-600 w-8 text-center">
                                        {result.letter}
                                    </span>
                                    <span className="text-gray-400 mx-2">
                                        -
                                    </span>
                                    <span className="font-bold text-gray-800 tracking-wider">
                                        {NATO_ALPHABET[result.letter]?.display}
                                    </span>
                                </div>

                                <div
                                    className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                                        result.status === "correct"
                                            ? "bg-green-100 text-green-700"
                                            : result.status === "typo_correct"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : result.status === "wrong"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {result.status === "correct" && (
                                        <Check className="w-4 h-4 mr-1" />
                                    )}
                                    {result.status === "typo_correct" && (
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                    )}
                                    {(result.status === "wrong" ||
                                        result.status === "skipped") && (
                                        <X className="w-4 h-4 mr-1" />
                                    )}

                                    {result.status === "skipped" ? (
                                        <span className="ml-1 tracking-wider">
                                            スキップ
                                        </span>
                                    ) : result.input ? (
                                        <span className="ml-1 tracking-wider">
                                            {result.input}
                                        </span>
                                    ) : (
                                        <span className="ml-1 italic opacity-70">
                                            入力なし
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={goToNextPracticeWord}
                        className="w-full flex flex-col items-center justify-center py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 transition-colors gap-1 shadow-md"
                    >
                        <div className="flex items-center font-bold">
                            <span>次の問題へ</span>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                        <Kbd className="bg-gray-700 text-gray-200 border-gray-600 shadow-none">
                            Enter
                        </Kbd>
                    </button>
                </div>
            )}
        </div>
    );
};
