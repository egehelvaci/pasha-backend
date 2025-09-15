import express from 'express';
import { ContactFormController } from '../controllers/contactFormController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();
const contactFormController = new ContactFormController();

// Admin routes - TOKEN GEREKTİRİR (admin, editor)
router.use(authMiddleware);
router.use(authorizeRoles('admin', 'editor'));

// Tüm iletişim formlarını getir
// GET /api/admin/contact-forms
router.get('/', contactFormController.getContactForms.bind(contactFormController));

// İletişim formu durumunu güncelle
// PUT /api/admin/contact-forms/:id
router.put('/:id', contactFormController.updateContactForm.bind(contactFormController));

// İletişim formunu sil
// DELETE /api/admin/contact-forms/:id
router.delete('/:id', contactFormController.deleteContactForm.bind(contactFormController));

export default router;
