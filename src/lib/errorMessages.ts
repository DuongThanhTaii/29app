const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  'auth/invalid-phone-number': 'Số điện thoại không hợp lệ',
  'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng đợi vài phút',
  'auth/invalid-verification-code': 'Mã OTP không đúng, vui lòng thử lại',
  'auth/code-expired': 'Mã OTP đã hết hạn, vui lòng gửi lại',
  'auth/session-expired': 'Phiên đăng nhập hết hạn, vui lòng thử lại',
  'auth/network-request-failed': 'Mất kết nối mạng',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hoá',
  'auth/missing-phone-number': 'Vui lòng nhập số điện thoại',
  // Storage
  'storage/quota-exceeded': 'Bộ nhớ đầy, vui lòng xóa ảnh cũ',
  'storage/unauthorized': 'Không có quyền tải ảnh lên',
  'storage/object-not-found': 'Ảnh không tìm thấy',
  // Firestore
  'permission-denied': 'Không có quyền thực hiện thao tác này',
  'unavailable': 'Dịch vụ tạm thời không khả dụng',
  'not-found': 'Không tìm thấy dữ liệu',
  // Network
  'network-request-failed': 'Mất kết nối, sẽ đồng bộ sau khi có mạng',
  // Generic
  'unknown': 'Đã xảy ra lỗi, vui lòng thử lại',
};

export function getVietnameseError(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES['unknown'];
}

export function parseFirebaseError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code ?? '';
    return getVietnameseError(code);
  }
  return ERROR_MESSAGES['unknown'];
}
