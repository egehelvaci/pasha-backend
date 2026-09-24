import prisma from '../utils/prisma';

function legacyAreaM2(product: any, variation: any): number {
  const isOptionalHeight = Boolean(
    product.productrules?.productsizeoptions?.some((option: any) =>
      option.width === variation.width && option.is_optional_height
    )
  );
  if (isOptionalHeight) return Number(variation.stock_area_m2 || 0);

  const pieceAreaM2 = (Number(variation.width) * Number(variation.height)) / 10000;
  return Math.max(
    Number(variation.stock_area_m2 || 0),
    Number(variation.stock_quantity || 0) * pieceAreaM2
  );
}

async function main() {
  const products = await prisma.product.findMany({
    include: {
      productrules: { include: { productsizeoptions: true } },
      productvariations: true,
      productStock: true
    },
    orderBy: { name: 'asc' }
  });

  let legacyTotal = 0;
  let commonTotal = 0;
  let optedIn = 0;

  const rows = products.map(product => {
    // Cut/fringe variations with the same physical size share one stock pool.
    // Use the largest value for a size so duplicated compatibility rows do not
    // inflate the migration total.
    const areaBySize = new Map<string, number>();
    for (const variation of product.productvariations) {
      const key = `${variation.width}x${variation.height}`;
      const area = legacyAreaM2(product, variation);
      areaBySize.set(key, Math.max(areaBySize.get(key) || 0, area));
    }
    const legacyArea = [...areaBySize.values()].reduce((sum, area) => sum + area, 0);
    const commonArea = product.productStock ? Number(product.productStock.availableAreaM2 || 0) : null;
    legacyTotal += legacyArea;
    if (commonArea !== null) {
      optedIn += 1;
      commonTotal += commonArea;
    }

    return {
      productId: product.productId,
      name: product.name,
      commonStockEnabled: commonArea !== null,
      legacyAreaM2: Number(legacyArea.toFixed(4)),
      commonAvailableAreaM2: commonArea === null ? null : Number(commonArea.toFixed(4)),
      variationCount: product.productvariations.length
    };
  });

  console.log(JSON.stringify({
    readOnly: true,
    productCount: products.length,
    optedInProductCount: optedIn,
    legacyTotalAreaM2: Number(legacyTotal.toFixed(4)),
    commonTotalAreaM2: Number(commonTotal.toFixed(4)),
    products: rows
  }, null, 2));
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
