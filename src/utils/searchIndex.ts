/*
 * Inverted index mapping tokens to entity IDs for substring search.
 * With this we do a single map lookup to get the matching ids
 * instead of looping all leagues and calling .includes() on each name.
 * It's a hash map where the key is a text suffix (e.g "nba") and the
 * value is a set of league ids that contain this suffix.
 * https://en.wikipedia.org/wiki/Substring_index
 */
export class SearchIndex<T extends string | number = string> {
  private index: Map<string, Set<T>>;

  constructor() {
    this.index = new Map();
  }

  get indexSize(): number {
    return this.index.size;
  }

  // Indexes an entity by its text fields and all token suffixes
  addEntity(entityId: T, ...textFields: (string | null | undefined)[]): void {
    for (const text of textFields) {
      if (!text) continue;

      const normalizedText = text.toLowerCase();
      const tokens = this.tokenize(normalizedText);

      for (const token of tokens) {
        for (let startIndex = 0; startIndex < token.length; startIndex++) {
          const suffix = token.slice(startIndex);
          if (!this.index.has(suffix)) {
            this.index.set(suffix, new Set());
          }
          this.index.get(suffix)!.add(entityId);
        }
      }
    }
  }

  // Returns entities matching all query tokens
  search(query: string): Set<T> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return new Set();

    const queryTokens = this.tokenize(normalizedQuery);
    if (queryTokens.length === 0) return new Set();

    let resultSet: Set<T> | null = null;

    for (const token of queryTokens) {
      const matchingIds = this.index.get(token) ?? new Set<T>();

      if (resultSet === null) {
        resultSet = new Set(matchingIds);
      } else {
        for (const id of resultSet) {
          if (!matchingIds.has(id)) {
            resultSet.delete(id);
          }
        }
      }

      if (resultSet.size === 0) return resultSet;
    }

    return resultSet ?? new Set();
  }

  removeEntity(entityId: T): void {
    for (const [suffix, idSet] of this.index) {
      idSet.delete(entityId);
      if (idSet.size === 0) {
        this.index.delete(suffix);
      }
    }
  }

  clear(): void {
    this.index.clear();
  }

  private tokenize(text: string): string[] {
    return text.split(/[\s,.\-_/()]+/).filter((token) => token.length > 1);
  }
}
