import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

async function fixQRCodeEmployeeIds() {
  try {
    // EmployeeOrderStats'tan hangi çalışanın hangi siparişi teslim ettiğini al
    const employeeOrders = await prisma.employeeOrderStats.findMany({
      select: {
        employeeId: true,
        orderId: true
      }
    })

    console.log(`${employeeOrders.length} tane employee-order ilişkisi bulundu`)

    for (const eo of employeeOrders) {
      // Bu siparişe ait QR kodları güncelle
      const result = await prisma.qRCode.updateMany({
        where: {
          order_id: eo.orderId,
          first_scan_employee_id: 'mobile-app' // Sadece mobile-app olanları güncelle
        },
        data: {
          first_scan_employee_id: eo.employeeId
        }
      })

      if (result.count > 0) {
        console.log(`Order ${eo.orderId} için ${result.count} QR kod güncellendi - Employee: ${eo.employeeId}`)
      }
    }

    console.log('Tüm QR kodlar güncellendi!')
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixQRCodeEmployeeIds()