import { Province } from '@/types';

export const PROVINCES: Province[] = [
  { code: 'LC', name: 'Lào Cai', lat: 22.48, lng: 103.97, region: 'north' },
  { code: 'HG', name: 'Hà Giang', lat: 22.82, lng: 104.98, region: 'north' },
  { code: 'CB', name: 'Cao Bằng', lat: 22.67, lng: 106.25, region: 'north' },
  { code: 'LS', name: 'Lạng Sơn', lat: 21.85, lng: 106.76, region: 'north' },
  { code: 'TQ', name: 'Tuyên Quang', lat: 21.82, lng: 105.22, region: 'north' },
  { code: 'BK', name: 'Bắc Kạn', lat: 22.15, lng: 105.83, region: 'north' },
  { code: 'TN', name: 'Thái Nguyên', lat: 21.59, lng: 105.85, region: 'north' },
  { code: 'QN', name: 'Quảng Ninh', lat: 21.01, lng: 107.29, region: 'north' },
  { code: 'YB', name: 'Yên Bái', lat: 21.72, lng: 104.90, region: 'north' },
  { code: 'PT', name: 'Phú Thọ', lat: 21.40, lng: 105.23, region: 'north' },
  { code: 'VP', name: 'Vĩnh Phúc', lat: 21.36, lng: 105.60, region: 'north' },
  { code: 'BN', name: 'Bắc Ninh', lat: 21.12, lng: 106.07, region: 'north' },
  { code: 'BG', name: 'Bắc Giang', lat: 21.28, lng: 106.20, region: 'north' },
  { code: 'HN', name: 'Hà Nội', lat: 21.03, lng: 105.85, region: 'north' },
  { code: 'HY', name: 'Hưng Yên', lat: 20.85, lng: 106.02, region: 'north' },
  { code: 'HD', name: 'Hải Dương', lat: 20.94, lng: 106.33, region: 'north' },
  { code: 'HP', name: 'Hải Phòng', lat: 20.86, lng: 106.68, region: 'north' },
  { code: 'TB', name: 'Thái Bình', lat: 20.45, lng: 106.34, region: 'north' },
  { code: 'ND', name: 'Nam Định', lat: 20.42, lng: 106.17, region: 'north' },
  { code: 'HNam', name: 'Hà Nam', lat: 20.54, lng: 105.92, region: 'north' },
  { code: 'NB', name: 'Ninh Bình', lat: 20.25, lng: 105.97, region: 'north' },
  { code: 'SL', name: 'Sơn La', lat: 21.33, lng: 103.91, region: 'north' },
  { code: 'DB', name: 'Điện Biên', lat: 21.39, lng: 103.01, region: 'north' },
  { code: 'LCh', name: 'Lai Châu', lat: 22.39, lng: 103.46, region: 'north' },
  { code: 'HB', name: 'Hòa Bình', lat: 20.68, lng: 105.34, region: 'north' },
  { code: 'TH', name: 'Thanh Hóa', lat: 19.81, lng: 105.78, region: 'central' },
  { code: 'NA', name: 'Nghệ An', lat: 19.23, lng: 104.92, region: 'central' },
  { code: 'HT', name: 'Hà Tĩnh', lat: 18.35, lng: 105.89, region: 'central' },
  { code: 'QB', name: 'Quảng Bình', lat: 17.47, lng: 106.62, region: 'central' },
  { code: 'QT', name: 'Quảng Trị', lat: 16.75, lng: 107.19, region: 'central' },
  { code: 'TTH', name: 'Thừa Thiên Huế', lat: 16.46, lng: 107.60, region: 'central' },
  { code: 'DN', name: 'Đà Nẵng', lat: 16.05, lng: 108.20, region: 'central' },
  { code: 'QNam', name: 'Quảng Nam', lat: 15.54, lng: 108.02, region: 'central' },
  { code: 'QNg', name: 'Quảng Ngãi', lat: 15.12, lng: 108.80, region: 'central' },
  { code: 'BD', name: 'Bình Định', lat: 14.17, lng: 109.04, region: 'central' },
  { code: 'PY', name: 'Phú Yên', lat: 13.09, lng: 109.09, region: 'central' },
  { code: 'KH', name: 'Khánh Hòa', lat: 12.26, lng: 109.05, region: 'central' },
  { code: 'NTh', name: 'Ninh Thuận', lat: 11.56, lng: 108.99, region: 'central' },
  { code: 'BTh', name: 'Bình Thuận', lat: 11.09, lng: 108.07, region: 'central' },
  { code: 'KT', name: 'Kon Tum', lat: 14.35, lng: 107.99, region: 'central-highlands' },
  { code: 'GL', name: 'Gia Lai', lat: 13.98, lng: 108.00, region: 'central-highlands' },
  { code: 'DL', name: 'Đắk Lắk', lat: 12.71, lng: 108.24, region: 'central-highlands' },
  { code: 'DN2', name: 'Đắk Nông', lat: 12.00, lng: 107.69, region: 'central-highlands' },
  { code: 'LamD', name: 'Lâm Đồng', lat: 11.57, lng: 108.14, region: 'central-highlands' },
  { code: 'TayN', name: 'Tây Ninh', lat: 11.31, lng: 106.10, region: 'south' },
  { code: 'BP', name: 'Bình Phước', lat: 11.75, lng: 106.72, region: 'south' },
  { code: 'BDuong', name: 'Bình Dương', lat: 11.33, lng: 106.67, region: 'south' },
  { code: 'DongN', name: 'Đồng Nai', lat: 11.07, lng: 107.17, region: 'south' },
  { code: 'BRVT', name: 'Bà Rịa-Vũng Tàu', lat: 10.58, lng: 107.25, region: 'south' },
  { code: 'HCM', name: 'TP. Hồ Chí Minh', lat: 10.77, lng: 106.66, region: 'south' },
  { code: 'LA', name: 'Long An', lat: 10.54, lng: 106.40, region: 'south' },
  { code: 'TiG', name: 'Tiền Giang', lat: 10.36, lng: 106.36, region: 'south' },
  { code: 'BenT', name: 'Bến Tre', lat: 10.24, lng: 106.38, region: 'south' },
  { code: 'VL', name: 'Vĩnh Long', lat: 10.24, lng: 105.96, region: 'south' },
  { code: 'DT', name: 'Đồng Tháp', lat: 10.70, lng: 105.63, region: 'south' },
  { code: 'AG', name: 'An Giang', lat: 10.52, lng: 105.13, region: 'south' },
  { code: 'KiG', name: 'Kiên Giang', lat: 10.01, lng: 105.08, region: 'south' },
  { code: 'CT', name: 'Cần Thơ', lat: 10.04, lng: 105.79, region: 'south' },
  { code: 'HauG', name: 'Hậu Giang', lat: 9.78, lng: 105.64, region: 'south' },
  { code: 'ST', name: 'Sóc Trăng', lat: 9.60, lng: 105.97, region: 'south' },
  { code: 'TV', name: 'Trà Vinh', lat: 9.94, lng: 106.35, region: 'south' },
  { code: 'BacL', name: 'Bạc Liêu', lat: 9.29, lng: 105.73, region: 'south' },
  { code: 'CM', name: 'Cà Mau', lat: 9.18, lng: 105.15, region: 'south' },
];

export function findProvinceByCoords(lat: number, lng: number): Province | null {
  let nearest: Province | null = null;
  let minDist = Infinity;

  for (const province of PROVINCES) {
    const dist = Math.sqrt(
      Math.pow(lat - province.lat, 2) + Math.pow(lng - province.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = province;
    }
  }

  return nearest;
}

export function findProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find(p => p.code === code);
}

export function searchProvinces(query: string): Province[] {
  const q = query.toLowerCase().trim();
  if (!q) return PROVINCES;
  return PROVINCES.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.code.toLowerCase().includes(q)
  );
}
