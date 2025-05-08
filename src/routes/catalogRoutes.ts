import express from 'express';
import { generateCatalog } from '../controllers/catalogController';

const router = express.Router();

// PDF katalog oluşturma
router.post('/generate', generateCatalog);

export default router; 