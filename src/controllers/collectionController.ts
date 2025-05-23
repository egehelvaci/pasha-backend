import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma';
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
    
    const newCollection = await prisma.collection.create({
      data: {
        name,
        description: description || null,
        code,
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
    const { name, description, code, isActive } = req.body;

    // En az bir güncelleme alanı olmalı
    if (!name && !description && !code && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'En az bir alan güncellenmelidir'
      });
    }
    
    // Koleksiyonun var olup olmadığını kontrol et
    const existingCollection = await prisma.collection.findUnique({
      where: { collectionId: id },
    });
    
    if (!existingCollection) {
      return res.status(404).json({ success: false, message: 'Koleksiyon bulunamadı' });
    }
    
    // Kod değişmişse ve yeni kod zaten kullanımdaysa kontrol et
    if (code && code !== existingCollection.code) {
      const codeExists = await prisma.collection.findUnique({
        where: { code },
      });
      
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Bu kod zaten kullanımda' });
      }
    }
    
    const updateData: Prisma.CollectionUpdateInput = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedCollection = await prisma.collection.update({
      where: { collectionId: id },
      data: updateData,
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