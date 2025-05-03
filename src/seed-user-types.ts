import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function seedUserTypes() {
  try {
    // Önce mevcut UserType verilerini temizle
    await prisma.userType.deleteMany({})
    
    // Varsayılan UserType verilerini ekle
    const userTypes = await Promise.all([
      prisma.userType.create({
        data: {
          name: 'admin'
        }
      }),
      prisma.userType.create({
        data: {
          name: 'editor'
        }
      }),
      prisma.userType.create({
        data: {
          name: 'viewer'
        }
      })
    ])
    
    console.log('UserType verileri başarıyla eklendi:')
    console.log(userTypes)
    
    return userTypes
  } catch (error) {
    console.error('UserType verileri eklenirken hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Seed işlemini başlat
seedUserTypes() 