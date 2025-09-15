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
        address 
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

      // Veritabanına kaydet
      const contactForm = await prisma.contactForm.create({
        data: {
          companyName: companyName.trim(),
          authorityName: authorityName.trim(),
          authoritySurname: authoritySurname.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim()
        }
      });

      // E-posta gönder
      try {
        await this.sendConfirmationEmail({
          companyName,
          authorityName: `${authorityName} ${authoritySurname}`,
          email,
          phone,
          address
        });
        console.log('✅ Onay e-postası gönderildi:', email);
      } catch (emailError) {
        console.error('❌ E-posta gönderme hatası:', emailError);
        // E-posta hatası ana işlemi etkilemesin
      }

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
  }) {
    // E-posta konfigürasyonu (environment variables'dan alınmalı)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

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
          </div>
          
          <p>Teşekkür ederiz.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}
