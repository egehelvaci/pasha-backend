import prisma from './prisma';

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

 