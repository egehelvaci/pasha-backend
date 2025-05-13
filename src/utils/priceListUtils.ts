import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

/**
 * Kullanıcının toplam harcamasını hesaplar (sipariş sistemi gelecekte eklendiğinde kullanılacak)
 * @param userId Kullanıcı ID'si
 * @returns Toplam harcama
 */
export const calculateUserSpending = async (userId: string): Promise<number> => {
  // Bu fonksiyon, kullanıcının toplam harcamasını hesaplamak için kullanılacak
  // Şu anda sipariş/satın alma tablolarınız olmadığı için bu fonksiyonu daha sonra tamamlayabilirsiniz
  return 0;
};

/**
 * Kullanıcı için geçerli fiyat listesini belirler
 * @param userId Kullanıcı ID'si
 * @returns Fiyat listesi
 */
export const getActivePriceListForUser = async (userId: string) => {
  // Kullanıcının mağazasını bul
  const user = await prisma.user.findUnique({
    where: { userId },
    include: { Store: true }
  });
  
  if (user?.Store) {
    // Kullanıcının mağazasına atanmış fiyat listesini kontrol et
    const storePriceList = await prisma.storePriceList.findFirst({
      where: { store_id: user.Store.store_id },
      include: { PriceList: true }
    });
    
    if (storePriceList) {
      const priceList = storePriceList.PriceList;
      
      // Fiyat listesinin geçerlilik süresini kontrol et
      const now = new Date();
      if (priceList.valid_from && new Date(priceList.valid_from) > now) {
        // Henüz başlamamış, varsayılan listeyi kullan
        return await getDefaultPriceList();
      }
      
      if (priceList.valid_to && new Date(priceList.valid_to) < now) {
        // Süresi dolmuş, varsayılan listeyi kullan
        return await getDefaultPriceList();
      }
      
      // Fiyat listesinin limit tutarını kontrol et
      if (priceList.limit_amount) {
        const userSpending = await calculateUserSpending(userId);
        if (userSpending >= Number(priceList.limit_amount)) {
          // Limiti aşmış, varsayılan listeyi kullan
          return await getDefaultPriceList();
        }
      }
      
      return priceList;
    }
  }
  
  // Kullanıcıya özel fiyat listesi yoksa varsayılan listeyi kullan
  return await getDefaultPriceList();
};

/**
 * Varsayılan fiyat listesini getirir
 * @returns Varsayılan fiyat listesi
 */
export const getDefaultPriceList = async () => {
  const defaultPriceList = await prisma.priceList.findFirst({
    where: { is_default: true },
    include: {
      PriceListDetail: true
    }
  });
  return defaultPriceList;
};

/**
 * Bir ürün için fiyat hesaplar
 * @param productId Ürün ID'si
 * @param priceListId Fiyat listesi ID'si (opsiyonel, belirtilmezse default liste kullanılır)
 * @returns Ürün fiyatı
 */
export const calculateProductPrice = async (productId: string, priceListId?: string) => {
  // Ürünü getir
  const product = await prisma.product.findUnique({
    where: { productId },
    include: { collection: true }
  });
  
  if (!product) {
    throw new Error('Ürün bulunamadı');
  }

  // Fiyat listesini belirle
  let priceList;
  if (priceListId) {
    priceList = await prisma.priceList.findUnique({
      where: { price_list_id: priceListId },
      include: {
        PriceListDetail: true
      }
    });

    if (!priceList) {
      priceList = await getDefaultPriceList();
    }
  } else {
    priceList = await getDefaultPriceList();
  }
  
  if (!priceList) {
    throw new Error('Fiyat listesi bulunamadı');
  }
  
  // Ürünün ait olduğu koleksiyonun fiyat detayını bul
  const priceDetail = priceList.PriceListDetail.find(
    (detail: any) => detail.collection_id === product.collectionId
  );
  
  if (!priceDetail) {
    throw new Error('Bu ürün için fiyat bilgisi bulunamadı');
  }
  
  // m² cinsinden alanı hesapla
  const areaInSquareMeters = (product.width * product.height) / 10000; // cm²'den m²'ye çevirme
  
  // Fiyatı hesapla - Decimal tipini Number'a çevir
  const pricePerSquareMeter = Number(priceDetail.price_per_square_meter);
  const price = areaInSquareMeters * pricePerSquareMeter;
  
  return {
    price,
    currency: priceList.currency,
    areaInSquareMeters,
    pricePerSquareMeter,
    priceListId: priceList.price_list_id,
    priceListName: priceList.name
  };
}; 