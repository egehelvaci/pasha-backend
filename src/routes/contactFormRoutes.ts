import express from 'express';
import { ContactFormController } from '../controllers/contactFormController';

const router = express.Router();
const contactFormController = new ContactFormController();

// Public routes - TOKEN GEREKTİRMEZ

// İletişim formu gönderme
// POST /api/contact/submit
router.post('/submit', contactFormController.submitContactForm.bind(contactFormController));

// SMTP test endpoint (geliştirme amaçlı)
// GET /api/contact/test-smtp
router.get('/test-smtp', contactFormController.testSMTP.bind(contactFormController));

export default router;
