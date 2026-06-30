import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

const wardMapping = [
    // 📍 12 PHƯỜNG ĐÀ NẴNG (Khu vực cũ)
    { newWard: "Phường Hải Châu", keywords: ["thanh bình", "thuận phước", "thạch thang", "phước ninh", "hải châu", "bình hiên", "nam dương", "đảo xanh", "đầm rong", "xuân đán", "bạch đằng", "lê duẩn", "đống đa", "quang trung", "trần phú", "3 tháng 2", "ba đình", "hải phòng"] },
    { newWard: "Phường Hòa Cường", keywords: ["bình thuận", "hòa thuận", "hòa cường", "tiên sơn", "hóa sơn", "hưng hóa", "nại nam", "quy mỹ", "xuân hòa", "2 tháng 9", "30 tháng 4", "núi thành", "duy tân", "bình minh", "bình an", "tiểu la", "xô viết nghệ tĩnh"] },
    { newWard: "Phường Thanh Khê", keywords: ["xuân hà", "chính gián", "thạc gián", "thanh khê", "thanh huy", "yên khê", "tân lập", "tân hòa", "đầm sen", "điện biên phủ", "trần cao vân", "nguyễn tất thành", "hàm nghi", "lê độ", "cù chính lan", "an xuân"] },
    { newWard: "Phường An Khê", keywords: ["hòa an", "hòa phát", "an khê", "phước lý", "phần lăng", "bàu hạc", "phước tường", "trung lập", "bế văn đàn", "trường chinh", "tôn đản", "hà huy tập"] },
    { newWard: "Phường An Hải", keywords: ["phước mỹ", "an hải", "an cư", "an đồn", "an trung", "an bắc", "an nhơn", "phước trường", "an mỹ", "an vĩnh", "phạm văn đồng", "võ nguyên giáp", "nguyễn văn thoại", "hồ nghinh"] },
    { newWard: "Phường Sơn Trà", keywords: ["thọ quang", "nại hiên", "mân thái", "sơn trà", "mân quang", "vũng thùng", "cổ mân", "nam thọ", "tân thái", "đông hải", "nại thịnh", "nại hưng", "nại nghĩa", "nại tú", "hoàng sa", "yết kiêu", "lê đức thọ", "chu huy mân"] },
    { newWard: "Phường Ngũ Hành Sơn", keywords: ["mỹ an", "khuê mỹ", "hòa hải", "hòa quý", "ngũ hành sơn", "an thượng", "mỹ đa", "mỹ khê", "khuê bắc", "sơn thủy", "thủy sơn", "mộc sơn", "đa mặn", "khái đông", "khái tây", "quán khái", "vùng trung", "đồng khoa", "bá giáng", "đông trà", "nam sơn", "tân trà", "non nước", "trần đại nghĩa", "mai đăng chơn", "võ chí công", "bình kỳ", "an dương vương"] },
    { newWard: "Phường Hòa Khánh", keywords: ["hòa khánh nam", "hòa minh", "hòa sơn", "hòa khánh", "xuân thiều", "bàu trảng", "bàu mạc", "bàu năng", "bàu sen", "bàu làng", "hòa mỹ", "hòa nam", "hòa phú", "chơn tâm", "trung nghĩa", "đàm thanh", "phú lộc", "thanh vinh", "đồng trí", "phú thạnh", "đà sơn", "tôn đức thắng", "nam trân", "an ngãi", "âu cơ", "bắc sơn"] },
    { newWard: "Phường Liên Chiểu", keywords: ["hòa khánh bắc", "hòa liên", "liên chiểu", "hồng phước", "đa phước", "bàu tràm", "suối lương", "nguyễn sinh sắc", "hoàng thị loan", "nguyễn lương bằng"] },
    { newWard: "Phường Hải Vân", keywords: ["hòa hiệp", "hòa bắc", "hải vân", "kim liên", "suối đá"] },
    { newWard: "Phường Cẩm Lệ", keywords: ["hòa thọ", "khuê trung", "cẩm lệ", "an hòa", "phong bắc", "thăng long", "yến bắc", "bình thái", "cẩm bắc", "cẩm chánh", "bình hòa", "ông ích đường", "cách mạng tháng 8"] },
    { newWard: "Phường Hòa Xuân", keywords: ["hòa xuân", "hòa phước", "hòa châu", "cồn dầu", "liêm lạc", "bàu cầu", "nhơn hòa", "thanh lương", "lỗ giáng", "văn thánh", "miếu bông", "tùng lâm", "giáng hương", "bờ quan", "bờ đằm", "hói kiểng", "đồng lớn", "trung lương", "29 tháng 3", "nguyễn phước lan", "ban ban", "bàu gia", "bàu nghè", "bắc thượng", "bàu vàng"] },

    // 📍 CÁC VÙNG SÁP NHẬP (HỘI AN, ĐIỆN BÀN, TAM KỲ)
    { newWard: "Phường Hội An", keywords: ["minh an", "cẩm phô", "sơn phong", "cẩm nam", "cẩm kim", "hội an", "la hối", "phố cổ"] },
    { newWard: "Phường Hội An Đông", keywords: ["cửa đại", "cẩm châu", "cẩm thanh", "rừng dừa", "hội an đông"] },
    { newWard: "Phường Hội An Tây", keywords: ["thanh hà", "tân an", "cẩm an", "cẩm hà", "hội an tây"] },
    
    { newWard: "Phường Điện Bàn", keywords: ["điện phương", "điện minh", "vĩnh điện", "điện bàn"] },
    { newWard: "Phường Điện Bàn Đông", keywords: ["điện nam", "điện dương", "điện ngọc", "viêm đông", "điện bàn đông", "dũng sĩ điện ngọc"] },
    { newWard: "Phường An Thắng", keywords: ["an thắng", "điện an", "điện thắng"] },
    { newWard: "Phường Điện Bàn Bắc", keywords: ["điện hòa", "điện tiến", "điện bàn bắc"] },
    
    { newWard: "Phường Tam Kỳ", keywords: ["tam kỳ", "an xuân", "trường xuân", "thuận trà", "phan bội châu"] },
    { newWard: "Phường Quảng Phú", keywords: ["quảng phú", "an phú", "tam thanh", "tam phú"] },
    { newWard: "Phường Hương Trà", keywords: ["hương trà", "an sơn", "hòa hương", "tam ngọc"] },
    { newWard: "Phường Bàn Thạch", keywords: ["bàn thạch", "tân thạnh", "tam thăng"] }
];

