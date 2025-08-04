import { Request, Response } from 'express';

/**
 * Giriş ekranı için rastgele halı mağazası görsellerini döndüren controller
 */
export class LoginAssetsController {
  
  /**
   * Rastgele halı mağazası görselleri - internetten halı mağazası resimleri
   */
  private carpetStoreImages = [
    // Halı mağazası iç mekan görselleri
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    
    // Halı detay görselleri
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493909112788-30823d8967df?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&h=600&fit=crop',
    
    // Modern halı mağazası görselleri
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=600&fit=crop',
    
    // Dekoratif halı görselleri
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493909112788-30823d8967df?w=800&h=600&fit=crop',
    
    // GIF URL'leri (Giphy'den halı ve mağaza temalı)
    'https://media.giphy.com/media/l0MYw3vwxIAFKz1Xa/giphy.gif',
    'https://media.giphy.com/media/3oEjI9T0ixjZCFwi8U/giphy.gif',
    'https://media.giphy.com/media/l0HlE1rFpeFi7jOF2/giphy.gif',
    'https://media.giphy.com/media/3oEjI53nOOAHKhXnI4/giphy.gif',
    
    // Pexels halı görselleri
    'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?w=800&h=600&fit=crop',
    
    // Pixabay halı görselleri
    'https://cdn.pixabay.com/photo/2017/03/28/12/10/chairs-2181947_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/13/14/hall-1870359_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/09/09/18/25/living-room-2732939_1280.jpg',
    'https://cdn.pixabay.com/photo/2018/01/26/08/15/dining-room-3108037_1280.jpg'
  ];

  /**
   * Rastgele halı mağazası görseli döndür
   */
  async getRandomCarpetStoreImage(req: Request, res: Response) {
    try {
      // Rastgele bir görsel seç
      const randomIndex = Math.floor(Math.random() * this.carpetStoreImages.length);
      const selectedImage = this.carpetStoreImages[randomIndex];
      
      // Görsel tipi belirle
      const isGif = selectedImage.includes('.gif');
      const isVideo = selectedImage.includes('.mp4') || selectedImage.includes('.webm');
      
      console.log(`🖼️ Rastgele halı mağazası görseli seçildi: ${selectedImage}`);
      
      return res.json({
        success: true,
        data: {
          imageUrl: selectedImage,
          type: isGif ? 'gif' : isVideo ? 'video' : 'image',
          isAnimated: isGif || isVideo,
          source: this.getImageSource(selectedImage),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Rastgele görsel getirme hatası:', error);
      
      // Hata durumunda varsayılan görsel döndür
      return res.json({
        success: true,
        data: {
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          type: 'image',
          isAnimated: false,
          source: 'unsplash',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Birden fazla rastgele görsel döndür
   */
  async getMultipleRandomImages(req: Request, res: Response) {
    try {
      const { count = 5 } = req.query;
      const imageCount = Math.min(parseInt(count as string) || 5, 10); // Maximum 10 görsel
      
      const selectedImages = [];
      const usedIndexes = new Set();
      
      // Belirtilen sayıda benzersiz görsel seç
      while (selectedImages.length < imageCount && usedIndexes.size < this.carpetStoreImages.length) {
        const randomIndex = Math.floor(Math.random() * this.carpetStoreImages.length);
        
        if (!usedIndexes.has(randomIndex)) {
          usedIndexes.add(randomIndex);
          const imageUrl = this.carpetStoreImages[randomIndex];
          const isGif = imageUrl.includes('.gif');
          const isVideo = imageUrl.includes('.mp4') || imageUrl.includes('.webm');
          
          selectedImages.push({
            imageUrl,
            type: isGif ? 'gif' : isVideo ? 'video' : 'image',
            isAnimated: isGif || isVideo,
            source: this.getImageSource(imageUrl)
          });
        }
      }
      
      console.log(`🖼️ ${selectedImages.length} adet rastgele halı mağazası görseli seçildi`);
      
      return res.json({
        success: true,
        data: {
          images: selectedImages,
          count: selectedImages.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Çoklu görsel getirme hatası:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Görseller getirilirken hata oluştu'
      });
    }
  }

  /**
   * Tüm mevcut görselleri listele (admin için)
   */
  async getAllImages(req: Request, res: Response) {
    try {
      const imagesWithMetadata = this.carpetStoreImages.map((imageUrl, index) => {
        const isGif = imageUrl.includes('.gif');
        const isVideo = imageUrl.includes('.mp4') || imageUrl.includes('.webm');
        
        return {
          id: index + 1,
          imageUrl,
          type: isGif ? 'gif' : isVideo ? 'video' : 'image',
          isAnimated: isGif || isVideo,
          source: this.getImageSource(imageUrl)
        };
      });
      
      return res.json({
        success: true,
        data: {
          images: imagesWithMetadata,
          totalCount: imagesWithMetadata.length,
          sources: {
            unsplash: imagesWithMetadata.filter(img => img.source === 'unsplash').length,
            pexels: imagesWithMetadata.filter(img => img.source === 'pexels').length,
            pixabay: imagesWithMetadata.filter(img => img.source === 'pixabay').length,
            giphy: imagesWithMetadata.filter(img => img.source === 'giphy').length
          }
        }
      });

    } catch (error) {
      console.error('❌ Tüm görselleri listeleme hatası:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Görseller listelenirken hata oluştu'
      });
    }
  }

  /**
   * Görsel kaynağını belirle
   */
  private getImageSource(imageUrl: string): string {
    if (imageUrl.includes('unsplash.com')) return 'unsplash';
    if (imageUrl.includes('pexels.com')) return 'pexels';
    if (imageUrl.includes('pixabay.com')) return 'pixabay';
    if (imageUrl.includes('giphy.com')) return 'giphy';
    return 'unknown';
  }

  /**
   * Sağlık kontrolü
   */
  async healthCheck(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          service: 'login-assets',
          status: 'healthy',
          totalImages: this.carpetStoreImages.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Servis sağlık kontrolü başarısız'
      });
    }
  }
}