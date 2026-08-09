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
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Navbar />

                <div className="transition-all duration-300">
                    {currentView === "quiz" && <QuizView />}
                    {currentView === "practice" && <PracticeView />}
                    {currentView === "list" && <AlphabetListView />}
                </div>
            </div>
        </div>
    );
};

export default App;
