import { Request, Response } from 'express';
import { ProductService } from '../product-service';
import { UploadService } from '../utils/upload-service';
import { notificationService } from '../services/notification-service';
import multer from 'multer';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';

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

// Tüm ürünleri getir - OPTİMİZE EDİLMİŞ
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Kullanıcı ID'sini al (eğer varsa)
    const userId = (req as any).user?.userId;
    
    // Query parametrelerini al
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const collectionId = req.query.collectionId as string;
    const search = req.query.search as string;
    const hasStock = req.query.hasStock ? req.query.hasStock === 'true' : undefined;
    
    const result = await productService.getAllProducts(userId, {
      page,
      limit,
      collectionId,
      search,
      hasStock
    });
    
    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination
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

// Koleksiyona göre ürünleri getir - OPTİMİZE EDİLMİŞ
export const getProductsByCollection = async (req: Request, res: Response) => {
  try {
    const collectionId = req.params.collectionId;
    
    // Kullanıcı ID'sini al (eğer varsa)
    const userId = (req as any).user?.userId;
    
    // Query parametrelerini al
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const hasStock = req.query.hasStock ? req.query.hasStock === 'true' : undefined;
    
    const result = await productService.getAllProducts(userId, {
      page,
      limit,
      collectionId,
      search,
      hasStock
    });
    
    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination
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
    
    // ID'leri number olarak formatla
    const formattedRules = rules.map(rule => ({
      ...rule,
      id: Number(rule.id)
    }));
    
    return res.status(200).json({
      success: true,
      data: formattedRules
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
      // Disk storage kullanıldığı için dosyayı okuyup buffer'a çevir
      const fileBuffer = fs.readFileSync(req.file.path);
      
      productImageUrl = await uploadService.uploadFile(
        fileBuffer,
        req.file.mimetype,
        req.file.originalname
      );
      
      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);
    }
    
    // Ürünü oluştur
    const product = await productService.createProduct({
      name,
      description,
      productImage: productImageUrl,
      collectionId,
      rule_id: ruleId
    });

    // Yeni ürün eklendi bildirimi gönder (tüm kullanıcılara)
    try {
      await notificationService.notifyNewStock(name, 1); // Varsayılan 1 adet
      console.log('✅ Yeni ürün bildirimi gönderildi');
    } catch (notificationError) {
      console.error('❌ Bildirim gönderme hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }
    
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
      // Disk storage kullanıldığı için dosyayı okuyup buffer'a çevir
      const fileBuffer = fs.readFileSync(req.file.path);
      
      productImageUrl = await uploadService.uploadFile(
        fileBuffer,
        req.file.mimetype,
        req.file.originalname
      );
      
      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);
    }
    
    const product = await productService.createProduct({
      name,
      description,
      productImage: productImageUrl,
      collectionId
    });

    // Yeni ürün eklendi bildirimi gönder (tüm kullanıcılara)
    try {
      await notificationService.notifyNewStock(name, 1); // Varsayılan 1 adet
      console.log('✅ Yeni ürün bildirimi gönderildi');
    } catch (notificationError) {
      console.error('❌ Bildirim gönderme hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }
    
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
      // Disk storage kullanıldığı için dosyayı okuyup buffer'a çevir
      const fileBuffer = fs.readFileSync(req.file.path);
      
      updateData.productImage = await uploadService.uploadFile(
        fileBuffer,
        req.file.mimetype,
        req.file.originalname
      );
      
      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);
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
    console.log(`Ürün silme işlemi başlatılıyor - Product ID: ${productId}`);
    
    await productService.deleteProduct(productId);
    
    console.log(`Ürün başarıyla silindi - Product ID: ${productId}`);
    return res.status(200).json({
      success: true,
      message: 'Ürün ve tüm ilişkili veriler (sepetler, siparişler, QR kodlar) başarıyla silindi'
    });
  } catch (error: any) {
    console.error(`Ürün silme hatası - Product ID: ${req.params.id}`, error);
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
    if (!width || height === undefined || height === null || height === '' || quantity === undefined || quantity === null || isNaN(parseInt(quantity))) {
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

    // Yeni stok eklendi bildirimi gönder (tüm kullanıcılara)
    try {
      if (product?.name) {
        await notificationService.notifyNewStock(product.name, parseInt(quantity));
        console.log('✅ Adet bazlı stok ekleme bildirimi gönderildi');
      }
    } catch (notificationError) {
      console.error('❌ Adet bazlı stok ekleme bildirim hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }
    
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

// M² bazlı stok güncelle
export const updateProductStockAreaM2 = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { width, height, areaM2 } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!width || height === undefined || height === null || height === '' || areaM2 === undefined || areaM2 === null || isNaN(parseFloat(areaM2))) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir genişlik, yükseklik ve m² değeri gereklidir'
      });
    }
    
    // Genişlik değeri kontrolü
    const widthValue = parseInt(width);
    if (isNaN(widthValue) || widthValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Genişlik değeri pozitif bir sayı olmalıdır'
      });
    }
    
    // Yükseklik değeri kontrolü
    const heightValue = parseInt(height);
    if (isNaN(heightValue) || heightValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Yükseklik değeri pozitif bir sayı olmalıdır'
      });
    }

    // M² değeri kontrolü
    const areaValue = parseFloat(areaM2);
    if (isNaN(areaValue) || areaValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'M² değeri 0 veya pozitif bir sayı olmalıdır'
      });
    }
    
    // M² bazlı stok güncelleme işlemini gerçekleştir
    const product = await productService.updateStockAreaM2(id, {
      width: widthValue,
      height: heightValue,
      areaM2: areaValue
    });

    // Yeni stok eklendi bildirimi gönder (tüm kullanıcılara)
    try {
      if (product?.name) {
        const equivalentPieces = Math.floor(areaValue / ((widthValue * heightValue) / 10000));
        await notificationService.notifyNewStock(product.name, equivalentPieces);
        console.log('✅ M² bazlı stok ekleme bildirimi gönderildi');
      }
    } catch (notificationError) {
      console.error('❌ M² bazlı stok ekleme bildirim hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }
    
    return res.status(200).json({
      success: true,
      data: product,
      message: `${areaValue}m² stok eklendi (${Math.floor(areaValue / ((widthValue * heightValue) / 10000))} adet halıya eşdeğer)`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'M² stok güncellenemedi'
    });
  }
};

