import { motion } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";
import { currentViewAtom } from "../store/atoms";
import type { ViewType } from "../types";

const TABS: { id: ViewType; label: string }[] = [
    { id: "quiz", label: "1文字クイズ" },
    { id: "practice", label: "実践クイズ" },
    { id: "list", label: "コード一覧" }
];

export const Navbar: React.FC = () => {
    const [currentView, setCurrentView] = useAtom(currentViewAtom);

    return (
        <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 bg-gray-200/70 backdrop-blur-md rounded-2xl gap-1">
                {TABS.map((tab) => {
                    const isActive = currentView === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCurrentView(tab.id)}
                            className={`relative px-5 py-2.5 text-sm sm:text-base font-bold transition-colors rounded-xl z-10 ${
                                isActive
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="filterTabActive"
                                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
