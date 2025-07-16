/**
 * Sayısal değerler için yardımcı fonksiyonlar
 */

/**
 * Para tutarını 2 ondalık basamakla yuvarlar
 * JavaScript'in floating point precision sorununu çözer
 * @param value Yuvarlanacak değer
 * @returns 2 ondalık basamakla yuvarlanmış değer
 */
export const roundCurrency = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round((num || 0) * 100) / 100;
};

/**
 * Para tutarını formatlar (Türk Lirası)
 * @param value Formatlanacak değer
 * @returns Formatlanmış string (örn: "1.234,56 TL")
 */
export const formatCurrency = (value: number | string): string => {
  const num = roundCurrency(value);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Para tutarını sayı formatında gösterir (Türk Lirası)
 * @param value Formatlanacak değer
 * @returns Formatlanmış string (örn: "1.234,56")
 */
export const formatNumber = (value: number | string): string => {
  const num = roundCurrency(value);
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * İki para tutarını güvenli şekilde toplar
 * @param a İlk değer
 * @param b İkinci değer
 * @returns Toplam değer (2 ondalık basamakla yuvarlanmış)
 */
export const addCurrency = (a: number | string, b: number | string): number => {
  const numA = roundCurrency(a);
  const numB = roundCurrency(b);
  return roundCurrency(numA + numB);
};

/**
 * İki para tutarını güvenli şekilde çıkarır
 * @param a İlk değer (çıkarılan)
 * @param b İkinci değer (çıkaran)
 * @returns Fark değeri (2 ondalık basamakla yuvarlanmış)
 */
export const subtractCurrency = (a: number | string, b: number | string): number => {
  const numA = roundCurrency(a);
  const numB = roundCurrency(b);
  return roundCurrency(numA - numB);
};

/**
 * İki para tutarını güvenli şekilde çarpar
 * @param a İlk değer
 * @param b İkinci değer
 * @returns Çarpım değeri (2 ondalık basamakla yuvarlanmış)
 */
export const multiplyCurrency = (a: number | string, b: number | string): number => {
  const numA = roundCurrency(a);
  const numB = roundCurrency(b);
  return roundCurrency(numA * numB);
}; 