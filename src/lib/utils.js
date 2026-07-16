const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function numToWords(n) {
  n = Math.round(n);
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + numToWords(-n);

  let result = '';

  if (n >= 10000000) {
    result += numToWords(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    result += numToWords(Math.floor(n / 100000)) + ' Lakh ';
    n %= 100000;
  }
  if (n >= 1000) {
    result += numToWords(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
    n = 0;
  } else if (n > 0) {
    result += ones[n] + ' ';
  }

  return result.trim();
}

export function amountInWords(total) {
  if (!total || total === 0) return 'Zero Rupees Only';
  const rupees = Math.floor(total);
  const paisa = Math.round((total - rupees) * 100);
  let words = numToWords(rupees) + ' Rupee' + (rupees !== 1 ? 's' : '');
  if (paisa > 0) {
    words += ' and ' + numToWords(paisa) + ' Paisa';
  }
  return words + ' Only';
}

export function fmt(n) {
  return 'Rs ' + Number(n).toLocaleString('en-NP');
}

export function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
