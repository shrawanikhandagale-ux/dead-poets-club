import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenLibraryService, openLibraryService } from '../services/externalCatalogueService';

describe('OpenLibraryService - Batch 2A External Catalogue Discovery', () => {
  let service: OpenLibraryService;

  beforeEach(() => {
    service = new OpenLibraryService();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeDoc', () => {
    it('normalizes a comprehensive Open Library document with all fields present', () => {
      const rawDoc = {
        key: '/works/OL45804W',
        title: 'The Metamorphosis',
        subtitle: 'Die Verwandlung',
        author_name: ['Franz Kafka', 'Willi Haas'],
        author_key: ['OL22242A', 'OL55443A'],
        first_publish_year: 1915,
        isbn: ['9780143105244', '0143105240'],
        edition_count: 142,
        language: ['eng', 'ger'],
        subject: [
          'Metamorphosis',
          'Psychological fiction',
          'collectionid:scandocs',
          'nyt:bestseller',
          'Absurdism',
        ],
        cover_i: 8234567,
      };

      const result = service.normalizeDoc(rawDoc);

      expect(result).not.toBeNull();
      expect(result?.sourceId).toBe('open_library');
      expect(result?.sourceName).toBe('Internet Archive Open Library');
      expect(result?.workId).toBe('OL45804W');
      expect(result?.workKey).toBe('/works/OL45804W');
      expect(result?.title).toBe('The Metamorphosis');
      expect(result?.subtitle).toBe('Die Verwandlung');
      expect(result?.authors).toEqual([
        { name: 'Franz Kafka', id: 'OL22242A' },
        { name: 'Willi Haas', id: 'OL55443A' },
      ]);
      expect(result?.firstPublishYear).toBe(1915);
      expect(result?.primaryIsbn).toBe('9780143105244');
      expect(result?.editionCount).toBe(142);
      expect(result?.languages).toEqual(['eng', 'ger']);
      expect(result?.subjects).toEqual(['Metamorphosis', 'Psychological fiction', 'Absurdism']);
      expect(result?.coverId).toBe(8234567);
      expect(result?.coverUrl).toBe('https://covers.openlibrary.org/b/id/8234567-L.jpg');
      expect(result?.openLibraryUrl).toBe('https://openlibrary.org/works/OL45804W');
    });

    it('handles documents with missing optional fields gracefully', () => {
      const rawDoc = {
        key: 'OL99999W', // missing leading /works/
        title: 'Fragments of an Unknown Work',
      };

      const result = service.normalizeDoc(rawDoc);

      expect(result).not.toBeNull();
      expect(result?.workId).toBe('OL99999W');
      expect(result?.workKey).toBe('/works/OL99999W');
      expect(result?.title).toBe('Fragments of an Unknown Work');
      expect(result?.subtitle).toBeUndefined();
      expect(result?.authors).toEqual([{ name: 'Unknown Author' }]);
      expect(result?.firstPublishYear).toBeUndefined();
      expect(result?.primaryIsbn).toBeUndefined();
      expect(result?.editionCount).toBeUndefined();
      expect(result?.languages).toBeUndefined();
      expect(result?.subjects).toBeUndefined();
      expect(result?.coverId).toBeUndefined();
      expect(result?.coverUrl).toBeUndefined();
      expect(result?.openLibraryUrl).toBe('https://openlibrary.org/works/OL99999W');
    });

    it('falls back to ISBN cover URL when cover_i is missing but primaryIsbn exists', () => {
      const rawDoc = {
        key: '/works/OL12345W',
        title: 'A Room of One’s Own',
        isbn: ['9780156030410'],
      };

      const result = service.normalizeDoc(rawDoc);

      expect(result).not.toBeNull();
      expect(result?.coverId).toBeUndefined();
      expect(result?.primaryIsbn).toBe('9780156030410');
      expect(result?.coverUrl).toBe('https://covers.openlibrary.org/b/isbn/9780156030410-L.jpg');
    });

    it('returns null for empty, undefined, or keyless documents', () => {
      expect(service.normalizeDoc(null)).toBeNull();
      expect(service.normalizeDoc(undefined)).toBeNull();
      expect(service.normalizeDoc({})).toBeNull();
      expect(service.normalizeDoc({ title: 'No Key' })).toBeNull();
      expect(service.normalizeDoc('invalid')).toBeNull();
    });
  });

  describe('searchBooks', () => {
    it('returns an empty response without invoking fetch when query is blank', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const response = await service.searchBooks({ query: '   ' });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(response.results).toEqual([]);
      expect(response.totalFound).toBe(0);
      expect(response.totalPages).toBe(0);
    });

    it('executes a general query search with correct URL parameters', async () => {
      const mockApiResponse = {
        numFound: 1,
        docs: [
          {
            key: '/works/OL27479W',
            title: 'The Myth of Sisyphus',
            author_name: ['Albert Camus'],
            first_publish_year: 1942,
            cover_i: 104523,
          },
        ],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      const response = await service.searchBooks({ query: 'sisyphus', page: 1, limit: 10 });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://openlibrary.org/search.json');
      expect(calledUrl).toContain('q=sisyphus');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('fields=');

      expect(response.totalFound).toBe(1);
      expect(response.totalPages).toBe(1);
      expect(response.results).toHaveLength(1);
      expect(response.results[0].title).toBe('The Myth of Sisyphus');
      expect(response.results[0].authors[0].name).toBe('Albert Camus');
    });

    it('executes title-only and author-only searches with targeted parameters', async () => {
      const mockApiResponse = { numFound: 0, docs: [] };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      // Title search
      await service.searchBooks({ title: 'The Stranger', searchType: 'title' });
      let calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('title=The+Stranger');
      expect(calledUrl).not.toContain('q=');

      // Author search
      await service.searchBooks({ author: 'Virginia Woolf', searchType: 'author' });
      calledUrl = fetchSpy.mock.calls[1][0] as string;
      expect(calledUrl).toContain('author=Virginia+Woolf');
    });

    it('calculates totalPages accurately across multi-page datasets', async () => {
      const mockApiResponse = {
        numFound: 53,
        docs: Array(10).fill({
          key: '/works/OL1W',
          title: 'Volume',
        }),
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      const response = await service.searchBooks({ query: 'poetry', page: 2, limit: 10 });

      expect(response.page).toBe(2);
      expect(response.limit).toBe(10);
      expect(response.totalFound).toBe(53);
      expect(response.totalPages).toBe(6); // Math.ceil(53 / 10) = 6
    });

    it('serves cached results on repeated queries without dispatching redundant network requests', async () => {
      const mockApiResponse = {
        numFound: 1,
        docs: [{ key: '/works/OL500W', title: 'Cached Edition' }],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      // First call -> hits fetch
      const res1 = await service.searchBooks({ query: 'cached-query', page: 1, limit: 24 });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(res1.results[0].title).toBe('Cached Edition');

      // Second identical call -> served from in-memory cache
      const res2 = await service.searchBooks({ query: 'cached-query', page: 1, limit: 24 });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(res2.results[0].title).toBe('Cached Edition');

      // Clear cache and call again -> hits fetch a second time
      service.clearCache();
      const res3 = await service.searchBooks({ query: 'cached-query', page: 1, limit: 24 });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(res3.results[0].title).toBe('Cached Edition');
    });

    it('handles HTTP 429 Too Many Requests with user-friendly advice', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      await expect(service.searchBooks({ query: 'overloaded' })).rejects.toThrow(
        /heavy traffic.*429/i
      );
    });

    it('handles non-200 HTTP server error responses gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as Response);

      await expect(service.searchBooks({ query: 'outage' })).rejects.toThrow(
        /HTTP 503/i
      );
    });

    it('rejects with clear message when the API returns malformed JSON without docs array', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ unexpected: true }),
      } as Response);

      await expect(service.searchBooks({ query: 'broken' })).rejects.toThrow(
        /Malformed or unreadable response/i
      );
    });

    it('propagates AbortError cleanly when search is canceled', async () => {
      const controller = new AbortController();
      controller.abort();

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new DOMException('The user aborted a request.', 'AbortError')
      );

      await expect(
        service.searchBooks({ query: 'aborted' }, controller.signal)
      ).rejects.toThrow(/aborted/i);
    });
  });
});

