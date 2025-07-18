interface CacheItem<T> {
  data: T;
  expireAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 dakika

  set<T>(key: string, data: T, ttl?: number): void {
    const expireAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expireAt });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache anahtarı oluşturucu fonksiyonlar
  getUserPriceListKey(userId: string): string {
    return `user:${userId}:pricelist`;
  }

  getCollectionsKey(): string {
    return 'collections:all';
  }

  getProductRulesKey(): string {
    return 'product:rules:all';
  }

  // TTL süreleri
  static readonly TTL = {
    SHORT: 2 * 60 * 1000,      // 2 dakika
    MEDIUM: 5 * 60 * 1000,     // 5 dakika  
    LONG: 15 * 60 * 1000,      // 15 dakika
    VERY_LONG: 60 * 60 * 1000  // 1 saat
  };
}

export const cacheService = new CacheService(); 