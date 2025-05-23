import { Request, Response } from 'express';
import { ProductService } from '../product-service';
import { UploadService } from '../utils/upload-service';
import multer from 'multer';
import { Readable } from 'stream';
import { PrismaClient } from '../../generated/prisma';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Geçici dosya yükleme için multer yapılandırması
// Ürün görselleri için dosya yükleme dizini
const uploadDir = path.join(process.cwd(), 'uploads/products');

// Eğer dizin yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya yükleme için storage konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Dosya yükleme için multer middleware
export const upload = multer({ storage: storage });

// Ürün görseli yükleme middleware'i
export const uploadProductImage = upload.single('productImage');

// Servisler
const productService = new ProductService();
const uploadService = new UploadService();

// Tüm ürünleri getir
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Kullanıcı ID'sini al (eğer varsa)
    const userId = (req as any).user?.userId;
    
    const products = await productService.getAllProducts(userId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürünler getirilemedi'
    });
  }
};

// ID'ye göre ürün getir - Kullanıcı bazlı fiyatlandırma
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    
    // Kullanıcı ID'sini al (öncelikle token içinden, yoksa sorgu parametresinden)
    const userId = (req as any).user?.userId;
    
    // Ürünün detaylarını ve kullanıcıya özel fiyat bilgisini al
    const product = await productService.getProductById(productId, userId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün getirilemedi'
    });
  }
};

// Koleksiyona göre ürünleri getir
export const getProductsByCollection = async (req: Request, res: Response) => {
  try {
    const collectionId = req.params.collectionId;
    
    // Kullanıcı ID'sini al (eğer varsa)
    const userId = (req as any).user?.userId;
    
    const products = await productService.getProductsByCollection(collectionId, userId);
    
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Koleksiyon ürünleri getirilemedi'
    });
  }
};

// Tüm ürün kurallarını getir (dropdown için)
export const getAllProductRules = async (req: Request, res: Response) => {
  try {
    const rules = await prisma.productrules.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün kuralları getirilemedi'
    });
  }
};

// Yeni ürün oluştur (resim yükleme ile)
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Gelen verileri logla
    console.log('Gelen istek gövdesi:', req.body);
    console.log('Gelen dosya:', req.file);
    
    const { name, description, collectionId, rule_id } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !description || !collectionId) {
      console.log('Eksik alanlar:', { name, description, collectionId });
      return res.status(400).json({
        success: false,
        message: 'Tüm zorunlu alanları doldurmanız gerekiyor'
      });
    }
    
    // rule_id sayısal değerini kontrol et
    let ruleId = undefined;
    if (rule_id !== undefined && rule_id !== null && rule_id !== "") {
      if (isNaN(parseInt(rule_id))) {
        return res.status(400).json({
          success: false,
          message: 'Kural ID sayısal bir değer olmalıdır'
        });
      }
      ruleId = parseInt(rule_id);
    }
    
    let productImageUrl = undefined;
    
    // Eğer resim yüklendiyse, Tebi.io'ya yükle
    if (req.file) {
      productImageUrl = await uploadService.uploadFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    }
    
    // Ürünü oluştur
    const product = await productService.createProduct({
      name,
      description,
      productImage: productImageUrl,
      collectionId,
      rule_id: ruleId
    });
    
    return res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Ürün oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ürün oluşturulamadı',
      error: error.message
    });
  }
};

// Basitleştirilmiş ürün oluşturma (test amaçlı)
export const createProductSimple = async (req: Request, res: Response) => {
  try {
    const { name, description, collectionId } = req.body;
    
    if (!name || !description || !collectionId) {
      return res.status(400).json({
        success: false,
        message: 'Name, description ve collectionId alanları zorunludur'
      });
    }
    
    let productImageUrl = undefined;
    if (req.file) {
      console.log('Yüklenen dosya:', req.file);
      productImageUrl = await uploadService.uploadFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    }
    
    const product = await productService.createProduct({
      name,
      description,
      productImage: productImageUrl,
      collectionId
    });
    
    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error('Test ürün oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ürün oluşturulamadı',
      error: error.message
    });
  }
};

// Ürün güncelle (resim yükleme ile)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updateData: any = {};
    
    // Sadece gönderilen alanları güncelleme nesnesine ekle
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.collectionId !== undefined) updateData.collectionId = req.body.collectionId;
    
    // rule_id için özel işlem
    if (req.body.rule_id !== undefined) {
      if (req.body.rule_id === null || req.body.rule_id === "null" || req.body.rule_id === "") {
        updateData.rule_id = null;
      } else {
        updateData.rule_id = parseInt(req.body.rule_id);
        
        if (isNaN(updateData.rule_id)) {
          return res.status(400).json({
            success: false,
            message: 'Kural ID sayısal bir değer olmalıdır'
          });
        }
      }
    }
    
    // Eğer resim yüklendiyse, Tebi.io'ya yükle
    if (req.file) {
      updateData.productImage = await uploadService.uploadFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    }
    
    // Ürünü güncelle
    const updatedProduct = await productService.updateProduct(productId, updateData);
    
    return res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün güncellenemedi'
    });
  }
};

// Ürün sil
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    await productService.deleteProduct(productId);
    
    return res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün silinemedi'
    });
  }
};

// Stok güncelle
export const updateProductStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { width, height, quantity } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!width || height === undefined || height === null || height === '' || quantity === undefined || isNaN(parseInt(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir genişlik, yükseklik ve miktar değeri gereklidir'
      });
    }
    
    // Genişlik değeri kontrolü
    const widthValue = parseInt(width);
    if (isNaN(widthValue)) {
      return res.status(400).json({
        success: false,
        message: 'Genişlik değeri sayısal olmalıdır'
      });
    }
    
    // Yükseklik değeri kontrolü
    const heightValue = parseInt(height);
    if (isNaN(heightValue)) {
      return res.status(400).json({
        success: false,
        message: 'Yükseklik değeri sayısal olmalıdır'
      });
    }
    
    // Stok güncelleme işlemini gerçekleştir
    const product = await productService.updateStock(id, {
      width: widthValue,
      height: heightValue,
      quantity: parseInt(quantity)
    });
    
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Stok güncellenemedi'
    });
  }
};

// Ürünün varyasyon seçeneklerini getir
export const getProductVariationOptions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const variationOptions = await productService.getProductVariationOptions(id);
    
    return res.status(200).json({
      success: true,
      data: variationOptions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün varyasyon seçenekleri getirilemedi'
    });
  }
}; 