// 2. Hàm đọc và trả về chính xác Phường
const getExactWard = (item: any, cache: Record<string, string>) => {
    const rawDvhc = (item.ten_dvhc || '').toLowerCase();
    const rawStreet = (item.ten_duong || '').toLowerCase();
    
    // Bước 1: Tra cứu trong file wardCache.json trước
    if (item.ten_duong && cache[item.ten_duong]) {
        return cache[item.ten_duong];
    }
    
    // Bước 2: Ưu tiên bắt các tuyến đường được nêu đích danh trong mapping
    let match = wardMapping.find(ward => 
        ward.keywords.some(kw => rawStreet.includes(kw))
    );

    // Bước 3: Nếu tên đường không khớp
    if (!match) {
        match = wardMapping.find(ward => 
            ward.keywords.some(kw => rawDvhc.includes(kw))
        );
    }
    
    // Bước 4: Nếu dữ liệu trong file đã ghi đúng chuẩn chữ "Phường..." (Dành cho Hội An, Tam Kỳ)
    // Cảnh báo: Dữ liệu Đà Nẵng bị gộp 12 phường (chứa rất nhiều chữ "phường" và phẩy) nên phải bỏ qua.
    if (!match && rawDvhc.includes('phường') && !rawDvhc.includes(',')) {
        const directMatch = wardMapping.find(w => rawDvhc.includes(w.newWard.toLowerCase()));
        if (directMatch) return directMatch.newWard;
    }

    return match ? match.newWard : "Đang cập nhật";
};

router.get('/', async (req: Request, res: Response) => {
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
    let records: any[] = [];
    try {
      records = JSON.parse(rawData);
    } catch (e) {
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
        if (!itemDvhc.includes(filterDvhc)) match = false;
      }
      
      if (filterStreet) {
        const itemStreet = (item.ten_duong || '').toLowerCase();
        if (!itemStreet.includes(filterStreet)) match = false;
      }
      
      if (filterSegment) {
        const itemSegment = (item.doan_duong || '').toLowerCase();
        if (!itemSegment.includes(filterSegment)) match = false;
      }
      
      return match;
    });

    // Phân trang
    const numLimit = parseInt(limit as string, 10) || 10;
    const numOffset = parseInt(offset as string, 10) || 0;
    
    const paginatedRecords = filteredRecords.slice(numOffset, numOffset + numLimit);

    // Đọc cache wardCache.json để map chính xác Phường
    const cachePath = path.join(__dirname, '../data/wardCache.json');
    let cache: Record<string, string> = {};
    if (fs.existsSync(cachePath)) {
      try {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      } catch (e) {}
    }

    // Mapping kết quả để có thêm trường phuong_moi_da_nang từ cache hoặc mapping
    const finalRecords = paginatedRecords.map((item: any) => ({
        ...item,
        phuong_moi_da_nang: getExactWard(item, cache) // Gọi hàm xử lý ở trên
    }));

    // Trả kết quả về cho Frontend Zalo Mini App
    res.json({
      data: finalRecords,
      total: filteredRecords.length
    });

  } catch (error: any) {
    console.error('[Backend] Local Database Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
