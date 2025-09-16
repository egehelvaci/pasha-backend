import prisma from './prisma';

/**
 * Database işlemlerini retry logic ile çalıştır
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Connection pool timeout veya too many clients hatası
      if (
        error.code === 'P1008' || // Connection pool timeout
        error.code === 'P1001' || // Connection timeout
        error.message?.includes('too many clients') ||
        error.message?.includes('Connection pool timeout')
      ) {
        console.log(`🔄 DB bağlantı hatası, deneme ${attempt}/${maxRetries}:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff ile bekle
          const delay = delayMs * Math.pow(2, attempt - 1);
          console.log(`⏳ ${delay}ms bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Diğer hatalar için retry yapma
      throw error;
    }
  }
  
  // Tüm denemeler başarısız
  console.error('❌ Tüm DB retry denemeleri başarısız:', lastError);
  throw new Error(`Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin. (${maxRetries} deneme yapıldı)`);
}

/**
 * Connection pool durumunu kontrol et
 */
export async function checkConnectionHealth(): Promise<{
  isHealthy: boolean;
  activeConnections?: number;
  error?: string;
}> {
  try {
    // Basit bir query ile bağlantı test et
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      isHealthy: true
    };
  } catch (error: any) {
    return {
      isHealthy: false,
      error: error.message
    };
  }
}

/**
 * Graceful shutdown için tüm bağlantıları kapat
 */
export async function gracefulShutdown(): Promise<void> {
  try {
    console.log('🔄 Veritabanı bağlantıları kapatılıyor...');
    await prisma.$disconnect();
    console.log('✅ Veritabanı bağlantıları başarıyla kapatıldı');
  } catch (error) {
    console.error('❌ Bağlantı kapatma hatası:', error);
  }
}
