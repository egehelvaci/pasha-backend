import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Prisma } from '../../generated/prisma';
import prisma from '../utils/prisma';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

export const publicSiteSettingsRouter = Router();
export const adminSiteSettingsRouter = Router();
adminSiteSettingsRouter.use(authMiddleware, authorizeRoles('admin'));
// Flags must reflect the latest admin changes on the next request.
for (const router of [publicSiteSettingsRouter, adminSiteSettingsRouter]) {
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
}

const defaultSettings = { hideBalance: false, hideStock: false };
const bannerOrder = [{ sortOrder: 'asc' as const }, { createdAt: 'desc' as const }, { id: 'asc' as const }];
const wrap = (handler: (req: Request, res: Response) => Promise<unknown>) => async (req: Request, res: Response) => {
  try { await handler(req, res); } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Banner bulunamadı' });
      return;
    }
    console.error('Site management request failed:', error);
    res.status(500).json({ success: false, message: 'Site yönetimi işlemi tamamlanamadı' });
  }
};

publicSiteSettingsRouter.get('/', wrap(async (_req, res) => {
  const [settings, banners] = await prisma.$transaction([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.siteBanner.findMany({ where: { isActive: true }, orderBy: bannerOrder,
      select: { id: true, title: true, imageUrl: true, mobileImageUrl: true, linkUrl: true, altText: true, sortOrder: true } })
  ]);
  res.json({ success: true, data: {
    hideBalance: settings?.hideBalance ?? false,
    hideStock: settings?.hideStock ?? false,
    banners
  } });
}));

adminSiteSettingsRouter.get('/', wrap(async (_req, res) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  res.json({ success: true, data: settings || { id: 1, ...defaultSettings, updatedAt: null } });
}));

function objectBody(body: unknown): body is Record<string, unknown> {
  return !!body && typeof body === 'object' && !Array.isArray(body);
}

adminSiteSettingsRouter.patch('/', wrap(async (req, res) => {
  const body = req.body;
  if (!objectBody(body) || !Object.keys(body).length || Object.keys(body).some(key =>
    !['hideBalance', 'hideStock'].includes(key) || typeof body[key] !== 'boolean')) {
    res.status(400).json({ success: false, message: 'hideBalance ve/veya hideStock boolean olarak gönderilmelidir' });
    return;
  }
  const data: { hideBalance?: boolean; hideStock?: boolean } = {};
  if (body.hideBalance !== undefined) data.hideBalance = body.hideBalance as boolean;
  if (body.hideStock !== undefined) data.hideStock = body.hideStock as boolean;
  const settings = await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  res.json({ success: true, data: settings });
}));

