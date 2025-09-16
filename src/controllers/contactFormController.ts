import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import nodemailer from 'nodemailer';

export class ContactFormController {

  /**
   * İletişim formu gönderme (Public - Token gerektirmez)
   * POST /api/contact/submit
   */
  async submitContactForm(req: Request, res: Response) {
    try {
      const { 
        companyName, 
        authorityName, 
        authoritySurname, 
        email, 
        phone, 
        address,
        notes 
      } = req.body;

      // Zorunlu alanları kontrol et
      if (!companyName || !authorityName || !authoritySurname || !email || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: 'Tüm alanlar zorunludur (Firma Adı, Yetkili Ad-Soyad, E-posta, Telefon, Adres)'
        });
      }

      // E-posta formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir e-posta adresi giriniz'
        });
      }

      // Telefon formatını kontrol et (basit kontrol)
      const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir telefon numarası giriniz'
        });
      }

      console.log('📝 Yeni iletişim formu alındı:', {
        companyName,
        authorityName: `${authorityName} ${authoritySurname}`,
        email,
        phone
      });

      // Veritabanına kaydet (timeout koruması ile)
      const contactForm = await Promise.race([
        prisma.contactForm.create({
          data: {
            companyName: companyName.trim(),
            authorityName: authorityName.trim(),
            authoritySurname: authoritySurname.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
            notes: notes ? notes.trim() : null
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Veritabanı işlemi timeout')), 10000)
        )
      ]) as any;

      // E-posta gönder (asenkron - response'u bekletmesin)
      this.sendConfirmationEmail({
        companyName,
        authorityName: `${authorityName} ${authoritySurname}`,
        email,
        phone,
        address,
        notes: notes || ''
      }).then(() => {
        console.log('✅ Onay e-postası gönderildi:', email);
      }).catch((emailError) => {
        console.error('❌ E-posta gönderme hatası:', emailError);
        // E-posta hatası ana işlemi etkilemesin
      });

      return res.status(201).json({
        success: true,
        message: 'İletişim talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.',
        data: {
          id: contactForm.id,
          submittedAt: contactForm.createdAt
        }
      });

    } catch (error) {
      console.error('❌ İletişim formu gönderme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'İletişim formu gönderilirken bir hata oluştu'
      });
    }
  }

  /**
   * Admin: Tüm iletişim formlarını getir
   * GET /api/admin/contact-forms
   */
  async getContactForms(req: Request, res: Response) {
    try {
      const { 
        page = '1', 
        limit = '20', 
        isRead, 
        isContacted,
        search 
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Filtreleme koşulları
      const where: any = {};

      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      if (isContacted !== undefined) {
        where.isContacted = isContacted === 'true';
      }

      if (search && search.toString().trim()) {
        const searchTerm = search.toString().trim();
        where.OR = [
          { companyName: { contains: searchTerm, mode: 'insensitive' } },
          { authorityName: { contains: searchTerm, mode: 'insensitive' } },
          { authoritySurname: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } }
        ];
      }

      // Toplam sayı ve veriler
      const [total, contactForms] = await Promise.all([
        prisma.contactForm.count({ where }),
        prisma.contactForm.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          select: {
            id: true,
            companyName: true,
            authorityName: true,
            authoritySurname: true,
            email: true,
            phone: true,
            address: true,
            isRead: true,
            isContacted: true,
            notes: true,
            createdAt: true,
            updatedAt: true
          }
        })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      console.log(`📋 Admin iletişim formları listelendi: ${contactForms.length}/${total}`);

      return res.status(200).json({
        success: true,
        message: 'İletişim formları başarıyla getirildi',
        data: {
          contactForms: contactForms.map(form => ({
            ...form,
            authorityFullName: `${form.authorityName} ${form.authoritySurname}`
          })),
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('❌ İletişim formları getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'İletişim formları getirilirken bir hata oluştu'
      });
    }
  }

  /**
   * Admin: İletişim formu durumunu güncelle
   * PUT /api/admin/contact-forms/:id
   */
  async updateContactForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isRead, isContacted, notes } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir form ID gerekli'
        });
      }

      const updateData: any = {};
      
      if (isRead !== undefined) updateData.isRead = Boolean(isRead);
      if (isContacted !== undefined) updateData.isContacted = Boolean(isContacted);
      if (notes !== undefined) updateData.notes = notes;

      const updatedForm = await prisma.contactForm.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      console.log(`✅ İletişim formu güncellendi: ${id}`, updateData);

      return res.status(200).json({
        success: true,
        message: 'İletişim formu başarıyla güncellendi',
        data: updatedForm
      });

    } catch (error: any) {
      console.error('❌ İletişim formu güncelleme hatası:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'İletişim formu bulunamadı'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'İletişim formu güncellenirken bir hata oluştu'
      });
    }
  }

  /**
   * Admin: İletişim formunu sil
   * DELETE /api/admin/contact-forms/:id
   */
  async deleteContactForm(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir form ID gerekli'
        });
      }

      // Önce form var mı kontrol et
      const existingForm = await prisma.contactForm.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingForm) {
        return res.status(404).json({
          success: false,
          message: 'İletişim formu bulunamadı'
        });
      }

      // Formu sil
      await prisma.contactForm.delete({
        where: { id: parseInt(id) }
      });

      console.log(`🗑️ İletişim formu silindi: ${id} - ${existingForm.companyName}`);

      return res.status(200).json({
        success: true,
        message: 'İletişim formu başarıyla silindi',
        data: {
          deletedForm: {
            id: existingForm.id,
            companyName: existingForm.companyName,
            authorityName: `${existingForm.authorityName} ${existingForm.authoritySurname}`,
            email: existingForm.email
          }
        }
      });

    } catch (error: any) {
      console.error('❌ İletişim formu silme hatası:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'İletişim formu bulunamadı'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'İletişim formu silinirken bir hata oluştu'
      });
    }
  }

  /**
   * E-posta gönderme fonksiyonu
   */
  private async sendConfirmationEmail(formData: {
    companyName: string;
    authorityName: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  }) {
    // SMTP ayarları kontrol et
    console.log('🔍 SMTP Ayarları Kontrolü:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'Mevcut' : 'YOK');
    console.log('SMTP_PORT:', process.env.SMTP_PORT ? 'Mevcut' : 'YOK');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'Mevcut' : 'YOK');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? `Mevcut (${process.env.SMTP_PASS.length} karakter)` : 'YOK');
    console.log('SMTP_FROM:', process.env.SMTP_FROM ? 'Mevcut' : 'YOK');
    
    // Gmail App Password kontrolü ve temizleme
    let cleanedPassword = process.env.SMTP_PASS;
    if (cleanedPassword) {
      // Boşlukları temizle
      cleanedPassword = cleanedPassword.replace(/\s/g, '');
      console.log('🔧 SMTP_PASS boşluklardan temizlendi:', cleanedPassword.length, 'karakter');
      
      if (cleanedPassword.length !== 16) {
        console.log('⚠️ UYARI: Gmail App Password genellikle 16 karakter olmalıdır!');
        console.log('⚠️ Temizlenmiş SMTP_PASS uzunluğu:', cleanedPassword.length);
      }
    }
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ SMTP_USER veya SMTP_PASS bulunamadı, e-posta gönderilmedi');
      return;
    }
    
    // E-posta gönderimi devre dışı mı?
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('📧 E-posta gönderimi devre dışı (DISABLE_EMAIL=true)');
      return;
    }

    // E-posta konfigürasyonu (Railway için optimize edilmiş)
    console.log('🔧 SMTP transporter oluşturuluyor...');
    
    // SMTP Provider seçimi - Railway için optimize edilmiş
    let smtpConfig;
    
    if (process.env.SMTP_SERVICE === 'sendgrid') {
      // SendGrid SMTP (Önerilen)
      smtpConfig = {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      };
    } else if (process.env.SMTP_SERVICE === 'mailgun') {
      // Mailgun SMTP
      smtpConfig = {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_SMTP_USER,
          pass: process.env.MAILGUN_SMTP_PASS
        }
      };
    } else {
      // Gmail (Fallback - timeout riski var)
      smtpConfig = {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: cleanedPassword
        }
      };
    }
    
    const transporter = nodemailer.createTransport({
      ...smtpConfig,
      // TLS ayarları
      tls: {
        rejectUnauthorized: false
      }
    } as any);

    // SMTP verify kaldırıldı - Railway'de timeout sorunu yaşatıyor
    // Doğrudan e-posta gönderme işlemi denenir, hata olursa yakalanır
    console.log('🔍 Gmail SMTP transporter hazır, verify atlandı');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: formData.email,
      subject: 'İletişim Talebiniz Alındı - Pasha Home',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">İletişim Talebiniz Alındı</h2>
          
          <p>Sayın ${formData.authorityName},</p>
          
          <p>İletişim talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Gönderilen Bilgiler:</h3>
            <p><strong>Firma Adı:</strong> ${formData.companyName}</p>
            <p><strong>Yetkili:</strong> ${formData.authorityName}</p>
            <p><strong>E-posta:</strong> ${formData.email}</p>
            <p><strong>Telefon:</strong> ${formData.phone}</p>
            <p><strong>Adres:</strong> ${formData.address}</p>
            ${formData.notes ? `<p><strong>Notlar:</strong> ${formData.notes}</p>` : ''}
          </div>
          
          <p>Teşekkür ederiz.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
          </div>
        </div>
      `
    };

    console.log('📧 E-posta gönderiliyor:', formData.email);
    
    // Timeout ile e-posta gönder (maksimum 45 saniye - Gmail için)
    try {
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('E-posta gönderme timeout')), 45000)
        )
      ]);
      console.log('✅ E-posta başarıyla gönderildi:', result);
    } catch (error) {
      console.error('❌ E-posta gönderme hatası detayı:', error);
      throw error; // Hatayı üst seviyeye ilet
    }
  }

  /**
   * SMTP bağlantısını test et (geliştirme amaçlı)
   * GET /api/contact/test-smtp
   */
  async testSMTP(req: Request, res: Response) {
    try {
      console.log('🔧 SMTP Test başlatılıyor...');
      
      // SMTP ayarları kontrol et
      console.log('🔍 SMTP Ayarları:');
      console.log('SMTP_HOST:', process.env.SMTP_HOST || 'YOK');
      console.log('SMTP_PORT:', process.env.SMTP_PORT || 'YOK');
      console.log('SMTP_USER:', process.env.SMTP_USER || 'YOK');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Mevcut (gizli)' : 'YOK');
      
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(400).json({
          success: false,
          message: 'SMTP ayarları eksik',
          details: {
            SMTP_USER: process.env.SMTP_USER ? 'Mevcut' : 'YOK',
            SMTP_PASS: process.env.SMTP_PASS ? 'Mevcut' : 'YOK'
          }
        });
      }

      // Test e-postası gönder
      await this.sendConfirmationEmail({
        companyName: 'SMTP Test Firması',
        authorityName: 'Test Kullanıcı',
        email: process.env.SMTP_USER, // Kendi adresine gönder
        phone: '05551234567',
        address: 'Test Adresi',
        notes: 'Bu bir SMTP test mesajıdır.'
      });

      return res.status(200).json({
        success: true,
        message: 'SMTP test e-postası başarıyla gönderildi',
        testEmail: process.env.SMTP_USER
      });

    } catch (error: any) {
      console.error('❌ SMTP Test hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'SMTP test başarısız',
        error: error.message,
        details: error
      });
    }
  }
}
