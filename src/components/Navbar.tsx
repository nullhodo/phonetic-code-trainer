import { useAtom } from "jotai";
import type React from "react";
import { currentViewAtom } from "../store/atoms";

export const Navbar: React.FC = () => {
    const [currentView, setCurrentView] = useAtom(currentViewAtom);

    return (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
                type="button"
                onClick={() => setCurrentView("quiz")}
                className={`flex items-center px-6 py-3 rounded-full transition-all ${
                    currentView === "quiz"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
            >
                <span className="font-bold">1文字クイズ</span>
            </button>
            <button
                type="button"
                onClick={() => setCurrentView("practice")}
                className={`flex items-center px-6 py-3 rounded-full transition-all ${
                    currentView === "practice"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
            >
                <span className="font-bold">実践クイズ</span>
            </button>
            <button
                type="button"
                onClick={() => setCurrentView("list")}
                className={`flex items-center px-6 py-3 rounded-full transition-all ${
                    currentView === "list"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
            >
                <span className="font-bold">コード一覧</span>
            </button>
        </div>
    );
};
