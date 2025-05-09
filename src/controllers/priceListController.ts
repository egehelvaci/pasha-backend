import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

// Tip tanımlamaları
interface PriceList {
  price_list_id: number;
  name: string;
  description: string | null;
  valid_from: Date | null;
  valid_to: Date | null;
  limit_amount: number | null;
  currency: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PriceListDetail {
  price_list_detail_id: number;
  price_list_id: number;
  collection_id: number;
  price_per_square_meter: number;
}

interface User {
  user_id: number;
  email: string;
  userTypeId: number;
}

interface UserType {
  id: number;
  name: string;
}

interface UserPriceList {
  user_price_list_id: number;
  user_id: number;
  price_list_id: number;
}

const prisma = new PrismaClient();

// Tüm fiyat listelerini getir
export const getAllPriceLists = async (req: Request, res: Response) => {
  try {
    const priceLists = await prisma.$queryRaw`SELECT * FROM "PriceList"`;
    
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
    
    const priceList = await prisma.$queryRaw`
      SELECT pl.*, pld.*
      FROM "PriceList" pl
      LEFT JOIN "PriceListDetail" pld ON pl.price_list_id = pld.price_list_id
      LEFT JOIN "Collection" c ON pld.collection_id = c.collection_id
      WHERE pl.price_list_id = ${id}
    `;
    
    if (!priceList || (Array.isArray(priceList) && priceList.length === 0)) {
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
    // Token'dan kullanıcı bilgilerini al
    const user = req.user;
    
    // Kullanıcı admin değilse işlemi reddet
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gereklidir'
      });
    }

    const { 
      name, 
      description, 
      validFrom, 
      validTo, 
      limitAmount, 
      currency, 
      collectionPrices,
      isDefault
    } = req.body;
    
