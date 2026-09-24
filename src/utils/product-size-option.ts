// A custom-height rule defines only a width. Zero is a storage sentinel,
// never an order dimension or a maximum height.
export function normalizeSizeOption(input: any, existing?: { width: number; height: number; is_optional_height: boolean | null }) {
  const flag = input.isOptionalHeight ?? existing?.is_optional_height ?? false;
  if (typeof flag !== 'boolean') throw new Error('isOptionalHeight true veya false olmalıdır');
  const width = Number(input.width ?? existing?.width);
  const height = flag ? 0 : Number(input.height ?? (existing?.is_optional_height ? undefined : existing?.height));
  if (!Number.isSafeInteger(width) || width <= 0 || width > 2147483647) {
    throw new Error('Genişlik pozitif tam sayı olmalıdır');
  }
  if (!flag && (!Number.isSafeInteger(height) || height <= 0 || height > 2147483647)) {
    throw new Error('Sabit ebat için yükseklik pozitif tam sayı olmalıdır');
  }
  return { width, height, is_optional_height: flag };
}
