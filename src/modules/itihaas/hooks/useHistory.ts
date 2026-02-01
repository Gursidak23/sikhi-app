'use client';

import { useState, useEffect } from 'react';
import type {
  TimelineResponse,
  EraResponse,
  EventResponse,
  HistoricalFigure,
  GuruSahibaanResponse,
  UseQueryResult,
} from '@/types/api';

/**
 * Custom hooks for fetching History/Itihaas data
 */

// Fetch the full timeline structure
export function useTimeline(): UseQueryResult<TimelineResponse> {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimeline() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/itihaas/timeline');
        if (!response.ok) {
          throw new Error('Failed to fetch timeline');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load timeline'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimeline();
  }, []);

  return { data, isLoading, error };
}

// Fetch a specific Era with events
export function useEra(eraId: string | null): UseQueryResult<EraResponse> {
  const [data, setData] = useState<EraResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEra() {
      if (!eraId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itihaas/era/${eraId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Era');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Era');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEra();
  }, [eraId]);

  return { data, isLoading, error };
}

// Fetch a specific Event
export function useEvent(eventId: string | null): UseQueryResult<EventResponse> {
  const [data, setData] = useState<EventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itihaas/event/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  return { data, isLoading, error };
}

// Fetch a Historical Figure
export function useFigure(figureId: string | null) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFigure() {
      if (!figureId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itihaas/figure?id=${figureId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch figure');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load figure');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFigure();
  }, [figureId]);

  return { data, isLoading, error };
}

// Fetch Guru Sahibaan list
export function useGuruSahibaan() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGurus() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/itihaas/figure?guru-sahibaan');
        if (!response.ok) {
          throw new Error('Failed to fetch Guru Sahibaan');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load Guru Sahibaan'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchGurus();
  }, []);

  return { data, isLoading, error };
}

// Fetch contemporary events
export function useContemporaryEvents() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContemporary() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/itihaas/contemporary');
        if (!response.ok) {
          throw new Error('Failed to fetch contemporary events');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load contemporary events'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchContemporary();
  }, []);

  return { data, isLoading, error };
}

// Search history
export function useHistorySearch(query: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function search() {
      if (!query || query.length < 2) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/itihaas/search?q=${encodeURIComponent(query)}`
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
