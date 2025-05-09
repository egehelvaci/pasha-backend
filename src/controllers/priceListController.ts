import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '../../generated/prisma';

const prisma = new PrismaClient();

// Tüm fiyat listelerini getir
export const getAllPriceLists = async (req: Request, res: Response) => {
  try {
    const priceLists = await prisma.PriceList.findMany({
      include: {
        PriceListDetail: true
      }
    });
    
    return res.status(200).json({ success: true, data: priceLists });
  } catch (error) {
    console.error('Fiyat listeleri getirilirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Fiyat listesi detaylarını getir
export const getPriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const priceList = await prisma.PriceList.findUnique({
      where: { price_list_id: id },
      include: {
        PriceListDetail: {
          include: {
            Collection: true
          }
        }
      }
    });
    
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Fiyat listesi bulunamadı' });
    }
    
    return res.status(200).json({ success: true, data: priceList });
  } catch (error) {
    console.error('Fiyat listesi getirilirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Yeni fiyat listesi oluştur
export const createPriceList = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      validFrom, 
      validTo, 
      limitAmount, 
      currency, 
      collectionPrices
    } = req.body;
    
    // Default olarak oluşturulmasını engelle
    if (req.body.isDefault === true) {
      return res.status(400).json({ 
        success: false, 
        message: 'Yeni bir varsayılan fiyat listesi oluşturulamaz'
      });
    }
    
    // Oluşturma işlemini transaction ile yap
    const result = await prisma.$transaction(async (prismaClient) => {
      // Fiyat listesini oluştur
      const priceList = await prismaClient.PriceList.create({
        data: {
          name,
          description,
          valid_from: validFrom ? new Date(validFrom) : null,
          valid_to: validTo ? new Date(validTo) : null,
          limit_amount: limitAmount,
          currency,
          is_default: false
        }
      });
      
      // Koleksiyon fiyatlarını oluştur
      if (collectionPrices && collectionPrices.length > 0) {
        await Promise.all(
          collectionPrices.map((item: any) => 
            prismaClient.PriceListDetail.create({
              data: {
                price_list_id: priceList.price_list_id,
                collection_id: item.collectionId,
                price_per_square_meter: item.pricePerSquareMeter
              }
            })
          )
        );
      }
      
      // Oluşturulan fiyat listesini tüm detaylarıyla getir
      return await prismaClient.PriceList.findUnique({
        where: { price_list_id: priceList.price_list_id },
        include: {
          PriceListDetail: {
            include: {
              Collection: true
            }
          }
        }
      });
    });
    
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Fiyat listesi oluşturulurken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Fiyat listesi güncelle
export const updatePriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      validFrom, 
      validTo, 
      limitAmount, 
      currency, 
      collectionPrices 
    } = req.body;
    
    // Fiyat listesini kontrol et
    const existingPriceList = await prisma.PriceList.findUnique({
      where: { price_list_id: id }
    });
    
    if (!existingPriceList) {
      return res.status(404).json({ success: false, message: 'Fiyat listesi bulunamadı' });
    }
    
    // Default liste ise validFrom, validTo ve limitAmount alanlarını güncellemeyi engelle
    if (existingPriceList.is_default) {
      if (validFrom || validTo || limitAmount) {
        return res.status(400).json({ 
          success: false,
          message: 'Varsayılan fiyat listesine geçerlilik süresi veya limit eklenemez' 
        });
      }
    }
    
    // isDefault değerini değiştirmeyi engelle
    if (req.body.isDefault !== undefined && req.body.isDefault !== existingPriceList.is_default) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fiyat listesinin varsayılan durumu değiştirilemez' 
      });
    }
    
    // Güncelleme işlemini transaction ile yap
    const result = await prisma.$transaction(async (prismaClient) => {
      // Fiyat listesini güncelle
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (!existingPriceList.is_default) {
        if (validFrom !== undefined) updateData.valid_from = validFrom ? new Date(validFrom) : null;
        if (validTo !== undefined) updateData.valid_to = validTo ? new Date(validTo) : null;
        if (limitAmount !== undefined) updateData.limit_amount = limitAmount;
      }
      if (currency !== undefined) updateData.currency = currency;
      
      const updatedPriceList = await prismaClient.PriceList.update({
        where: { price_list_id: id },
        data: updateData
      });
      
      // Koleksiyon fiyatlarını güncelle
      if (collectionPrices && collectionPrices.length > 0) {
        // Önce var olan tüm fiyat detaylarını sil
        await prismaClient.PriceListDetail.deleteMany({
          where: { price_list_id: id }
        });
        
        // Yeni fiyat detaylarını oluştur
        await Promise.all(
          collectionPrices.map((item: any) => 
            prismaClient.PriceListDetail.create({
              data: {
                price_list_id: id,
                collection_id: item.collectionId,
                price_per_square_meter: item.pricePerSquareMeter
              }
            })
          )
        );
      }
      
      // Güncellenmiş fiyat listesini tüm detaylarıyla getir
      return await prismaClient.PriceList.findUnique({
        where: { price_list_id: id },
        include: {
          PriceListDetail: {
            include: {
              Collection: true
            }
          }
        }
      });
    });
    
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Fiyat listesi güncellenirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Fiyat listesi sil
export const deletePriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fiyat listesini kontrol et
    const priceList = await prisma.PriceList.findUnique({
      where: { price_list_id: id }
    });
    
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Fiyat listesi bulunamadı' });
    }
    
    // Varsayılan fiyat listesi ise silmeyi engelle
    if (priceList.is_default) {
      return res.status(400).json({ 
        success: false, 
        message: 'Varsayılan fiyat listesi silinemez' 
      });
    }
    
    // Silme işlemini transaction ile yap
    await prisma.$transaction(async (prismaClient) => {
      // Önce fiyat listesine ait tüm kullanıcı atamalarını sil
      await prismaClient.UserPriceList.deleteMany({
        where: { price_list_id: id }
      });
      
      // Sonra fiyat listesine ait tüm detayları sil
      await prismaClient.PriceListDetail.deleteMany({
        where: { price_list_id: id }
      });
      
      // En son fiyat listesini sil
      await prismaClient.PriceList.delete({
        where: { price_list_id: id }
      });
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Fiyat listesi başarıyla silindi' 
    });
  } catch (error) {
    console.error('Fiyat listesi silinirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Fiyat listesi oluştururken kullanılacak koleksiyonları getir
export const getCollectionsForPriceList = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.Collection.findMany({
      where: { isActive: true },
      select: {
        collectionId: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    });
    
    return res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error('Koleksiyonlar getirilirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Kullanıcıya fiyat listesi ata
export const assignPriceListToUser = async (req: Request, res: Response) => {
  try {
    const { userId, priceListId } = req.body;
    
    // Kullanıcı ve fiyat listesinin varlığını kontrol et
    const user = await prisma.User.findUnique({ where: { userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    const priceList = await prisma.PriceList.findUnique({ where: { price_list_id: priceListId } });
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Fiyat listesi bulunamadı' });
    }
    
    // Kullanıcının "viewer" tipinde olup olmadığını kontrol et
    const userType = await prisma.UserType.findUnique({ where: { id: user.userTypeId } });
    if (userType?.name !== 'viewer') {
      return res.status(400).json({ 
        success: false, 
        message: 'Fiyat listesi sadece viewer tipindeki kullanıcılara atanabilir' 
      });
    }
    
    // Kullanıcıya zaten bir fiyat listesi atanmış mı kontrol et
    const existingAssignment = await prisma.UserPriceList.findFirst({
      where: { user_id: userId }
    });
    
    // Eğer zaten bir atama varsa güncelle, yoksa yeni oluştur
    let userPriceList;
    if (existingAssignment) {
      userPriceList = await prisma.UserPriceList.update({
        where: { user_price_list_id: existingAssignment.user_price_list_id },
        data: { price_list_id: priceListId }
      });
    } else {
      userPriceList = await prisma.UserPriceList.create({
        data: {
          user_id: userId,
          price_list_id: priceListId
        }
      });
    }
    
    return res.status(200).json({ success: true, data: userPriceList });
  } catch (error) {
    console.error('Fiyat listesi kullanıcıya atanırken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Kullanıcı fiyat listesi atamalarını getir
export const getUserPriceLists = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userPriceLists = await prisma.UserPriceList.findMany({
      where: { user_id: userId },
      include: {
        PriceList: true
      }
    });
    
    return res.status(200).json({ success: true, data: userPriceLists });
  } catch (error) {
    console.error('Kullanıcı fiyat listeleri getirilirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Kullanıcı fiyat listesi atamasını kaldır
export const removeUserPriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userPriceList = await prisma.UserPriceList.findUnique({
      where: { user_price_list_id: id }
    });
    
    if (!userPriceList) {
      return res.status(404).json({ success: false, message: 'Kullanıcı fiyat listesi bulunamadı' });
    }
    
    await prisma.UserPriceList.delete({
      where: { user_price_list_id: id }
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Kullanıcı fiyat listesi ataması başarıyla kaldırıldı' 
    });
  } catch (error) {
    console.error('Kullanıcı fiyat listesi ataması kaldırılırken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
}; 