    // Gerekli alanları kontrol et
    if (!name || !currency || !collectionPrices || !Array.isArray(collectionPrices) || collectionPrices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'İsim, para birimi ve en az bir koleksiyon fiyatı gereklidir'
      });
    }

    // Para birimi kontrolü
    if (!['TRY', 'USD', 'EUR'].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz para birimi. TRY, USD veya EUR kullanılabilir'
      });
    }

    // Varsayılan fiyat listesi varsa kontrol et
    if (isDefault) {
      const defaultPriceList = await prisma.$queryRaw<PriceList[]>`
        SELECT * FROM "PriceList" WHERE is_default = true
      `;

      if (defaultPriceList.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Sistemde zaten bir varsayılan fiyat listesi mevcut'
        });
      }
    }
    
    // Oluşturma işlemini transaction ile yap
    const result = await prisma.$transaction(async (tx) => {
      // Fiyat listesini oluştur
      const priceList = await tx.$executeRaw`
        INSERT INTO "PriceList"(name, description, valid_from, valid_to, limit_amount, currency, is_default)
        VALUES (${name}, ${description}, ${validFrom ? new Date(validFrom) : null}, ${validTo ? new Date(validTo) : null}, ${limitAmount}, ${currency}, ${isDefault || false})
        RETURNING *
      `;
      
      const createdPriceList = await tx.$queryRaw<PriceList[]>`
        SELECT * FROM "PriceList" WHERE name = ${name} ORDER BY created_at DESC LIMIT 1
      `;
      
      const priceListId = createdPriceList[0].price_list_id;
      
      // Koleksiyon fiyatlarını oluştur
      if (collectionPrices && collectionPrices.length > 0) {
        for (const item of collectionPrices) {
          // Fiyat kontrolü
          if (!item.pricePerSquareMeter || item.pricePerSquareMeter <= 0) {
            throw new Error('Metrekare fiyatı pozitif bir sayı olmalıdır');
          }

          // Koleksiyonun varlığını kontrol et
          const collection = await tx.$queryRaw`
            SELECT * FROM "Collection" WHERE collection_id = ${item.collectionId}
          `;

          if (!collection || (Array.isArray(collection) && collection.length === 0)) {
            throw new Error(`${item.collectionId} ID'li koleksiyon bulunamadı`);
          }

          await tx.$executeRaw`
            INSERT INTO "PriceListDetail"(price_list_id, collection_id, price_per_square_meter)
            VALUES (${priceListId}, ${item.collectionId}, ${item.pricePerSquareMeter})
          `;
        }
      }
      
      // Oluşturulan fiyat listesini tüm detaylarıyla getir
      const result = await tx.$queryRaw`
        SELECT pl.*, pld.*
        FROM "PriceList" pl
        LEFT JOIN "PriceListDetail" pld ON pl.price_list_id = pld.price_list_id
        LEFT JOIN "Collection" c ON pld.collection_id = c.collection_id
        WHERE pl.price_list_id = ${priceListId}
      `;
      
      return result;
    });
    
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Fiyat listesi oluşturulurken hata oluştu:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
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
    const existingPriceListResult = await prisma.$queryRaw<PriceList[]>`
      SELECT * FROM "PriceList" WHERE price_list_id = ${id}
    `;
    
    const existingPriceList = existingPriceListResult[0];
    
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
    const result = await prisma.$transaction(async (tx) => {
      // Fiyat listesini güncelle
      let updateQuery = 'UPDATE "PriceList" SET ';
      const updateValues = [];
      let paramIndex = 1;
      
      if (name !== undefined) {
        updateQuery += `name = $${paramIndex}, `;
        updateValues.push(name);
        paramIndex++;
      }
      
      if (description !== undefined) {
        updateQuery += `description = $${paramIndex}, `;
        updateValues.push(description);
        paramIndex++;
      }
      
      if (!existingPriceList.is_default) {
        if (validFrom !== undefined) {
          updateQuery += `valid_from = $${paramIndex}, `;
          updateValues.push(validFrom ? new Date(validFrom) : null);
          paramIndex++;
        }
        
        if (validTo !== undefined) {
          updateQuery += `valid_to = $${paramIndex}, `;
          updateValues.push(validTo ? new Date(validTo) : null);
          paramIndex++;
        }
        
        if (limitAmount !== undefined) {
          updateQuery += `limit_amount = $${paramIndex}, `;
          updateValues.push(limitAmount);
          paramIndex++;
        }
      }
      
      if (currency !== undefined) {
        updateQuery += `currency = $${paramIndex}, `;
        updateValues.push(currency);
        paramIndex++;
      }
      
      // Son virgülü kaldır ve WHERE ekle
      updateQuery = updateQuery.slice(0, -2) + ` WHERE price_list_id = $${paramIndex}`;
      updateValues.push(id);
      
      await tx.$executeRawUnsafe(updateQuery, ...updateValues);
      
      // Koleksiyon fiyatlarını güncelle
      if (collectionPrices && collectionPrices.length > 0) {
        // Önce var olan tüm fiyat detaylarını sil
        await tx.$executeRaw`
          DELETE FROM "PriceListDetail" WHERE price_list_id = ${id}
        `;
        
        // Yeni fiyat detaylarını oluştur
        for (const item of collectionPrices) {
          await tx.$executeRaw`
            INSERT INTO "PriceListDetail"(price_list_id, collection_id, price_per_square_meter)
            VALUES (${id}, ${item.collectionId}, ${item.pricePerSquareMeter})
          `;
        }
      }
      
      // Güncellenmiş fiyat listesini tüm detaylarıyla getir
      const result = await tx.$queryRaw`
        SELECT pl.*, pld.*
        FROM "PriceList" pl
        LEFT JOIN "PriceListDetail" pld ON pl.price_list_id = pld.price_list_id
        LEFT JOIN "Collection" c ON pld.collection_id = c.collection_id
        WHERE pl.price_list_id = ${id}
      `;
      
      return result;
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
    const priceListResult = await prisma.$queryRaw<PriceList[]>`
      SELECT * FROM "PriceList" WHERE price_list_id = ${id}
    `;
    
    const priceList = priceListResult[0];
    
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
    await prisma.$transaction(async (tx) => {
      // Önce fiyat listesine ait tüm kullanıcı atamalarını sil
      await tx.$executeRaw`
        DELETE FROM "UserPriceList" WHERE price_list_id = ${id}
      `;
      
      // Sonra fiyat listesine ait tüm detayları sil
      await tx.$executeRaw`
        DELETE FROM "PriceListDetail" WHERE price_list_id = ${id}
      `;
      
      // En son fiyat listesini sil
      await tx.$executeRaw`
        DELETE FROM "PriceList" WHERE price_list_id = ${id}
      `;
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
    const collections = await prisma.$queryRaw`
      SELECT "collection_id" as "collectionId", name, code FROM "Collection" WHERE "is_active" = true ORDER BY name ASC
    `;
    
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
    const user = await prisma.user.findUnique({
      where: { userId },
      include: { userType: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    const priceList = await prisma.priceList.findUnique({
      where: { price_list_id: priceListId }
    });
    
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Fiyat listesi bulunamadı' });
    }
    
    // Kullanıcının "viewer" tipinde olup olmadığını kontrol et
    if (user.userType?.name !== 'viewer') {
      return res.status(400).json({ 
        success: false, 
        message: 'Fiyat listesi sadece viewer tipindeki kullanıcılara atanabilir' 
      });
    }
    
    // Kullanıcıya zaten bir fiyat listesi atanmış mı kontrol et
    const existingAssignment = await prisma.userPriceList.findFirst({
      where: {
        user_id: userId,
        price_list_id: priceListId
      }
    });
    
    // Eğer zaten bir atama varsa güncelle, yoksa yeni oluştur
    let userPriceList;
    
    if (existingAssignment) {
      userPriceList = await prisma.userPriceList.update({
        where: { user_price_list_id: existingAssignment.user_price_list_id },
        data: {
          price_list_id: priceListId,
          updated_at: new Date()
        }
      });
    } else {
      userPriceList = await prisma.userPriceList.create({
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
    
    const userPriceLists = await prisma.$queryRaw`
      SELECT upl.*, pl.name as price_list_name, pl.description as price_list_description
      FROM "UserPriceList" upl
      JOIN "PriceList" pl ON upl.price_list_id = pl.price_list_id
      WHERE upl.user_id = ${userId}
    `;
    
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
    
    const userPriceListResult = await prisma.$queryRaw<UserPriceList[]>`
      SELECT * FROM "UserPriceList" WHERE user_price_list_id = ${id}
    `;
    
    const userPriceList = userPriceListResult[0];
    
    if (!userPriceList) {
      return res.status(404).json({ success: false, message: 'Kullanıcı fiyat listesi bulunamadı' });
    }
    
    await prisma.$executeRaw`
      DELETE FROM "UserPriceList" WHERE user_price_list_id = ${id}
    `;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Kullanıcı fiyat listesi ataması başarıyla kaldırıldı' 
    });
  } catch (error) {
    console.error('Kullanıcı fiyat listesi ataması kaldırılırken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
}; 