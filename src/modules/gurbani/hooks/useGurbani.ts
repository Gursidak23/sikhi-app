'use client';

import { useState, useEffect } from 'react';
import type { 
  BaniDBAngResponse, 
  BaniDBShabadResponse, 
  BaniDBSearchResult,
  Raag,
  UseQueryResult 
} from '@/types/api';

/**
 * Custom hooks for fetching Gurbani data
 * These hooks use the API routes and provide loading/error states
 */

// Fetch content for a specific Ang
export function useAng(angNumber: number): UseQueryResult<BaniDBAngResponse> {
  const [data, setData] = useState<BaniDBAngResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAng() {
      if (angNumber < 1 || angNumber > 1430) {
        setError('Ang number must be between 1 and 1430');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/gurbani/ang/${angNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Ang');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Ang');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAng();
  }, [angNumber]);

  return { data, isLoading, error };
}

// Fetch all Raags
export function useRaags(): UseQueryResult<Raag[]> {
  const [data, setData] = useState<Raag[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaags() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/gurbani/raag');
        if (!response.ok) {
          throw new Error('Failed to fetch Raags');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Raags');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRaags();
  }, []);

  return { data, isLoading, error };
}

// Search Gurbani
export function useGurbaniSearch(query: string): UseQueryResult<BaniDBSearchResult> {
  const [data, setData] = useState<BaniDBSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function search() {
      if (!query || query.length < 3) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/gurbani/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce search
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { data, isLoading, error };
}

// Fetch a specific Shabad
export function useShabad(shabadId: string | null): UseQueryResult<BaniDBShabadResponse> {
  const [data, setData] = useState<BaniDBShabadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShabad() {
      if (!shabadId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/gurbani/shabad/${shabadId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Shabad');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Shabad');
      } finally {
        setIsLoading(false);
      }
    }

    fetchShabad();
  }, [shabadId]);

  return { data, isLoading, error };
}
