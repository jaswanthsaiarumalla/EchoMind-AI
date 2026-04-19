/* ─────────────────────────────────────────────
 *  useAutoRefresh
 *
 *  Manages the 30-second auto-refresh interval
 *  with a countdown timer visible in the UI.
 * ───────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshReturn {
  secondsLeft: number;
  isActive: boolean;
  start: (onTick: () => Promise<void>) => void;
  stop: () => void;
  manualRefresh: () => void;
}

export function useAutoRefresh(intervalSeconds: number): UseAutoRefreshReturn {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<(() => Promise<void>) | null>(null);
  const secondsRef = useRef(intervalSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetCountdown = useCallback(() => {
    secondsRef.current = intervalSeconds;
    setSecondsLeft(intervalSeconds);
  }, [intervalSeconds]);

  const start = useCallback(
    (onTick: () => Promise<void>) => {
      tickRef.current = onTick;
      setIsActive(true);
      resetCountdown();

      clearTimer();
      intervalRef.current = setInterval(() => {
        secondsRef.current -= 1;
        setSecondsLeft(secondsRef.current);

        if (secondsRef.current <= 0) {
          tickRef.current?.();
          secondsRef.current = intervalSeconds;
          setSecondsLeft(intervalSeconds);
        }
      }, 1000);
    },
    [intervalSeconds, clearTimer, resetCountdown],
  );

  const stop = useCallback(() => {
    setIsActive(false);
    clearTimer();
    resetCountdown();
  }, [clearTimer, resetCountdown]);

  const manualRefresh = useCallback(() => {
    tickRef.current?.();
    resetCountdown();
  }, [resetCountdown]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  return { secondsLeft, isActive, start, stop, manualRefresh };
}
