import prisma from './utils/prisma';

// Repair missing rows without overwriting prices already entered by an admin.
export async function includeMissingPurchaseCollections<T extends { id: string; details: { collection_id: string }[] }>(lists: T[]) {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    select: { collectionId: true }
  });
  return Promise.all(lists.map(async list => {
    const existing = new Set(list.details.map(detail => detail.collection_id));
    const missing = collections.filter(collection => !existing.has(collection.collectionId));
    if (!missing.length) return list;
    await prisma.purchasePriceListDetail.createMany({
      data: missing.map(collection => ({
        purchase_price_list_id: list.id,
        collection_id: collection.collectionId,
        price_per_square_meter: 1
      })),
      skipDuplicates: true
    });
    const details = await prisma.purchasePriceListDetail.findMany({
      where: { purchase_price_list_id: list.id },
      include: { collection: { select: { collectionId: true, name: true, code: true } } },
      orderBy: { collection: { name: 'asc' } }
    });
    return { ...list, details };
  }));
}

export class MissingPurchasePriceError extends Error {
  constructor(collectionName: string) {
    super(`${collectionName} koleksiyonu için geçerli alış fiyatı tanımlanmamış. Alış fiyat listesinden USD/m² fiyatını giriniz.`);
    this.name = 'MissingPurchasePriceError';
  }
}