function safeUrl(value: unknown, relative = false): boolean {
  if (typeof value !== 'string' || !value || value.length > 2048 || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (relative && value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

function bannerData(body: unknown, create: boolean): Prisma.SiteBannerUpdateInput | null {
  const allowed = ['title', 'imageUrl', 'mobileImageUrl', 'linkUrl', 'altText', 'sortOrder', 'isActive'];
  if (!objectBody(body) || !Object.keys(body).length || Object.keys(body).some(key => !allowed.includes(key))) return null;
  if (create && (body.title === undefined || body.imageUrl === undefined)) return null;
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 200)) return null;
  if (body.imageUrl !== undefined && !safeUrl(body.imageUrl)) return null;
  if (body.mobileImageUrl !== undefined && body.mobileImageUrl !== null && !safeUrl(body.mobileImageUrl)) return null;
  if (body.linkUrl !== undefined && body.linkUrl !== null && !safeUrl(body.linkUrl, true)) return null;
  if (body.altText !== undefined && (typeof body.altText !== 'string' || body.altText.length > 300)) return null;
  if (body.sortOrder !== undefined && (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 2147483647)) return null;
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return null;
  return { ...body, ...(typeof body.title === 'string' ? { title: body.title.trim() } : {}) } as Prisma.SiteBannerUpdateInput;
}

adminSiteSettingsRouter.get('/banners', wrap(async (_req, res) => {
  res.json({ success: true, data: await prisma.siteBanner.findMany({ orderBy: bannerOrder }) });
}));

adminSiteSettingsRouter.post('/banners', wrap(async (req, res) => {
  const data = bannerData(req.body, true);
  if (!data) { res.status(400).json({ success: false, message: 'Geçersiz banner alanları; title ve imageUrl zorunludur' }); return; }
  const banner = await prisma.siteBanner.create({ data: data as Prisma.SiteBannerCreateInput });
  res.status(201).json({ success: true, data: banner });
}));

// Each banner is one slide. Create all selected slides atomically.
adminSiteSettingsRouter.post('/banners/bulk', wrap(async (req, res) => {
  if (!objectBody(req.body) || Object.keys(req.body).some(key => key !== 'banners') ||
      !Array.isArray(req.body.banners) || req.body.banners.length < 1 || req.body.banners.length > 20) {
    res.status(400).json({ success: false, message: 'banners dizisinde 1–20 slayt gönderiniz' }); return;
  }
  const data = req.body.banners.map(item => bannerData(item, true));
  if (data.some(item => !item)) {
    res.status(400).json({ success: false, message: 'Tüm slaytlarda geçerli title ve imageUrl alanları gereklidir' }); return;
  }
  const banners = await prisma.$transaction(data.map(item => prisma.siteBanner.create({ data: item as Prisma.SiteBannerCreateInput })));
  res.status(201).json({ success: true, data: banners });
}));

// Register before /banners/:id to avoid interpreting "reorder" as an ID.
adminSiteSettingsRouter.patch('/banners/reorder', wrap(async (req, res) => {
  const items = req.body?.items;
  if (!objectBody(req.body) || Object.keys(req.body).some(key => key !== 'items') ||
      !Array.isArray(items) || items.length < 1 || items.length > 200 || items.some(item =>
        !objectBody(item) || Object.keys(item).some(key => !['id', 'sortOrder'].includes(key)) ||
        typeof item.id !== 'string' || !item.id.trim() || typeof item.sortOrder !== 'number' ||
        !Number.isInteger(item.sortOrder) || item.sortOrder < 0 || item.sortOrder > 2147483647) ||
      new Set(items.map(item => item.id)).size !== items.length ||
      new Set(items.map(item => item.sortOrder)).size !== items.length) {
    res.status(400).json({ success: false, message: 'items dizisinde benzersiz id ve sortOrder değerleriyle 1–200 slayt gönderiniz' }); return;
  }
  const banners = await prisma.$transaction(items.map(item => prisma.siteBanner.update({
    where: { id: item.id }, data: { sortOrder: item.sortOrder }
  })));
  res.json({ success: true, data: banners.sort((a, b) => a.sortOrder - b.sortOrder) });
}));

adminSiteSettingsRouter.patch('/banners/:id', wrap(async (req, res) => {
  const data = bannerData(req.body, false);
  if (!data) { res.status(400).json({ success: false, message: 'Geçersiz banner alanları' }); return; }
  res.json({ success: true, data: await prisma.siteBanner.update({ where: { id: req.params.id }, data }) });
}));

adminSiteSettingsRouter.delete('/banners/:id', wrap(async (req, res) => {
  await prisma.siteBanner.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Banner silindi' });
}));

function imageExtension(buffer: Buffer): string | undefined {
  if (buffer.length < 12) return undefined;
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return undefined;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 } }).single('image');
adminSiteSettingsRouter.post('/banner-image', (req, res) => {
  upload(req, res, error => {
    if (error) {
      res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: 'Tek bir image dosyası gönderiniz; üst sınır 5 MB' });
      return;
    }
    void wrap(async (req, res) => {
      const buffer = req.file?.buffer;
      const extension = buffer && imageExtension(buffer);
      if (!buffer || !extension) { res.status(400).json({ success: false, message: 'PNG, JPEG veya WebP görseli gönderiniz' }); return; }
      const { UploadService } = await import('../utils/upload-service');
      const imageUrl = await new UploadService().uploadFile(buffer, extension === 'jpg' ? 'image/jpeg' : `image/${extension}`, `banner.${extension}`, 'banners');
      res.status(201).json({ success: true, data: { imageUrl } });
    })(req, res);
  });
});

const uploadMany = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 20, fields: 0 } }).array('images', 20);
adminSiteSettingsRouter.post('/banner-images', (req, res) => {
  uploadMany(req, res, error => {
    if (error) {
      res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: 'images alanında en fazla 20 görsel, görsel başına en fazla 5 MB gönderiniz' }); return;
    }
    void wrap(async (req, res) => {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files?.length || files.some(file => !imageExtension(file.buffer))) {
        res.status(400).json({ success: false, message: 'En az bir PNG, JPEG veya WebP görseli gönderiniz' }); return;
      }
      const { UploadService } = await import('../utils/upload-service');
      const service = new UploadService();
      const images = [];
      // Preserve request order, validate every file before any CDN write, and avoid
      // twenty simultaneous uploads. Database records are created separately.
      for (let index = 0; index < files.length; index++) {
        const extension = imageExtension(files[index].buffer)!;
        const imageUrl = await service.uploadFile(files[index].buffer, extension === 'jpg' ? 'image/jpeg' : `image/${extension}`, `banner.${extension}`, 'banners');
        images.push({ imageUrl, sortOrder: index });
      }
      res.status(201).json({ success: true, data: { images } });
    })(req, res);
  });
});
