import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const router = Router();
const cachePath = path.join(__dirname, '../data/wardCache.json');

// Ensure cache file exists
if (!fs.existsSync(cachePath)) {
  fs.writeFileSync(cachePath, JSON.stringify({}), 'utf-8');
}

// 1. Khai báo bộ từ khóa chuẩn hóa
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
    { newWard: "Phường Hòa Xuân", keywords: ["hòa xuân", "hòa phước", "hòa châu", "cồn dầu", "liêm lạc", "bàu cầu", "nhơn hòa", "thanh lương", "lỗ giáng", "văn thánh", "miếu bông", "tùng lâm", "giáng hương", "bờ quan", "bờ đằm", "hói kiểng", "đồng lớn", "trung lương", "29 tháng 3", "nguyễn phước lan", "ban ban", "bàu gia", "bàu nghè", "bắc thượng", "bàu vàng"] }
];

// Hàm lấy tên phường chính xác dựa trên text Nominatim
const getMappedWard = (rawWard: string) => {
    const raw = (rawWard || '').toLowerCase();
    
    // Nếu text Nominatim đã ghi sẵn "Phường abc..."
    if (raw.includes('phường')) {
        const directMatch = wardMapping.find(w => raw.includes(w.newWard.toLowerCase()));
        if (directMatch) return directMatch.newWard;
    }

    // Map qua từ khóa
    const match = wardMapping.find(ward => 
        ward.keywords.some(kw => raw.includes(kw))
    );
    
    return match ? match.newWard : null;
};

// Queue xử lý Nominatim API để tránh bị chặn IP (chỉ gọi 1 request/s)
let isFetching = false;

router.get('/', async (req: Request, res: Response) => {
  try {
    const { street } = req.query;
    if (!street || typeof street !== 'string') {
      return res.status(400).json({ error: 'Missing street parameter' });
    }

    // 1. Đọc Cache
    let cache: Record<string, string> = {};
    try {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch (e) {
      // ignore
    }

    if (cache[street]) {
      return res.json({ ward: cache[street], source: 'cache' });
    }

    // Nếu đang có một request khác đang fetch Nominatim, chờ 1 tí
    while (isFetching) {
      await new Promise(r => setTimeout(r, 1000)); // Queue đơn giản
    }

    // 2. Gọi Nominatim API
    isFetching = true;
    try {
      // Phải có User-Agent chuẩn
      const nomRes = await axios.get(`https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(street)}&city=Đà Nẵng&format=json&addressdetails=1`, {
        headers: { "Accept-Language": "vi", "User-Agent": "ZaloMiniApp_Backend/1.0" },
        timeout: 5000
      });
      
      let finalWard = "Đà Nẵng (Chưa xác định Phường)"; // Fallback
      
      const nomData = nomRes.data;
      if (nomData && nomData.length > 0) {
        const addr = nomData[0].address;
        const rawNominatimWard = addr.quarter || addr.suburb || addr.village || addr.city_district || "";
        
        if (rawNominatimWard) {
          const mapped = getMappedWard(rawNominatimWard);
          if (mapped) {
             finalWard = mapped;
          } else {
             // Nếu không map được, lấy luôn tên của Nominatim trả về kèm Thành Phố
             finalWard = rawNominatimWard.includes('Phường') ? rawNominatimWard : `Phường ${rawNominatimWard}`;
          }
        }
      }

      // Lưu Cache
      cache[street] = finalWard;
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');

      res.json({ ward: finalWard, source: 'nominatim' });
    } catch (err) {
      console.error('Lỗi Nominatim API:', err);
      res.status(500).json({ error: 'Nominatim API error' });
    } finally {
      // Đợi 1.5s trước khi thả cờ isFetching để đảm bảo 1 request / 1.5 giây
      setTimeout(() => {
        isFetching = false;
      }, 1500);
    }

  } catch (error: any) {
    console.error('[Backend] Resolve Ward Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
