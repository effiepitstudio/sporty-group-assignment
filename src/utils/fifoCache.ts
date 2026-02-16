/* FIFO cache using Map insertion order. Evicts oldest entry when full.
FIFO cache was chosen because badge lookups are one-off actions
 en.wikipedia.org/wiki/Cache_replacement_policies#First_in_first_out_(FIFO) \
*/

export class FIFOCache<K, V> {
  private capacity: number;
  private map: Map<K, V>;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error("capacity must be at least 1");
    }
    this.capacity = capacity;
    this.map = new Map();
  }

  get size(): number {
    return this.map.size;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  // Inserts or updates. Returns evicted key or null.
  put(key: K, value: V): K | null {
    if (this.map.has(key)) {
      this.map.set(key, value);
      return null;
    }

    let evictedKey: K | null = null;

    if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value!;
      this.map.delete(oldest);
      evictedKey = oldest;
    }

    this.map.set(key, value);
    return evictedKey;
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  keys(): K[] {
    return Array.from(this.map.keys()).reverse();
  }

  entries(): [K, V][] {
    return Array.from(this.map.entries()).reverse();
  }
}
