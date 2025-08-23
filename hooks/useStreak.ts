import { db } from '@/lib/firebase';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type StreakDoc = {
  count: number;
  lastDoneDate?: string; // YYYY-MM-DD
  updatedAt?: any;
};

const getLocalDateKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dayDiff = (fromKey: string, toKey: string): number => {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = new Date(fy, (fm || 1) - 1, fd || 1);
  const to = new Date(ty, (tm || 1) - 1, td || 1);
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
};

export function useStreak(userId?: string | null) {
  const [count, setCount] = useState<number>(0);
  const [lastDone, setLastDone] = useState<string | undefined>(undefined);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const unsub = onSnapshot(ref, (snap) => {
      const data: any = snap.data() || {};
      const s: StreakDoc = data.streak || { count: 0 };
      setCount(Number(s.count || 0));
      setLastDone(s.lastDoneDate);
      loadedRef.current = true;
    }, (err) => {
      if (String(err?.code || '').includes('permission-denied')) {
        console.warn('[Streak] user snapshot permission denied');
        return;
      }
      console.warn('[Streak] user snapshot error', err);
    });
    return () => unsub();
  }, [userId]);

  const todayKey = getLocalDateKey();
  const status = useMemo(() => {
    if (!lastDone) return { daysSince: Infinity, atRisk: false, broken: false } as const;
    const diff = dayDiff(lastDone, todayKey);
    return {
      daysSince: diff,
      atRisk: diff === 2, // missed yesterday
      broken: diff >= 3,  // missed 2+ days
    } as const;
  }, [lastDone, todayKey]);

  const displayCount = status.broken ? 0 : count;
  const countedToday = useMemo(() => {
    if (!lastDone) return false;
    return dayDiff(lastDone, todayKey) <= 0; // already recorded today
  }, [lastDone, todayKey]);

  const markDone = useCallback(async () => {
    if (!userId) return;
    const current = { count, lastDone: lastDone };
    let nextCount = current.count;
    const last = current.lastDone;
    const today = todayKey;

    if (!last) {
      nextCount = 1;
    } else {
      const diff = dayDiff(last, today);
      if (diff <= 0) {
        // already counted today
        nextCount = current.count;
      } else if (diff === 1) {
        // consecutive day
        nextCount = current.count + 1;
      } else if (diff === 2) {
        // grace: missed yesterday → keep count (no increment) and recover
        nextCount = current.count; // keep streak
      } else {
        // missed 2+ days → reset
        nextCount = 1;
      }
    }

    const ref = doc(db, 'users', userId);
    await setDoc(
      ref,
      { streak: { count: nextCount, lastDoneDate: today, updatedAt: serverTimestamp() } },
      { merge: true }
    );
  }, [userId, count, lastDone, todayKey]);

  const canCountToday = !countedToday;
  return { count: displayCount, atRisk: status.atRisk, broken: status.broken, countedToday, canCountToday, markDone };
}

export default useStreak;


