const fs = require('fs');
const path = require('path');

// Dosya ve klasör kopyalama fonksiyonu (cross-platform)
function copyRecursiveSync(src, dest) {
  console.log(`Kopyalanıyor: ${src} -> ${dest}`);
  
  if (!fs.existsSync(src)) {
    console.log(`Kaynak klasör bulunamadı: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    // Hedef klasörü oluştur
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Klasör içindeki tüm dosyaları kopyala
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Dosyayı kopyala
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('🚀 Asset kopyalama işlemi başlıyor...');
  console.log('Platform:', process.platform);
  console.log('Working directory:', process.cwd());
  
  // Dist klasörünü oluştur
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Dist klasörü oluşturuldu');
  }
  
  // Templates klasörünü kopyala
  const templatesSource = path.join(__dirname, '..', 'src', 'templates');
  const templatesTarget = path.join(__dirname, '..', 'dist', 'templates');
  
  console.log('📄 Templates source:', templatesSource);
  console.log('📄 Templates target:', templatesTarget);
  
  if (fs.existsSync(templatesSource)) {
    copyRecursiveSync(templatesSource, templatesTarget);
    console.log('✅ Templates başarıyla kopyalandı');
    
    // Kopyalanan dosyaları listele
    if (fs.existsSync(templatesTarget)) {
      const files = fs.readdirSync(templatesTarget);
      console.log('📋 Kopyalanan template dosyaları:', files);
    }
  } else {
    console.log('❌ Templates klasörü bulunamadı:', templatesSource);
    
    // Src klasörünü kontrol et
    const srcDir = path.join(__dirname, '..', 'src');
    if (fs.existsSync(srcDir)) {
      const srcContents = fs.readdirSync(srcDir);
      console.log('📁 Src klasörü içeriği:', srcContents);
    }
  }
  
  // Assets klasörünü kopyala (opsiyonel)
  const assetsSource = path.join(__dirname, '..', 'src', 'assets');
  const assetsTarget = path.join(__dirname, '..', 'dist', 'assets');
  
  if (fs.existsSync(assetsSource)) {
    copyRecursiveSync(assetsSource, assetsTarget);
    console.log('✅ Assets başarıyla kopyalandı');
  } else {
    console.log('⚠️ Assets klasörü bulunamadı (opsiyonel):', assetsSource);
  }
  
  console.log('🎉 Asset kopyalama işlemi tamamlandı!');
  
} catch (error) {
  console.error('❌ Asset kopyalama hatası:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 