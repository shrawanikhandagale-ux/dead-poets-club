export interface ExternalBookAuthor {
  name: string;
  id?: string; // Open Library author key, e.g. "OL841112A"
}

export interface ExternalBookResult {
  sourceId: 'open_library';
  sourceName: string;
  sourceAttribution: string;
  workId: string; // e.g. "OL4321141W"
  workKey: string; // e.g. "/works/OL4321141W"
  title: string;
  subtitle?: string;
  authors: ExternalBookAuthor[];
  firstPublishYear?: number;
  isbn?: string[];
  primaryIsbn?: string;
  editionCount?: number;
  languages?: string[];
  subjects?: string[];
  coverId?: number;
  coverUrl?: string;
  openLibraryUrl: string;
}

export interface ExternalSearchParams {
  query?: string;
  title?: string;
  author?: string;
  searchType?: 'all' | 'title' | 'author';
  page?: number;
  limit?: number;
}

export interface ExternalSearchResponse {
  query: string;
  totalFound: number;
  page: number;
  limit: number;
  totalPages: number;
  results: ExternalBookResult[];
}

