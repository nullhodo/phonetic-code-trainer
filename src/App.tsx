import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";
import { AlphabetListView } from "./components/AlphabetListView";
import { Navbar } from "./components/Navbar";
import { PracticeView } from "./components/PracticeView";
import { QuizView } from "./components/QuizView";
import { currentViewAtom } from "./store/atoms";

const App: React.FC = () => {
    const [currentView] = useAtom(currentViewAtom);

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-100 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                <Navbar />

                <div className="transition-all duration-300">
                    <AnimatePresence mode="wait">
                        {currentView === "quiz" && <QuizView key="quiz" />}
                        {currentView === "practice" && (
                            <PracticeView key="practice" />
                        )}
                        {currentView === "list" && (
                            <AlphabetListView key="list" />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default App;
