import { motion } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";
import { NATO_ALPHABET } from "../constants/natoAlphabet";
import { statsAtom } from "../store/atoms";

export const AlphabetListView: React.FC = () => {
    const [stats] = useAtom(statsAtom);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    フォネティックコード一覧
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(NATO_ALPHABET).map(([letter, data]) => {
                    const stat = stats[letter] || { correct: 0, wrong: 0 };
                    const totalAnswers = stat.correct + stat.wrong;
                    const hasAnswered = totalAnswers > 0;

                    const correctPercent = hasAnswered
                        ? (stat.correct / totalAnswers) * 100
                        : 0;
                    const wrongPercent = hasAnswered
                        ? (stat.wrong / totalAnswers) * 100
                        : 0;

                    return (
                        <div
                            key={letter}
                            className="flex items-center p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors relative overflow-hidden group"
                        >
                            {hasAnswered && (
                                <div className="absolute bottom-0 left-0 w-full h-1.5 flex opacity-70">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-500"
                                        style={{ width: `${correctPercent}%` }}
                                    />
                                    <div
                                        className="bg-red-500 h-full transition-all duration-500"
                                        style={{ width: `${wrongPercent}%` }}
                                    />
                                </div>
                            )}

                            <div className="w-12 h-12 flex-shrink-0 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl font-bold mr-4">
                                {letter}
                            </div>
                            <div className="text-xl font-bold text-gray-700 tracking-wide">
                                {data.display}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};
