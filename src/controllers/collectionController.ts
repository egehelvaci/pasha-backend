import { Request, Response } from 'express';
import { CollectionService } from '../collection-service';
import prisma from '../utils/prisma';

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
    const { name, description, code } = req.body;
    
    // Gerekli alanları kontrol et
    if (!name || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'İsim ve kod alanları zorunludur' 
      });
    }

    // Kod benzersiz olmalı, kontrol edelim
    const existingCollection = await prisma.collection.findUnique({
      where: {
        code: code
      }
    });
    
    if (existingCollection) {
      return res.status(400).json({ success: false, message: 'Bu kod zaten kullanımda' });
    }
    
    const newCollection = await new CollectionService().createCollection({ name, description, code });
    
    return res.status(201).json({ success: true, data: newCollection });
  } catch (error) {
    console.error('Koleksiyon oluştururken hata oluştu:', error);
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
    
    // Prisma transaction kullanarak koleksiyon ve bağlı ürünleri sil
    await prisma.$transaction(async (prismaClient) => {
      // Önce koleksiyona bağlı tüm ürünleri sil
      await prismaClient.product.deleteMany({
        where: { collectionId: id },
      });
      
      // Sonra koleksiyonu sil
      await prismaClient.collection.delete({
        where: { collectionId: id },
      });
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Koleksiyon ve bağlı tüm ürünler başarıyla silindi' 
    });
  } catch (error) {
    console.error('Koleksiyon silinirken hata oluştu:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
}; 