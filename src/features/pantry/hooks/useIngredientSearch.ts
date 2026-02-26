import { useState, useEffect, useRef } from 'react';
import { searchUSDA } from '../services/usdaService';
import { searchLocalIngredients } from '../data/commonIngredients';
import type { PantryItem } from '../types';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export interface UseIngredientSearchResult {
  results: PantryItem[];
  isSearching: boolean;
  error: string | null;
}

export function useIngredientSearch(query: string): UseIngredientSearchResult {
  const [results, setResults] = useState<PantryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    // 1. Try local list first — instant, no network
    const local = searchLocalIngredients(trimmed);
    if (local.length > 0) {
      setResults(local);
      setIsSearching(false);
      setError(null);
      return;
    }

    // 2. Nothing in local list — fall back to USDA API with debounce
    setIsSearching(true);
    setError(null);

    timerRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      searchUSDA(trimmed, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults(data);
            setIsSearching(false);
          }
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          const isAbort =
            err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'));
          if (!isAbort) {
            setError('Search unavailable. You can still add a custom ingredient below.');
            setResults([]);
            setIsSearching(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, isSearching, error };
}
