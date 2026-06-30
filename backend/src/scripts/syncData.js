"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncData = syncData;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Đã loại bỏ JSESSIONID vì đã tìm ra chuỗi Basic Auth chuẩn xác
const USERNAME_PASSWORD_BASE64 = 'bHV1ZHV5YW5oMjAwMjpMdXVkdXlhbmgyMDAy';
async function syncData() {
    console.log('Bắt đầu tải dữ liệu từ Cổng Dữ Liệu...');
    // API lấy toàn bộ dữ liệu (limit lớn)
    const apiUrl = 'https://congdulieu.vn/api/dataset/ODkwMTYx?limit=10000&offset=0';
    try {
        const response = await axios_1.default.get(apiUrl, {
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
            if (records.result)
                records = records.result;
            records = Array.isArray(records) ? records : [records];
        }
        console.log(`✅ Tải thành công ${records.length} bản ghi.`);
        // Lưu vào file JSON local
        const dataPath = path.join(__dirname, '../data/landPrices.json');
        fs.writeFileSync(dataPath, JSON.stringify(records, null, 2), 'utf-8');
        console.log(`✅ Đã lưu dữ liệu cập nhật vào: ${dataPath}`);
    }
    catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error.message);
    }
}
// Nếu chạy trực tiếp file này từ terminal
if (require.main === module) {
    syncData();
}
//# sourceMappingURL=syncData.js.map