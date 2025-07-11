const axios = require('axios')

// Test Configuration
const BASE_URL = 'http://localhost:3001'
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

async function testMultipleQRCodeScan() {
  try {
    console.log('🚀 Çoklu QR Kod Okutma Testi Başlıyor...\n')

    // 1. Admin Girişi
    console.log('🔐 Admin girişi yapılıyor...')
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS)
    const token = loginResponse.data.data.token
    console.log('✅ Admin girişi başarılı\n')

    // 2. Bekleyen Siparişleri Listele
    console.log('📋 Bekleyen siparişler listeleniyor...')
    const ordersResponse = await axios.get(`${BASE_URL}/api/admin/orders?status=CONFIRMED&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (ordersResponse.data.data.orders.length === 0) {
      console.log('❌ Onaylanmış sipariş bulunamadı. Önce bir sipariş onaylayın.')
      return
    }

    const orderId = ordersResponse.data.data.orders[0].id
    console.log(`✅ Sipariş bulundu: ${orderId}\n`)

    // 3. Sipariş QR Kodlarını Al
    console.log('📱 Sipariş QR kodları getiriliyor...')
    const qrCodesResponse = await axios.get(`${BASE_URL}/api/admin/orders/${orderId}/qrcodes`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const qrCodes = qrCodesResponse.data.data.qrCodes
      .filter(qr => !qr.is_scanned)
      .map(qr => qr.qr_code)

    if (qrCodes.length === 0) {
      console.log('❌ Okunmamış QR kod bulunamadı.')
      return
    }

    console.log(`✅ ${qrCodes.length} adet okunmamış QR kod bulundu:`)
    qrCodes.forEach((qr, index) => {
      console.log(`   ${index + 1}. ${qr.substring(0, 30)}...`)
    })
    console.log()

    // 4. Test 1: Tek QR Kod Okutma (Eski API)
    console.log('🔍 Test 1: Tek QR kod okutma...')
    const singleQRResponse = await axios.post(`${BASE_URL}/api/admin/scan-qr`, {
      qrCode: qrCodes[0]
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`✅ Tek QR kod başarıyla okundu: ${qrCodes[0].substring(0, 30)}...`)
    console.log(`📊 Sipariş Durumu: ${singleQRResponse.data.data.deliveryInfo.scannedCount}/${singleQRResponse.data.data.deliveryInfo.totalCount} okundu\n`)

    // 5. Test 2: Birden Çok QR Kod Okutma (Yeni API)
    if (qrCodes.length > 1) {
      console.log('🔍 Test 2: Birden çok QR kod okutma...')
      const remainingQRCodes = qrCodes.slice(1) // İlk QR kod zaten okundu

      const multipleQRResponse = await axios.post(`${BASE_URL}/api/admin/scan-qr-multiple`, {
        qrCodes: remainingQRCodes
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`✅ ${multipleQRResponse.data.data.summary.successfullyScanned} QR kod başarıyla okundu`)
      console.log(`❌ ${multipleQRResponse.data.data.summary.failed} QR kod başarısız`)
      
      if (multipleQRResponse.data.data.summary.isOrderCompleted) {
        console.log('🎉 SİPARİŞ TAMAMLANDI VE DELIVERED DURUMUNA GEÇTİ!')
      }

      console.log('\n📊 Detaylı Sonuçlar:')
      console.log('✅ Başarılı QR Kodlar:')
      multipleQRResponse.data.data.results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.qrCode.substring(0, 30)}... - ${result.productName}`)
      })

      if (multipleQRResponse.data.data.errors.length > 0) {
        console.log('\n❌ Başarısız QR Kodlar:')
        multipleQRResponse.data.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.qrCode.substring(0, 30)}... - ${error.error}`)
        })
      }

      if (multipleQRResponse.data.data.orderInfo) {
        console.log('\n📦 Sipariş Bilgileri:')
        console.log(`   Durum: ${multipleQRResponse.data.data.orderInfo.status}`)
        console.log(`   Müşteri: ${multipleQRResponse.data.data.orderInfo.customer.name}`)
        console.log(`   Mağaza: ${multipleQRResponse.data.data.orderInfo.customer.store?.kurum_adi || 'N/A'}`)
      }
    }

    // 6. Test 3: Hatalı QR Kodlarla Test
    console.log('\n🔍 Test 3: Hatalı QR kodlarla test...')
    const invalidQRCodes = [
      'INVALID-QR-CODE-1',
      'INVALID-QR-CODE-2',
      qrCodes[0] // Zaten okunmuş QR kod
    ]

    try {
      const errorTestResponse = await axios.post(`${BASE_URL}/api/admin/scan-qr-multiple`, {
        qrCodes: invalidQRCodes
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('❌ Hata Testi Sonuçları:')
      errorTestResponse.data.data.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.qrCode} - ${error.error}`)
      })
    } catch (error) {
      console.log(`❌ Beklenen hata: ${error.response?.data?.message || error.message}`)
    }

    console.log('\n🎯 Tüm testler tamamlandı!')

  } catch (error) {
    console.error('❌ Test hatası:', error.response?.data || error.message)
  }
}

// Test çalıştır
testMultipleQRCodeScan() 