// Hibrit stok güncelle (hem adet hem m²)
export const updateProductStockHybrid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { width, height, quantity, areaM2, updateMode } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!width || height === undefined || height === null || height === '' || !updateMode) {
      return res.status(400).json({
        success: false,
        message: 'Genişlik, yükseklik ve güncelleme modu gereklidir'
      });
    }

    // updateMode kontrolü
    if (!['quantity', 'area', 'both'].includes(updateMode)) {
      return res.status(400).json({
        success: false,
        message: 'Güncelleme modu quantity, area veya both olmalıdır'
      });
    }
    
    // Genişlik değeri kontrolü
    const widthValue = parseInt(width);
    if (isNaN(widthValue) || widthValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Genişlik değeri pozitif bir sayı olmalıdır'
      });
    }
    
    // Yükseklik değeri kontrolü
    const heightValue = parseInt(height);
    if (isNaN(heightValue) || heightValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Yükseklik değeri pozitif bir sayı olmalıdır'
      });
    }

    // Mod bazlı değer kontrolü
    let quantityValue = undefined;
    let areaValue = undefined;

    if (updateMode === 'quantity' || updateMode === 'both') {
      if (quantity === undefined || quantity === null || isNaN(parseInt(quantity))) {
        return res.status(400).json({
          success: false,
          message: 'Adet değeri gereklidir'
        });
      }
      quantityValue = parseInt(quantity);
      if (quantityValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'Adet değeri 0 veya pozitif olmalıdır'
        });
      }
    }

    if (updateMode === 'area' || updateMode === 'both') {
      if (areaM2 === undefined || areaM2 === null || isNaN(parseFloat(areaM2))) {
        return res.status(400).json({
          success: false,
          message: 'M² değeri gereklidir'
        });
      }
      areaValue = parseFloat(areaM2);
      if (areaValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'M² değeri 0 veya pozitif olmalıdır'
        });
      }
    }
    
    // Hibrit stok güncelleme işlemini gerçekleştir
    const result = await productService.updateStockHybrid(id, {
      width: widthValue,
      height: heightValue,
      quantity: quantityValue,
      areaM2: areaValue,
      updateMode: updateMode as 'quantity' | 'area' | 'both'
    });

    // Hata durumunu kontrol et
    if ('error' in result && result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        suggestions: result.suggestions
      });
    }

    // Yeni stok eklendi bildirimi gönder (tüm kullanıcılara)
    try {
      let notificationQuantity = 0;
      if (updateMode === 'quantity' || updateMode === 'both') {
        notificationQuantity += quantityValue || 0;
      }
      if (updateMode === 'area' || updateMode === 'both') {
        const equivalentPieces = Math.floor((areaValue || 0) / ((widthValue * heightValue) / 10000));
        notificationQuantity += equivalentPieces;
      }
      
      if (notificationQuantity > 0 && 'name' in result && result.name) {
        await notificationService.notifyNewStock(result.name, notificationQuantity);
        console.log('✅ Hibrit stok ekleme bildirimi gönderildi');
      }
    } catch (notificationError) {
      console.error('❌ Hibrit stok ekleme bildirim hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Hibrit stok güncellendi'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Hibrit stok güncellenemedi'
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

// Ürünün varyasyonlarını yeniden oluştur
export const regenerateProductVariations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await productService.regenerateVariationsForProduct(id);
    
    return res.status(200).json({
      success: true,
      message: 'Ürün varyasyonları başarıyla yeniden oluşturuldu'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ürün varyasyonları yeniden oluşturulamadı'
    });
  }
};

// Belirli bir kurala sahip tüm ürünlerin varyasyonlarını yeniden oluştur
export const regenerateVariationsForRule = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    
    if (!ruleId || isNaN(parseInt(ruleId))) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir kural ID gönderilmelidir'
      });
    }
    
    const result = await productService.regenerateVariationsForRule(parseInt(ruleId));
    
    return res.status(200).json({
      success: true,
      message: `${result.processedProducts} ürünün varyasyonları başarıyla yeniden oluşturuldu`,
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kural bazlı varyasyon güncelleme başarısız'
    });
  }
};

// Tüm ürünlerin varyasyonlarını yeniden oluştur
export const regenerateAllVariations = async (req: Request, res: Response) => {
  try {
    const result = await productService.regenerateAllVariations();
    
    return res.status(200).json({
      success: true,
      message: `${result.successCount}/${result.totalProducts} ürünün varyasyonları başarıyla yeniden oluşturuldu`,
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Tüm varyasyonları güncelleme başarısız'
    });
  }
}; 