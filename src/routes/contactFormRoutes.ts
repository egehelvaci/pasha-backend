import express from 'express';
import { ContactFormController } from '../controllers/contactFormController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();
const contactFormController = new ContactFormController();

// Public routes - TOKEN GEREKTİRMEZ

// İletişim formu gönderme
// POST /api/contact/submit
router.post('/submit', contactFormController.submitContactForm.bind(contactFormController));

// SMTP test endpoint (geliştirme amaçlı - yalnızca admin erişebilir,
// aksi halde herkes e-posta gönderip SMTP bilgisi görebiliyordu)
// GET /api/contact/test-smtp
router.get('/test-smtp', authMiddleware, authorizeRoles('admin'), contactFormController.testSMTP.bind(contactFormController));

export default router;
