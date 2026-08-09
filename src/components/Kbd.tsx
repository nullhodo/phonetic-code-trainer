import type React from "react";

type KbdProps = {
    children: React.ReactNode;
    className?: string;
};

export const Kbd: React.FC<KbdProps> = ({ children, className = "" }) => {
    return (
        <kbd
            className={`inline-flex items-center justify-center min-w-[1.4em] px-1.5 py-0.5 text-xs font-sans font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded shadow-[0_1.5px_0_0_rgba(0,0,0,0.15)] select-none ${className}`}
        >
            {children}
        </kbd>
    );
};
