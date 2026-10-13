import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'aura_focus_timer_state';

const DEFAULT_STATE = {
  isRunning: false,
  isPaused: false,
  sessionType: 'pomodoro', // 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch' | 'countdown'
  targetMinutes: 25,
  secondsRemaining: 25 * 60,
  stopwatchSeconds: 0,
  startedAt: null,
  accumulatedSeconds: 0,
  associatedTaskId: '',
  category: 'Deep Work',
  notes: '',
};

export function useFocusTimer(onAutoFinish) {
  const [timerState, setTimerState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.lastTick) {
          const elapsedSinceLastTick = Math.floor((Date.now() - parsed.lastTick) / 1000);
          if (parsed.sessionType === 'stopwatch') {
            parsed.stopwatchSeconds = (parsed.stopwatchSeconds || 0) + elapsedSinceLastTick;
          } else {
            parsed.secondsRemaining = Math.max(0, (parsed.secondsRemaining || 0) - elapsedSinceLastTick);
          }
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.error('[Error reading timer state from storage]:', e);
    }
    return DEFAULT_STATE;
  });

  const intervalRef = useRef(null);
  const autoFinishRef = useRef(onAutoFinish);

  useEffect(() => {
    autoFinishRef.current = onAutoFinish;
  }, [onAutoFinish]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...timerState,
          lastTick: Date.now(),
        })
      );
    } catch (e) {
      console.error('[Error saving timer state to storage]:', e);
    }
  }, [timerState]);

  // Main tick loop
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        let reachedZero = false;
        setTimerState((prev) => {
          if (prev.sessionType === 'stopwatch') {
            return {
              ...prev,
              stopwatchSeconds: prev.stopwatchSeconds + 1,
              accumulatedSeconds: prev.accumulatedSeconds + 1,
            };
          } else {
            if (prev.secondsRemaining <= 1) {
              reachedZero = true;
              return {
                ...prev,
                secondsRemaining: 0,
                isRunning: false,
                isPaused: false,
                accumulatedSeconds: prev.accumulatedSeconds + 1,
              };
            }
            return {
              ...prev,
              secondsRemaining: prev.secondsRemaining - 1,
              accumulatedSeconds: prev.accumulatedSeconds + 1,
            };
          }
        });

        if (reachedZero) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (autoFinishRef.current) {
            autoFinishRef.current();
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.isRunning, timerState.isPaused]);

  const startTimer = useCallback((options = {}) => {
    setTimerState((prev) => {
      const mode = options.sessionType || prev.sessionType;
      const targetMins = options.targetMinutes || prev.targetMinutes;
      return {
        ...prev,
        ...options,
        sessionType: mode,
        targetMinutes: targetMins,
        isRunning: true,
        isPaused: false,
        startedAt: prev.startedAt || new Date().toISOString(),
        secondsRemaining: mode === 'stopwatch' ? 0 : (prev.secondsRemaining > 0 ? prev.secondsRemaining : targetMins * 60),
      };
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: false,
      isRunning: true,
    }));
  }, []);

  const setMode = useCallback((mode, customDuration) => {
    let mins = 25;
    if (mode === 'short_break') mins = 5;
    else if (mode === 'long_break') mins = 15;
    else if (mode === 'countdown') mins = customDuration || 30;
    else if (mode === 'pomodoro') mins = customDuration || 25;

    setTimerState((prev) => ({
      ...prev,
      sessionType: mode,
      targetMinutes: mins,
      secondsRemaining: mins * 60,
      stopwatchSeconds: 0,
      accumulatedSeconds: 0,
      isRunning: false,
      isPaused: false,
      startedAt: null,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      secondsRemaining: prev.targetMinutes * 60,
      stopwatchSeconds: 0,
      accumulatedSeconds: 0,
      startedAt: null,
    }));
  }, []);

  const finishSession = useCallback(async (saveCallback) => {
    let elapsedMinutes;
    if (timerState.sessionType === 'stopwatch') {
      elapsedMinutes = Math.max(1, Math.round(timerState.stopwatchSeconds / 60));
    } else {
      const finishedNaturally = timerState.secondsRemaining === 0;
      if (finishedNaturally) {
        elapsedMinutes = timerState.targetMinutes;
      } else {
        elapsedMinutes = Math.max(1, Math.round(timerState.accumulatedSeconds / 60));
      }
    }

    const payload = {
      sessionType: timerState.sessionType,
      durationMinutes: elapsedMinutes,
      startTime: timerState.startedAt ? new Date(timerState.startedAt) : new Date(Date.now() - elapsedMinutes * 60000),
      endTime: new Date(),
      associatedTask: timerState.associatedTaskId || null,
      category: timerState.category,
      notes: timerState.notes,
      productivityRating: 4,
    };

    if (saveCallback) {
      await saveCallback(payload);
    }

    resetTimer();
  }, [timerState, resetTimer]);

  const updateDetails = useCallback((fields) => {
    setTimerState((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setMode,
    finishSession,
    updateDetails,
  };
}
