// Тикающее «сейчас» и разбор миллисекунд в дн/ч/мин/сек
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function countdownParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    d: String(Math.floor(s / 86400)),
    h: p(Math.floor((s % 86400) / 3600)),
    m: p(Math.floor((s % 3600) / 60)),
    s: p(s % 60),
    ended: ms <= 0,
  };
}