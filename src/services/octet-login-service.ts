import prisma from '../utils/prisma';
import axios from 'axios';

export class OctetLoginService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Veritabanından login bilgilerini alır (ID=1 olan kayıt)
   */
  private async getLoginCredentials() {
    try {
      const loginInfo = await prisma.dbyeOdemeLogin.findFirst({
        where: { id: 1 },
        select: {
          email: true,
          password: true,
          url: true
        }
      });

      if (!loginInfo) {
        throw new Error('DBYE ödeme login bilgileri bulunamadı (ID: 1)');
      }

      return loginInfo;
    } catch (error) {
      console.error('Login bilgileri alınırken hata:', error);
      throw new Error('Veritabanından login bilgileri alınamadı');
    }
  }

  /**
   * DB'deki token hâlâ geçerliyse döndürür, değilse null
   */
  private async getTokenFromDb(): Promise<{ token: string; tokenExpiry: Date } | null> {
    try {
      const record = await prisma.dbyeOdemeLogin.findFirst({
        where: { id: 1 },
        select: { token: true, tokenExpiry: true }
      });
      if (record?.token && record.tokenExpiry && new Date() < record.tokenExpiry) {
        return { token: record.token, tokenExpiry: record.tokenExpiry };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Token'ı DB'ye kaydeder
   */
  private async saveTokenToDb(token: string, expiry: Date): Promise<void> {
    try {
      await prisma.dbyeOdemeLogin.updateMany({
        where: { id: 1 },
        data: { token, tokenExpiry: expiry }
      });
    } catch (error) {
      console.error('Token DB\'ye kaydedilemedi:', error);
    }
  }

  /**
   * Octet API'ye login olur ve token alır
   */
  async getAuthToken(forceRefresh: boolean = false): Promise<string> {
    try {
      // Önce bellek cache'ini kontrol et
      if (!forceRefresh && this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      // Bellek cache'i boşsa (restart sonrası) DB'den kontrol et
      if (!forceRefresh) {
        const dbToken = await this.getTokenFromDb();
        if (dbToken) {
          console.log('Token DB cache\'inden alındı');
          this.token = dbToken.token;
          // DB'deki gerçek son kullanma tarihini kullan; sabit 50 dk vermek
          // süresi dolmuş token'ın kullanılmasına yol açıyordu
          this.tokenExpiry = dbToken.tokenExpiry;
          return dbToken.token;
        }
      }

      console.log(forceRefresh ? 'Token zorla yenileniyor...' : 'Token expire olmuş, yenileniyor...');

      // Veritabanından login bilgilerini al
      const credentials = await this.getLoginCredentials();

      // Login isteği gönder
      const response = await axios.post(credentials.url, {
        email: credentials.email,
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': 'PostmanRuntime/7.43.0',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        },
        timeout: 30000 // 30 saniye timeout
      });

      // Token'ı al ve sakla
      if (response.data && response.data.token) {
        const token = response.data.token;
        const expiry = new Date(Date.now() + 50 * 60 * 1000); // 50 dakika
        this.token = token;
        this.tokenExpiry = expiry;

        // DB'ye de kaydet (restart'larda kullanmak için)
        await this.saveTokenToDb(token, expiry);
        
        console.log('Octet login başarılı, token alındı ve DB\'ye kaydedildi');
        return token;
      } else {
        throw new Error('Login response\'unda token bulunamadı');
      }

    } catch (error) {
      console.error('Octet login hatası:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`Login başarısız: ${error.response.status} - ${error.response.data?.message || 'Bilinmeyen hata'}`);
        } else if (error.request) {
          throw new Error('Login isteği gönderilemedi - ağ hatası');
        }
      }
      
      // Orijinal hata mesajını koru (örn. DB bağlantı hatası, eksik credentials)
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login işlemi sırasında beklenmeyen hata');
    }
  }

  /**
   * Token'ı temizler (logout için)
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
    console.log('Octet token temizlendi');
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol eder
   */
  isTokenValid(): boolean {
    return !!(this.token && this.tokenExpiry && new Date() < this.tokenExpiry);
  }

  /**
   * Mevcut token'ı döndürür (geçerli değilse yeni token alır)
   */
  async getCurrentToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token as string; // isTokenValid() garanti ediyor ki token null değil
    }
    
    return await this.getAuthToken();
  }
} 