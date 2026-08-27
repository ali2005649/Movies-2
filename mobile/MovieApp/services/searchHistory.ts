import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'movieapp_recent_searches';
const MAX_RECENTS = 12;

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export async function getRecentSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseList(raw);
}

export async function addRecentSearch(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();

  const current = await getRecentSearches();
  const next = [
    trimmed,
    ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENTS);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function removeRecentSearch(query: string): Promise<string[]> {
  const current = await getRecentSearches();
  const next = current.filter((item) => item !== query);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
