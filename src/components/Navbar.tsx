import { useAtom } from "jotai";
import { BookOpen, Gamepad2, Keyboard } from "lucide-react";
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
                <Gamepad2 className="w-5 h-5 mr-2" />
                <span className="font-bold">単文字クイズ</span>
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
                <Keyboard className="w-5 h-5 mr-2" />
                <span className="font-bold">実践</span>
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
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-bold">一覧表</span>
            </button>
        </div>
    );
};
