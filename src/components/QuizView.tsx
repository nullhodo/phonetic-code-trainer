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

    const weightsRef = useRef(weights);
    weightsRef.current = weights;

    const selectNextLetter = useCallback(() => {
        const prevHistory = recentHistoryRef.current;
        const currentWeights = weightsRef.current;
        const availableKeys = Object.keys(currentWeights).filter(
            (k) => !prevHistory.includes(k)
        );
        let totalWeight = 0;
        for (const k of availableKeys) {
            totalWeight += currentWeights[k] ?? 1;
        }
        let random = Math.random() * totalWeight;
        let selectedLetter = availableKeys[0] || "A";

        for (let i = 0; i < availableKeys.length; i++) {
            random -= currentWeights[availableKeys[i]] ?? 1;
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
    }, []);

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
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
                <div className="text-9xl font-bold text-gray-800 tracking-tighter">
                    {currentLetter}
                </div>
            </div>

            {quizStep === "question" && (
                <div className="space-y-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        className="w-full text-center text-2xl p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="flex-1 py-4 text-gray-500 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            スキップ (Space)
                        </button>
                        <button
                            type="button"
                            onClick={handleAnswerSubmit}
                            disabled={!inputValue.trim()}
                            className="flex-1 py-4 text-white bg-blue-600 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            判定する (Enter)
                        </button>
                    </div>
                </div>
            )}

            {quizStep === "feedback" && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-200">
                    <div
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center ${
                            feedbackType === "correct"
                                ? "bg-green-100 text-green-700"
                                : feedbackType === "typo_correct"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : feedbackType === "wrong"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                        }`}
                    >
                        {feedbackType === "correct" && (
                            <>
                                <Check className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    正解！
                                </span>
                            </>
                        )}
                        {feedbackType === "typo_correct" && (
                            <>
                                <AlertCircle className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    正解（タイポ許容）
                                </span>
                            </>
                        )}
                        {feedbackType === "wrong" && (
                            <>
                                <X className="w-12 h-12 mb-2" />
                                <span className="text-2xl font-bold">
                                    不正解
                                </span>
                            </>
                        )}
                        {feedbackType === "skipped" && (
                            <span className="text-2xl font-bold py-2">
                                答え
                            </span>
                        )}
                    </div>

                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800 mb-1 tracking-wider">
                            {currentData?.display}
                        </div>
                    </div>

                    {feedbackType === "skipped" ? (
                        <div className="space-y-3">
                            <p className="text-center text-gray-500 font-medium">
                                答えを知っていましたか？
                            </p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSelfAssessment(true)}
                                    className="flex-1 flex flex-col items-center justify-center py-4 bg-green-50 text-green-600 rounded-2xl border-2 border-green-200 hover:bg-green-100 transition-colors"
                                >
                                    <Check className="w-8 h-8 mb-1" />
                                    <span className="font-bold mb-1">
                                        わかっていた
                                    </span>
                                    <span className="text-xs font-normal opacity-70">
                                        キー: O / Y
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSelfAssessment(false)}
                                    className="flex-1 flex flex-col items-center justify-center py-4 bg-red-50 text-red-600 rounded-2xl border-2 border-red-200 hover:bg-red-100 transition-colors"
                                >
                                    <X className="w-8 h-8 mb-1" />
                                    <span className="font-bold mb-1">
                                        わからなかった
                                    </span>
                                    <span className="text-xs font-normal opacity-70">
                                        キー: X / N
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={goToNextQuestion}
                            className="w-full flex flex-col items-center justify-center py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 transition-colors"
                        >
                            <div className="flex items-center font-bold mb-1">
                                <span>次の問題へ</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                            <span className="text-xs font-normal opacity-70">
                                キー: Enter
                            </span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
