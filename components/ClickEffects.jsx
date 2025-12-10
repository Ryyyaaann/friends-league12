"use client";

import { useEffect, useState } from "react";

export default function ClickEffects() {
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const id = Date.now();
            const x = e.clientX;
            const y = e.clientY;

            setClicks((prev) => [...prev, { id, x, y }]);

            // Remove after animation
            setTimeout(() => {
                setClicks((prev) => prev.filter((c) => c.id !== id));
            }, 1000);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ overflow: "hidden" }}>
            {clicks.map((click) => (
                <img
                    key={click.id}
                    src="/amogus.png"
                    alt="sus"
                    className="absolute w-12 h-12 animate-bounce-out"
                    style={{
                        left: click.x - 24, // Center horizontally
                        top: click.y - 24,  // Center vertically
                        animation: "pop-out 0.5s ease-out forwards"
                    }}
                />
            ))}
            <style jsx global>{`
                @keyframes pop-out {
                    0% { transform: scale(0) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.2) rotate(10deg); }
                    100% { transform: scale(1) rotate(-10deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
