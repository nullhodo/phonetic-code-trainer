import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { BookOpen, Gamepad2, Keyboard } from "lucide-react";
import type React from "react";
import { currentViewAtom } from "../store/atoms";
import type { ViewType } from "../types";

const NAV_ITEMS: {
    id: ViewType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { id: "quiz", label: "単文字クイズ", icon: Gamepad2 },
    { id: "practice", label: "単語実践練習", icon: Keyboard },
    { id: "list", label: "フォネティックコード一覧", icon: BookOpen }
];

export const Navbar: React.FC = () => {
    const [currentView, setCurrentView] = useAtom(currentViewAtom);

    return (
        <nav className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentView(item.id)}
                        className={`relative flex items-center px-6 py-3 rounded-full font-bold transition-colors z-10 ${
                            isActive
                                ? "text-white"
                                : "text-gray-600 hover:text-gray-900 bg-white/70 hover:bg-white shadow-sm"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-md"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30
                                }}
                            />
                        )}
                        <Icon className="w-5 h-5 mr-2" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
