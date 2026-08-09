import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { AlertCircle, ArrowRight, Check, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NATO_ALPHABET } from "../constants/natoAlphabet";
import { HISTORY_LENGTH } from "../constants/practiceWords";
import {
    currentViewAtom,
    updateMultipleStatsAndWeightsAtom,
    weightsAtom
} from "../store/atoms";
import type { FeedbackType, QuizStep } from "../types";
import { levenshteinDistance, normalizeString } from "../utils/levenshtein";

export const QuizView: React.FC = () => {
    const [weights] = useAtom(weightsAtom);
    const updateStatsAndWeights = useSetAtom(updateMultipleStatsAndWeightsAtom);
    const [currentView] = useAtom(currentViewAtom);

    const [currentLetter, setCurrentLetter] = useState<string>("A");
    const [inputValue, setInputValue] = useState<string>("");
    const [quizStep, setQuizStep] = useState<QuizStep>("question");
    const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const recentHistoryRef = useRef<string[]>([]);

    const selectNextLetter = useCallback(() => {
        const prevHistory = recentHistoryRef.current;
        const availableKeys = Object.keys(weights).filter(
            (k) => !prevHistory.includes(k)
        );
        let totalWeight = 0;
        for (const k of availableKeys) {
            totalWeight += weights[k] ?? 1;
        }
        let random = Math.random() * totalWeight;
        let selectedLetter = availableKeys[0] || "A";

        for (let i = 0; i < availableKeys.length; i++) {
            random -= weights[availableKeys[i]] ?? 1;
            if (random <= 0) {
                selectedLetter = availableKeys[i];
                break;
            }
        }

        setCurrentLetter(selectedLetter);
        recentHistoryRef.current = [selectedLetter, ...prevHistory].slice(
            0,
            HISTORY_LENGTH
        );
    }, [weights]);

    const handleAnswerSubmit = () => {
        if (!inputValue.trim()) return;

        const correctAnswer = NATO_ALPHABET[currentLetter]?.code || "";
        const normalizedInput = normalizeString(inputValue);
        const normalizedCorrect = normalizeString(correctAnswer);

        const distance = levenshteinDistance(
            normalizedInput,
            normalizedCorrect
        );

        const isPerfect = distance === 0;
        const isCorrect = distance <= 1;

        if (isPerfect) setFeedbackType("correct");
        else if (isCorrect) setFeedbackType("typo_correct");
        else setFeedbackType("wrong");

        setQuizStep("feedback");
        updateStatsAndWeights([{ letter: currentLetter, isCorrect }]);
    };

    const handleSkip = () => {
        setFeedbackType("skipped");
        setQuizStep("feedback");
    };

    const goToNextQuestion = useCallback(() => {
        setInputValue("");
        setQuizStep("question");
        setFeedbackType(null);
        selectNextLetter();
    }, [selectNextLetter]);

    const handleSelfAssessment = useCallback(
        (isCorrect: boolean) => {
            updateStatsAndWeights([{ letter: currentLetter, isCorrect }]);
            goToNextQuestion();
        },
        [currentLetter, goToNextQuestion, updateStatsAndWeights]
    );

    useEffect(() => {
        selectNextLetter();
    }, [selectNextLetter]);

    useEffect(() => {
        if (currentView === "quiz" && quizStep === "question") {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentView, quizStep]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (quizStep === "question") {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleAnswerSubmit();
            } else if (e.key === " " || e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();
                handleSkip();
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

            if (currentView === "quiz" && quizStep === "feedback") {
                if (feedbackType === "skipped") {
                    const key = e.key.toLowerCase();
                    if (key === "x" || key === "n") handleSelfAssessment(false);
                    else if (key === "o" || key === "y")
                        handleSelfAssessment(true);
                } else if (
                    feedbackType === "correct" ||
                    feedbackType === "typo_correct" ||
                    feedbackType === "wrong"
                ) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        goToNextQuestion();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [
        currentView,
        quizStep,
        feedbackType,
        handleSelfAssessment,
        goToNextQuestion
    ]);

    const currentData = NATO_ALPHABET[currentLetter];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8"
        >
            <div className="text-center mb-8">
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    単文字クイズ
                </span>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentLetter}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="text-8xl font-extrabold text-gray-800 my-6 tracking-wider"
                    >
                        {currentLetter}
                    </motion.div>
                </AnimatePresence>
                <p className="text-gray-500 text-sm">
                    このアルファベットのフォネティックコードを入力してください
                </p>
            </div>

            {quizStep === "question" ? (
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="例: Alpha"
                            className="w-full px-6 py-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex flex-col items-center justify-center"
                        >
                            <span>パス</span>
                            <span className="text-xs font-normal opacity-60">
                                Key: Space
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleAnswerSubmit}
                            className="w-2/3 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex flex-col items-center justify-center shadow-md"
                        >
                            <span>回答する</span>
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
                    {feedbackType === "correct" && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-green-100 text-green-600 rounded-full mb-2">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800">
                                正解！
                            </h3>
                            <p className="text-green-700 text-lg mt-1 font-semibold">
                                {currentData?.display}
                            </p>
                        </div>
                    )}

                    {feedbackType === "typo_correct" && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-amber-800">
                                惜しい！(タイポ検出)
                            </h3>
                            <p className="text-amber-700 text-lg mt-1 font-semibold">
                                正しいコード: {currentData?.display}
                            </p>
                            <p className="text-amber-600 text-sm mt-1">
                                あなたの入力: {inputValue}
                            </p>
                        </div>
                    )}

                    {feedbackType === "wrong" && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                            <div className="inline-flex p-2 bg-red-100 text-red-600 rounded-full mb-2">
                                <X className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-red-800">
                                不正解
                            </h3>
                            <p className="text-red-700 text-lg mt-1 font-semibold">
                                正しいコード: {currentData?.display}
                            </p>
                            <p className="text-red-600 text-sm mt-1">
                                あなたの入力: {inputValue}
                            </p>
                        </div>
                    )}

                    {feedbackType === "skipped" && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                正解: {currentData?.display}
                            </h3>
                            <p className="text-gray-600 text-sm mt-2 mb-4">
                                正解を自覚できていましたか？
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSelfAssessment(false)}
                                    className="px-5 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" /> いいえ (Key: X /
                                    N)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSelfAssessment(true)}
                                    className="px-5 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" /> はい (Key: O /
                                    Y)
                                </button>
                            </div>
                        </div>
                    )}

                    {feedbackType !== "skipped" && (
                        <button
                            type="button"
                            onClick={goToNextQuestion}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                            <span>次の問題へ</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};
