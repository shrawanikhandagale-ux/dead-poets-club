import {
  ExternalBookResult,
  ExternalSearchParams,
  ExternalSearchResponse,
} from '../types/catalogue';

const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const OPEN_LIBRARY_COVER_BASE = 'https://covers.openlibrary.org/b';
const DEFAULT_LIMIT = 24;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache

interface CacheEntry {
  timestamp: number;
  data: ExternalSearchResponse;
}

export class OpenLibraryService {
  private cache = new Map<string, CacheEntry>();

  /**
   * Normalizes a raw Open Library document into a type-safe ExternalBookResult
   */
  public normalizeDoc(doc: any): ExternalBookResult | null {
    if (!doc || typeof doc !== 'object') return null;

    const rawKey: string = String(doc.key || '').trim();
    if (!rawKey) return null;

    // Normalize work ID (e.g. "/works/OL4321141W" -> "OL4321141W")
    const workId = rawKey.replace(/^\/works\//, '');
    const workKey = rawKey.startsWith('/') ? rawKey : `/works/${rawKey}`;

    const title: string = String(doc.title || 'Untitled Volume').trim();
    const subtitle: string | undefined = doc.subtitle ? String(doc.subtitle).trim() : undefined;

    // Authors mapping
    const authorNames: string[] = Array.isArray(doc.author_name)
      ? doc.author_name.map((n: any) => String(n).trim()).filter(Boolean)
      : doc.author_name
      ? [String(doc.author_name).trim()]
      : [];

    const authorKeys: string[] = Array.isArray(doc.author_key)
      ? doc.author_key.map((k: any) => String(k).trim()).filter(Boolean)
      : doc.author_key
      ? [String(doc.author_key).trim()]
      : [];

    const authors = authorNames.length > 0
      ? authorNames.map((name, idx) => ({
          name,
          id: authorKeys[idx] || undefined,
        }))
      : [{ name: 'Unknown Author' }];

    // First publish year
    let firstPublishYear: number | undefined;
    if (typeof doc.first_publish_year === 'number' && Number.isFinite(doc.first_publish_year)) {
      firstPublishYear = doc.first_publish_year;
    } else if (doc.first_publish_year) {
      const parsed = parseInt(String(doc.first_publish_year), 10);
      if (!Number.isNaN(parsed)) firstPublishYear = parsed;
    }

    // ISBNs
    const isbnList: string[] = Array.isArray(doc.isbn)
      ? doc.isbn.map((i: any) => String(i).replace(/[^0-9X]/gi, '').trim()).filter(Boolean)
      : [];

    // Find primary ISBN (prefer 13-digit ISBN, then 10-digit)
    const primaryIsbn =
      isbnList.find(i => i.length === 13) ||
      isbnList.find(i => i.length === 10) ||
      isbnList[0] ||
      undefined;

    // Edition count
    const editionCount =
      typeof doc.edition_count === 'number' && doc.edition_count > 0
        ? doc.edition_count
        : undefined;

    // Languages
    const languages: string[] | undefined = Array.isArray(doc.language)
      ? Array.from(new Set<string>(doc.language.map((l: any) => String(l).trim()).filter(Boolean))).slice(0, 5)
      : undefined;

    // Subjects
    const subjects: string[] | undefined = Array.isArray(doc.subject)
      ? Array.from(
          new Set<string>(
            doc.subject
              .map((s: any) => String(s).trim())
              .filter((s: string) => s.length > 0 && !s.startsWith('collectionid:') && !s.startsWith('nyt:'))
          )
        ).slice(0, 8)
      : undefined;

    // Cover handling
    const coverId =
      typeof doc.cover_i === 'number' && doc.cover_i > 0 ? doc.cover_i : undefined;

    let coverUrl: string | undefined;
    if (coverId) {
      coverUrl = `${OPEN_LIBRARY_COVER_BASE}/id/${coverId}-L.jpg`;
    } else if (primaryIsbn) {
      coverUrl = `${OPEN_LIBRARY_COVER_BASE}/isbn/${primaryIsbn}-L.jpg`;
    }

    return {
      sourceId: 'open_library',
      sourceName: 'Internet Archive Open Library',
      sourceAttribution: 'Metadata provided by the Internet Archive Open Library (Open Data under CC0 / ODbL)',
      workId,
      workKey,
      title,
      subtitle,
      authors,
      firstPublishYear,
      isbn: isbnList.length > 0 ? isbnList.slice(0, 20) : undefined,
      primaryIsbn,
      editionCount,
      languages,
      subjects,
      coverId,
      coverUrl,
      openLibraryUrl: `${OPEN_LIBRARY_BASE_URL}${workKey}`,
    };
  }

  /**
   * Search Open Library catalog by query, title, or author with pagination
   */
  public async searchBooks(
    params: ExternalSearchParams,
    signal?: AbortSignal
  ): Promise<ExternalSearchResponse> {
    const rawQuery = (params.query || '').trim();
    const rawTitle = (params.title || '').trim();
    const rawAuthor = (params.author || '').trim();
    const searchType = params.searchType || 'all';

    // Disallow completely blank queries to prevent spamming Open Library with global dump requests
    if (!rawQuery && !rawTitle && !rawAuthor) {
      return {
        query: '',
        totalFound: 0,
        page: 1,
        limit: params.limit || DEFAULT_LIMIT,
        totalPages: 0,
        results: [],
      };
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || DEFAULT_LIMIT));

    // Construct deterministic cache key
    const cacheKey = `${searchType}:${rawQuery}:${rawTitle}:${rawAuthor}:${page}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const urlParams = new URLSearchParams();
    if (searchType === 'title' && (rawTitle || rawQuery)) {
      urlParams.set('title', rawTitle || rawQuery);
    } else if (searchType === 'author' && (rawAuthor || rawQuery)) {
      urlParams.set('author', rawAuthor || rawQuery);
    } else {
      if (rawQuery) urlParams.set('q', rawQuery);
      if (rawTitle) urlParams.set('title', rawTitle);
      if (rawAuthor) urlParams.set('author', rawAuthor);
    }

    urlParams.set('page', String(page));
    urlParams.set('limit', String(limit));
    // Request only necessary fields to reduce payload size and server load
    urlParams.set(
      'fields',
      'key,title,subtitle,author_name,author_key,first_publish_year,isbn,edition_count,language,subject,cover_i'
    );

    const targetUrl = `${OPEN_LIBRARY_SEARCH_URL}?${urlParams.toString()}`;

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (response.status === 429) {
        throw new Error(
          'Open Library archives are currently experiencing heavy traffic (Rate limit 429). Please wait a moment before trying again.'
        );
      }

      if (!response.ok) {
        throw new Error(
          `Open Library archive error: HTTP ${response.status} (${response.statusText || 'Request failed'})`
        );
      }

      const payload = await response.json();
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.docs)) {
        throw new Error('Malformed or unreadable response received from Open Library archive.');
      }

      const totalFound = Number(payload.numFound ?? payload.num_found ?? 0);
      const totalPages = Math.ceil(totalFound / limit);

      const results: ExternalBookResult[] = [];
      for (const doc of payload.docs) {
        const normalized = this.normalizeDoc(doc);
        if (normalized) {
          results.push(normalized);
        }
      }

      const searchResponse: ExternalSearchResponse = {
        query: rawQuery || rawTitle || rawAuthor,
        totalFound,
        page,
        limit,
        totalPages,
        results,
      };

      // Store in memory cache
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: searchResponse,
      });

      return searchResponse;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (err.message && err.message.includes('Open Library')) {
        throw err;
      }
      throw new Error(
        `Unable to reach Open Library archives. Please verify your connection or retry shortly. (${err?.message || 'Network error'})`
      );
    }
  }

  /**
   * Clears in-memory search cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const openLibraryService = new OpenLibraryService();
