import { Request, Response } from 'express';
import { ProductService } from '../product-service';
import { UploadService } from '../utils/upload-service';
import multer from 'multer';
import { Readable } from 'stream';

// Multer konfigürasyonu
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Multer için export edilmesi gereken middleware - productImage alanını kabul ediyoruz
export const uploadProductImage = upload.single('productImage');

// Servisler
const productService = new ProductService();
const uploadService = new UploadService();

// Tüm ürünleri getir
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
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

// ID'ye göre ürün getir
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);
    
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

// Yeni ürün oluştur (resim yükleme ile)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, width, height, cut, collectionId, currency } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !description || !price || stock === undefined || 
        !width || !height || cut === undefined || !collectionId) {
      return res.status(400).json({
        success: false,
        message: 'Tüm zorunlu alanları doldurmanız gerekiyor'
      });
    }
    
    // Sayısal değerleri kontrol et
    if (isNaN(parseFloat(price)) || isNaN(parseInt(stock)) || 
        isNaN(parseFloat(width)) || isNaN(parseFloat(height))) {
      return res.status(400).json({
        success: false,
        message: 'Sayısal değerler geçerli olmalıdır'
      });
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
      price: parseFloat(price),
      stock: parseInt(stock),
      width: parseFloat(width),
      height: parseFloat(height),
      cut: Boolean(cut),
      productImage: productImageUrl,
      collectionId,
      currency: currency as 'TRY' | 'USD' | 'EUR'
    });
    
    return res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Ürün oluşturulamadı',
      error: error 
    });
  }
};

// Ürün güncelle (resim yükleme ile)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updateData: any = { ...req.body };
    
    // Sayısal değerleri dönüştür
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.width) updateData.width = parseFloat(updateData.width);
    if (updateData.height) updateData.height = parseFloat(updateData.height);
    if (updateData.cut !== undefined) updateData.cut = Boolean(updateData.cut);
    
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