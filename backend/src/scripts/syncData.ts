import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Đã loại bỏ JSESSIONID vì đã tìm ra chuỗi Basic Auth chuẩn xác
const USERNAME_PASSWORD_BASE64 = 'bHV1ZHV5YW5oMjAwMjpMdXVkdXlhbmgyMDAy';

export async function syncData() {
  console.log('Bắt đầu tải dữ liệu từ Cổng Dữ Liệu...');
  
  // API lấy toàn bộ dữ liệu (limit lớn)
  const apiUrl = 'https://congdulieu.vn/api/dataset/ODkwMTYx?limit=10000&offset=0';

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${USERNAME_PASSWORD_BASE64}`
      }
    });

    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      console.error('❌ LỖI: API trả về mã HTML. Hãy kiểm tra lại tài khoản.');
      return;
    }

    // Trích xuất mảng dữ liệu
    let records = response.data?.result?.records || response.data?.data || response.data?.records || response.data || [];
    if (!Array.isArray(records)) {
      if (records.result) records = records.result;
      records = Array.isArray(records) ? records : [records];
    }

    console.log(`✅ Tải thành công ${records.length} bản ghi.`);

    // Lưu vào file JSON local
    const dataPath = path.join(__dirname, '../data/landPrices.json');
    fs.writeFileSync(dataPath, JSON.stringify(records, null, 2), 'utf-8');
    
    console.log(`✅ Đã lưu dữ liệu cập nhật vào: ${dataPath}`);

  } catch (error: any) {
    console.error('❌ Lỗi khi tải dữ liệu:', error.message);
  }
}

// Nếu chạy trực tiếp file này từ terminal
if (require.main === module) {
  syncData();
}
