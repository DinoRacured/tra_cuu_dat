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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { dvhc, street, segment, limit = 10, offset = 0 } = req.query;
        const dataPath = path.join(__dirname, '../data/landPrices.json');
        // Nếu file chưa tồn tại (chưa chạy script syncData)
        if (!fs.existsSync(dataPath)) {
            return res.status(200).json({
                data: []
            });
        }
        // Đọc dữ liệu từ file local
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        let records = [];
        try {
            records = JSON.parse(rawData);
        }
        catch (e) {
            records = [];
        }
        // Lọc dữ liệu nội bộ
        const filterDvhc = typeof dvhc === 'string' ? dvhc.trim().toLowerCase() : '';
        const filterStreet = typeof street === 'string' ? street.trim().toLowerCase() : '';
        const filterSegment = typeof segment === 'string' ? segment.trim().toLowerCase() : '';
        let filteredRecords = records.filter(item => {
            let match = true;
            if (filterDvhc) {
                const itemDvhc = (item.ten_dvhc || '').toLowerCase();
                if (!itemDvhc.includes(filterDvhc))
                    match = false;
            }
            if (filterStreet) {
                const itemStreet = (item.ten_duong || '').toLowerCase();
                if (!itemStreet.includes(filterStreet))
                    match = false;
            }
            if (filterSegment) {
                const itemSegment = (item.doan_duong || '').toLowerCase();
                if (!itemSegment.includes(filterSegment))
                    match = false;
            }
            return match;
        });
        // Phân trang
        const numLimit = parseInt(limit, 10) || 10;
        const numOffset = parseInt(offset, 10) || 0;
        const paginatedRecords = filteredRecords.slice(numOffset, numOffset + numLimit);
        // Trả kết quả về cho Frontend Zalo Mini App
        res.json({
            data: paginatedRecords,
            total: filteredRecords.length
        });
    }
    catch (error) {
        console.error('[Backend] Local Database Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=landPrices.js.map