import { Request, Response } from 'express';

/**
 * Giriş ekranı için rastgele görsel döndüren basit controller
 */
export class LoginAssetsController {
  
  /**
   * 4 adet görsel - sadece bunlardan rastgele biri döndürülecek
   */
  private images = [
    'https://images.unsplash.com/photo-1615285103008-306b965bcc95?q=80&w=766&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1600166898405-da9535204843?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1627296345489-faf81a8f15ae?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1616395442106-1b927fee41cd?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ];

  /**
   * 4 görselden rastgele birini döndür
   */
  async getRandomCarpetStoreImage(req: Request, res: Response) {
    try {
      // Rastgele bir görsel seç (0-3 arası indeks)
      const randomIndex = Math.floor(Math.random() * this.images.length);
      const selectedImage = this.images[randomIndex];
      
      return res.json({
        success: true,
        data: {
          imageUrl: selectedImage
        }
      });

    } catch (error) {
      console.error('❌ Rastgele görsel getirme hatası:', error);
      
      // Hata durumunda ilk görseli döndür
      return res.json({
        success: true,
        data: {
          imageUrl: this.images[0]
        }
      });
    }
  }
}