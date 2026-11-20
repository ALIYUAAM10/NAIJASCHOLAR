import { useEffect, useState } from 'react';

export function useQuizTimer(durationMinutes) {
    const totalSeconds = Number(durationMinutes) > 0 ? Number(durationMinutes) * 60 : 0;
    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeLeft(totalSeconds);
        setReady(totalSeconds > 0);
    }, [totalSeconds]);

    useEffect(() => {
        if (!totalSeconds || !ready) {
            return undefined;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [totalSeconds, ready]);

    return {
        minutes: Math.floor(timeLeft / 60),
        seconds: timeLeft % 60,
        isExpired: ready && timeLeft <= 0,
    };
}
