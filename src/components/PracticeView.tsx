import { AnimatePresence, motion } from "framer-motion";
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
        let randomIndex = Math.floor(Math.random() * PRACTICE_WORDS.length);
        while (
            PRACTICE_WORDS[randomIndex] === currentWord &&
            PRACTICE_WORDS.length > 1
        ) {
            randomIndex = Math.floor(Math.random() * PRACTICE_WORDS.length);
        }
        setCurrentWord(PRACTICE_WORDS[randomIndex] || "code");
    }, [currentWord]);

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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8"
        >
            <div className="text-center mb-8">
                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    単語実践練習
                </span>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWord}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="text-5xl font-extrabold text-gray-800 my-6 tracking-widest uppercase"
                    >
                        {currentWord}
                    </motion.div>
                </AnimatePresence>
                <p className="text-gray-500 text-sm">
                    単語全体をフォネティックコードで連続入力してください (例:
                    apple → alpha papa papa lima echo)
                </p>
            </div>

            {practiceStep === "question" ? (
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            ref={practiceInputRef}
                            type="text"
                            value={practiceInputValue}
                            onChange={(e) =>
                                setPracticeInputValue(e.target.value)
                            }
                            onKeyDown={handleInputKeyDown}
                            placeholder="alphapapapapalimaecho"
                            className="w-full px-6 py-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handlePracticeSkip}
                            className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex flex-col items-center justify-center"
                        >
                            <span>パス</span>
                            <span className="text-xs font-normal opacity-60">
                                Key: Esc
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePracticeSubmit}
                            className="w-2/3 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors flex flex-col items-center justify-center shadow-md"
                        >
                            <span>判定する</span>
                            <span className="text-xs font-normal opacity-80">
                                Key: Enter
                            </span>
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    {practiceFeedbackType === "correct" && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-green-100 text-green-600 rounded-full mb-2">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800">
                                完全正解！
                            </h3>
                        </div>
                    )}

                    {practiceFeedbackType === "typo_correct" && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-amber-800">
                                一部タイポあり（合格判定）
                            </h3>
                        </div>
                    )}

                    {(practiceFeedbackType === "wrong" ||
                        practiceFeedbackType === "skipped") && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-red-100 text-red-600 rounded-full mb-2">
                                <X className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-red-800">
                                {practiceFeedbackType === "skipped"
                                    ? "スキップしました"
                                    : "不正解の文字があります"}
                            </h3>
                        </div>
                    )}

                    {/* 各文字ごとの判定内訳表示 */}
                    <div className="grid grid-cols-1 gap-3">
                        {practiceResults.map((res, idx) => {
                            let bgClass = "bg-gray-50 border-gray-200";
                            let badgeClass = "bg-gray-200 text-gray-700";
                            let statusText = "パス";

                            if (res.status === "correct") {
                                bgClass = "bg-green-50 border-green-200";
                                badgeClass = "bg-green-100 text-green-700";
                                statusText = "正解";
                            } else if (res.status === "typo_correct") {
                                bgClass = "bg-amber-50 border-amber-200";
                                badgeClass = "bg-amber-100 text-amber-700";
                                statusText = "タイポ合格";
                            } else if (res.status === "wrong") {
                                bgClass = "bg-red-50 border-red-200";
                                badgeClass = "bg-red-100 text-red-700";
                                statusText = "不正解";
                            }

                            return (
                                <div
                                    key={`${res.letter}-${idx}`}
                                    className={`p-3 border rounded-xl flex items-center justify-between ${bgClass}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-9 h-9 flex items-center justify-center bg-white rounded-lg font-extrabold text-gray-800 text-lg shadow-sm border border-gray-100">
                                            {res.letter}
                                        </span>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {
                                                    NATO_ALPHABET[res.letter]
                                                        ?.display
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                入力:{" "}
                                                <span className="font-mono text-gray-700">
                                                    {res.input || "(なし)"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeClass}`}
                                    >
                                        {statusText}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={goToNextPracticeWord}
                        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        <span>次の単語へ</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
