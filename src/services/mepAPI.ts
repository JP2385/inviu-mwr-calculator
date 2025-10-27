import axios from 'axios';
import { getDateKey } from '../utils/dateUtils';
import type { MEPQuote } from '../types';
import {
  getMEPFromDolarAPI,
  getMEPFromAmbito,
  interpolateFromDatabase,
  MEP_HISTORICAL_DATABASE,
} from './mepDataSources';

const CACHE_KEY = 'mep_historical_cache';
const CACHE_EXPIRY_DAYS = 30; // Datos históricos son estables, podemos cachearlos por más tiempo

interface CacheEntry {
  value: number;
  timestamp: number;
  source: 'api' | 'ambito' | 'database' | 'manual';
}

interface Cache {
  [dateKey: string]: CacheEntry;
}

/**
 * Get MEP cache from localStorage
 */
function getCache(): Cache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Error reading MEP cache:', error);
  }
  return {};
}

/**
 * Save MEP cache to localStorage
 */
function saveCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error saving MEP cache:', error);
  }
}

/**
 * Get MEP value from cache
 */
function getFromCache(dateKey: string): number | null {
  const cache = getCache();
  const entry = cache[dateKey];

  if (!entry) return null;

  // Check if cache entry is still valid (not expired)
  const now = Date.now();
  const age = now - entry.timestamp;
  const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  if (age > maxAge) {
    return null;
  }

  return entry.value;
}

/**
 * Save MEP value to cache
 */
function saveToCache(dateKey: string, value: number, source: CacheEntry['source']): void {
  const cache = getCache();
  cache[dateKey] = {
    value,
    timestamp: Date.now(),
    source,
  };
  saveCache(cache);
}

/**
 * Get historical MEP for a specific date using multiple sources
 * Strategy:
 * 1. Check cache first
 * 2. For today: try DolarAPI
 * 3. For any date: try Ámbito Financiero
 * 4. Fallback: use expanded database with interpolation
 */
export async function getMEPHistorico(date: Date): Promise<number> {
  const dateKey = getDateKey(date);

  // 1. Check cache first
  const cached = getFromCache(dateKey);
  if (cached !== null) {
    console.log(`✅ MEP ${dateKey}: Caché ($${cached})`);
    return cached;
  }

  // 2. If it's today, try DolarAPI first
  const today = new Date();
  const isToday = getDateKey(today) === dateKey;

  if (isToday) {
    console.log(`🌐 MEP ${dateKey}: Consultando DolarAPI...`);
    const apiResult = await getMEPFromDolarAPI();
    if (apiResult !== null) {
      console.log(`✅ MEP ${dateKey}: DolarAPI → $${apiResult.valor}`);
      saveToCache(dateKey, apiResult.valor, 'api');
      return apiResult.valor;
    }
  }

  // 3. Try Ámbito Financiero for historical data
  console.log(`🌐 MEP ${dateKey}: Consultando Ámbito Financiero...`);
  const ambitoValue = await getMEPFromAmbito(date);
  if (ambitoValue !== null) {
    console.log(`✅ MEP ${dateKey}: Ámbito → $${ambitoValue}`);
    saveToCache(dateKey, ambitoValue, 'ambito');
    return ambitoValue;
  }

  // 4. Fallback: Use expanded database with interpolation
  console.log(`📊 MEP ${dateKey}: Usando base de datos local (${Object.keys(MEP_HISTORICAL_DATABASE).length} puntos)`);
  const interpolated = interpolateFromDatabase(date);
  console.log(`✅ MEP ${dateKey}: Interpolado → $${interpolated}`);
  saveToCache(dateKey, interpolated, 'database');

  return interpolated;
}

/**
 * Get multiple MEP values for an array of dates
 */
export async function getMEPBatch(dates: Date[]): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const uniqueDates = Array.from(new Set(dates.map(d => getDateKey(d))))
    .map(dk => new Date(dk))
    .sort((a, b) => a.getTime() - b.getTime());

  console.log(`📅 Obteniendo MEP para ${uniqueDates.length} fechas únicas...`);

  // Process dates sequentially to avoid overwhelming APIs
  for (const date of uniqueDates) {
    const dateKey = getDateKey(date);
    if (!results.has(dateKey)) {
      const value = await getMEPHistorico(date);
      results.set(dateKey, value);

      // Small delay to be respectful with APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ MEP batch completo: ${results.size} valores obtenidos`);

  return results;
}

/**
 * Clear MEP cache (useful for forcing refresh)
 */
export function clearMEPCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Caché de MEP limpiado');
  } catch (error) {
    console.warn('Error clearing MEP cache:', error);
  }
}

/**
 * Add custom MEP point (for user corrections or manual data entry)
 */
export function addMEPPoint(date: Date, value: number): void {
  const dateKey = getDateKey(date);
  saveToCache(dateKey, value, 'manual');
  console.log(`✅ MEP ${dateKey}: Valor manual guardado: $${value}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  total: number;
  bySource: Record<CacheEntry['source'], number>;
  oldest: string | null;
  newest: string | null;
} {
  const cache = getCache();
  const entries = Object.entries(cache);

  const stats = {
    total: entries.length,
    bySource: { api: 0, ambito: 0, database: 0, manual: 0 },
    oldest: null as string | null,
    newest: null as string | null,
  };

  if (entries.length === 0) return stats;

  entries.forEach(([key, entry]) => {
    stats.bySource[entry.source]++;
  });

  const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  stats.oldest = sorted[0][0];
  stats.newest = sorted[sorted.length - 1][0];

  return stats;
}
