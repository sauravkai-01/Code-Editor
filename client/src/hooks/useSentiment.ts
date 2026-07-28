import { useCallback } from 'react';

export type SentimentResult = { label: string; score: number };

export function useSentiment() {
  const analyze = useCallback(async (text: string): Promise<SentimentResult> => {
    const res = await fetch('http://localhost:5001/api/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'sentiment failed');
    return data;
  }, []);

  return { analyze };
}

