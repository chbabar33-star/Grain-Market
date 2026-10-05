/**
 * Urdu and English Currency & Number to Words Formatter
 * Strict Mandi ERP Rules: PKR only, South Asian numbering (Lakh / Crore), Urdu Nastaleeq translation
 */

const ONES_EN = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS_EN = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const URDU_NUMBERS: Record<number, string> = {
  0: 'صفر', 1: 'ایک', 2: 'دو', 3: 'تین', 4: 'چار', 5: 'پانچ', 6: 'چھ', 7: 'سات', 8: 'آٹھ', 9: 'نو',
  10: 'دس', 11: 'گیارہ', 12: 'بارہ', 13: 'تیرہ', 14: 'چودہ', 15: 'پندرہ', 16: 'سولہ', 17: 'سترہ', 18: 'اٹھارہ', 19: 'انیس',
  20: 'بیس', 21: 'اکیس', 22: 'بائیس', 23: 'تیئیس', 24: 'چوبیس', 25: 'پچیس', 26: 'چھبیس', 27: 'ستائیس', 28: 'اٹَھائیس', 29: 'انتیس',
  30: 'تیس', 31: 'اکتیس', 32: 'بتیس', 33: 'تینتیس', 34: 'چونتیس', 35: 'پینتیس', 36: 'چھتیس', 37: 'سینتیس', 38: 'اڑتیس', 39: 'انتالیس',
  40: 'چالیس', 41: 'اکتالیس', 42: 'بیالیس', 43: 'تینتالیس', 44: 'چوالیس', 45: 'پینتالیس', 46: 'چھیا لیس', 47: 'سینتالیس', 48: 'اڑتالیس', 49: 'انچاس',
  50: 'پچاس', 51: 'اکیاون', 52: 'باون', 53: 'ترپن', 54: 'چون', 55: 'پچپن', 56: 'چھپن', 57: 'ستاون', 58: 'اٹھاون', 59: 'انسٹھ',
  60: 'ساٹھ', 61: 'اکسٹھ', 62: 'باسٹھ', 63: 'تریسٹھ', 64: 'چونسٹھ', 65: 'پینسٹھ', 66: 'چھیاسٹھ', 67: 'سڑسٹھ', 68: 'اڑسٹھ', 69: 'انہتر',
  70: 'ستر', 71: 'اکہتر', 72: 'بہتر', 73: 'تہتر', 74: 'چوہتر', 75: 'پچہتر', 76: 'چھہتر', 77: 'ستتر', 78: 'اٹھہتر', 79: 'اناسی',
  80: 'اسی', 81: 'اکیاسی', 82: 'بیاسی', 83: 'تراسی', 84: 'چوراسی', 85: 'پچاسی', 86: 'چھیاسی', 87: 'ستاسی', 88: 'اٹھاسی', 89: 'نواسی',
  90: 'نوے', 91: 'اکیانوے', 92: 'بانوے', 93: 'ترانوے', 94: 'چورانوے', 95: 'پچانوے', 96: 'چھیانوے', 97: 'ستانوے', 98: 'اٹھانوے', 99: 'ننانوے'
};

function convertLessThanOneThousandEn(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ONES_EN[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS_EN[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ONES_EN[n] + ' ';
  }
  return str.trim();
}

/**
 * Converts PKR integer amount into South Asian English words (Crore, Lac, Thousand, Hundred)
 */
export function numberToWordsEnglish(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return 'Zero Rupees Only';

  let remaining = integerPart;
  let words = '';

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lac = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  if (crore > 0) {
    words += convertLessThanOneThousandEn(crore) + ' Crore ';
  }
  if (lac > 0) {
    words += convertLessThanOneThousandEn(lac) + ' Lac ';
  }
  if (thousand > 0) {
    words += convertLessThanOneThousandEn(thousand) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertLessThanOneThousandEn(remaining) + ' ';
  }

  return `${words.trim()} Rupees Only`;
}

function convertLessThanOneThousandUrdu(n: number): string {
  let str = '';
  if (n >= 100) {
    const h = Math.floor(n / 100);
    str += (URDU_NUMBERS[h] || h.toString()) + ' سو ';
    n %= 100;
  }
  if (n > 0) {
    str += (URDU_NUMBERS[n] || n.toString()) + ' ';
  }
  return str.trim();
}

/**
 * Converts PKR integer amount into South Asian Urdu words (کروڑ، لاکھ، ہزار، سو)
 */
export function numberToWordsUrdu(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return 'صفر روپے';

  let remaining = integerPart;
  const parts: string[] = [];

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lac = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  if (crore > 0) {
    parts.push(convertLessThanOneThousandUrdu(crore) + ' کروڑ');
  }
  if (lac > 0) {
    parts.push(convertLessThanOneThousandUrdu(lac) + ' لاکھ');
  }
  if (thousand > 0) {
    parts.push(convertLessThanOneThousandUrdu(thousand) + ' ہزار');
  }
  if (remaining > 0) {
    parts.push(convertLessThanOneThousandUrdu(remaining));
  }

  return parts.join(' ') + ' روپے فقط';
}

/**
 * Format Currency in standard PKR format: Rs. 50,000.00
 */
export function formatPKR(amount: number | undefined | null, symbolPosition: 'before' | 'after' = 'before'): string {
  const val = Number(amount) || 0;
  const formatted = val.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (symbolPosition === 'after') {
    return `${formatted} Rs.`;
  }
  return `Rs. ${formatted}`;
}

export function formatUrduPKR(amount: number | undefined | null): string {
  const val = Number(amount) || 0;
  const formatted = val.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatted} روپے`;
}

/**
 * Weight in KG and Maunds (1 Maund / من = 40 KG)
 */
export function formatWeight(kg: number | undefined | null): string {
  const val = Number(kg) || 0;
  const maunds = (val / 40).toFixed(2);
  return `${val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG (${maunds} من)`;
}

export function formatBags(count: number | undefined | null): string {
  const val = Number(count) || 0;
  return `${val.toLocaleString('en-PK')} بوریاں`;
}
