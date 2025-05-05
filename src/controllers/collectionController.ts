import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// Tüm koleksiyonları getir
export const getAllCollections = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      include: { products: true },
    });
    return res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error('Tüm koleksiyonları getirirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// ID'ye göre koleksiyon getir
export const getCollectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const collection = await prisma.collection.findUnique({
      where: { collectionId: id },
      include: { products: true },
    });
    
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Koleksiyon bulunamadı' });
    }
    
    return res.status(200).json({ success: true, data: collection });
  } catch (error) {
    console.error('Koleksiyonu getirirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Koleksiyon oluştur
export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name, description, code, coverImageUrl, catalogOrder, price, currency } = req.body;
    
    // Kod benzersiz olmalı, kontrol edelim
    const existingCollection = await prisma.collection.findUnique({
      where: { code },
    });
    
    if (existingCollection) {
      return res.status(400).json({ success: false, message: 'Bu kod zaten kullanımda' });
    }
    
    const newCollection = await prisma.collection.create({
      data: {
        name,
        description,
        code,
        coverImageUrl,
        catalogOrder,
        price: parseFloat(price),
        currency: currency || 'TRY',
      },
    });
    
    return res.status(201).json({ success: true, data: newCollection });
  } catch (error) {
    console.error('Koleksiyon oluştururken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Koleksiyon güncelle
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, code, coverImageUrl, catalogOrder, price, currency, isActive } = req.body;
    
    // Koleksiyonun var olup olmadığını kontrol et
    const existingCollection = await prisma.collection.findUnique({
      where: { collectionId: id },
    });
    
    if (!existingCollection) {
      return res.status(404).json({ success: false, message: 'Koleksiyon bulunamadı' });
    }
    
    // Kod değişmişse ve yeni kod zaten kullanımdaysa kontrol et
    if (code !== existingCollection.code) {
      const codeExists = await prisma.collection.findUnique({
        where: { code },
      });
      
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Bu kod zaten kullanımda' });
      }
    }
    
    const updatedCollection = await prisma.collection.update({
      where: { collectionId: id },
      data: {
        name,
        description,
        code,
        coverImageUrl,
        catalogOrder,
        price: price ? parseFloat(price) : undefined,
        currency,
        isActive,
      },
    });
    
    return res.status(200).json({ success: true, data: updatedCollection });
  } catch (error) {
    console.error('Koleksiyon güncellenirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Koleksiyon sil
export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // İlk önce koleksiyonun var olup olmadığını kontrol et
    const existingCollection = await prisma.collection.findUnique({
      where: { collectionId: id },
    });
    
    if (!existingCollection) {
      return res.status(404).json({ success: false, message: 'Koleksiyon bulunamadı' });
    }
    
    // Koleksiyona bağlı ürünleri kontrol et
    const productsCount = await prisma.product.count({
      where: { collectionId: id },
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu koleksiyona bağlı ürünler var. Önce ürünleri silmelisiniz.' 
      });
    }
    
    // Koleksiyonu sil
    await prisma.collection.delete({
      where: { collectionId: id },
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Koleksiyon başarıyla silindi' 
    });
  } catch (error) {
    console.error('Koleksiyon silinirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
}; 