const fs = require('fs');
const path = require('path');
const axios = require('axios');

const cachePath = path.join(__dirname, '../data/wardCache.json');
const dataPath = path.join(__dirname, '../data/landPrices.json');
const frontendDataPath = path.join(__dirname, '../../../my-app/public/data.json');

const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8') || '{}');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const wardMapping = [
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

const validWards = new Set(wardMapping.map(w => w.newWard));

const getMappedWard = (rawWard) => {
    const raw = (rawWard || '').toLowerCase();
    if (raw.includes('phường')) {
        const directMatch = wardMapping.find(w => raw.includes(w.newWard.toLowerCase()));
        if (directMatch) return directMatch.newWard;
    }
    const match = wardMapping.find(ward => 
        ward.keywords.some(kw => raw.includes(kw))
    );
    return match ? match.newWard : null;
};

// 1. Quét và lọc bỏ các giá trị sai trong Cache
let deletedCount = 0;
for (const [street, ward] of Object.entries(cache)) {
    // Nếu ward không thuộc 12 phường hợp lệ của Đà Nẵng, hoặc là "Chưa xác định" thì xóa khỏi cache để quét lại
    if (!validWards.has(ward) || ward.includes("Chưa xác định")) {
        delete cache[street];
        deletedCount++;
    }
}
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
console.log(`[REPAIR] Đã xóa ${deletedCount} cache sai/chưa xác định.`);

// 2. Tìm tất cả các đường Đà Nẵng bị thiếu
const uniqueStreets = new Set(data.map(d => d.ten_duong).filter(Boolean));
const missingStreets = [];

const getExactWardLocal = (item) => {
    const rawDvhc = (item.ten_dvhc || '').toLowerCase();
    const rawStreet = (item.ten_duong || '').toLowerCase();
    let match = wardMapping.find(ward => 
        ward.keywords.some(kw => rawStreet.includes(kw))
    );
    if (!match && rawDvhc.includes('phường') && !rawDvhc.includes(',')) {
        const directMatch = wardMapping.find(w => rawDvhc.includes(w.newWard.toLowerCase()));
        if (directMatch) return directMatch.newWard;
    }
    return match ? match.newWard : 'Chưa xác định Phường';
};

for (const s of uniqueStreets) {
    const item = data.find(d => d.ten_duong === s);
    // Chỉ xử lý các đường thuộc Đà Nẵng
    if (item.ten_dvhc && item.ten_dvhc.includes('Phường An Hải, Phường An Khê')) {
        if (getExactWardLocal(item) === 'Chưa xác định Phường' && !cache[s]) {
            missingStreets.push(s);
        }
    }
}

console.log(`[REPAIR] Phát hiện ${missingStreets.length} đường Đà Nẵng cần quét/sửa lại.`);

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
    for (let i = 0; i < missingStreets.length; i++) {
        const street = missingStreets[i];
        try {
            console.log(`[${i+1}/${missingStreets.length}] Đang quét lại đường: ${street}...`);
            
            // Thử cách 1: Query bằng cấu trúc street & city
            let nomRes = await axios.get(`https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(street)}&city=Đà Nẵng&format=json&addressdetails=1`, {
                headers: { "Accept-Language": "vi", "User-Agent": "ZaloMiniApp_Repair/1.0" },
                timeout: 5000
            });
            
            let finalWard = null;
            
            const checkResults = (nomData) => {
                if (!nomData || nomData.length === 0) return null;
                // Duyệt qua tất cả kết quả để tìm cái nào map đúng 1 trong 12 phường Đà Nẵng
                for (const resItem of nomData) {
                    const addr = resItem.address;
                    const rawNominatimWard = addr.quarter || addr.suburb || addr.village || addr.city_district || "";
                    if (rawNominatimWard) {
                        const mapped = getMappedWard(rawNominatimWard);
                        // Chỉ lấy nếu thuộc 12 phường của Đà Nẵng
                        if (mapped && validWards.has(mapped)) {
                            return mapped;
                        }
                    }
                }
                return null;
            };

            finalWard = checkResults(nomRes.data);

            // Thử cách 2 nếu cách 1 thất bại: Query tự do q=street, Đà Nẵng
            if (!finalWard) {
                await delay(1500);
                let nomRes2 = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(street + ', Đà Nẵng')}&format=json&addressdetails=1`, {
                    headers: { "Accept-Language": "vi", "User-Agent": "ZaloMiniApp_Repair/1.0" },
                    timeout: 5000
                });
                finalWard = checkResults(nomRes2.data);
            }

            // Nếu vẫn không ra, lưu "Đà Nẵng (Chưa xác định Phường)"
            if (!finalWard) {
                finalWard = "Đà Nẵng (Chưa xác định Phường)";
            }

            // Cập nhật Cache
            cache[street] = finalWard;
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');

            // Cập nhật thẳng vào data.json của Frontend
            try {
                const feData = JSON.parse(fs.readFileSync(frontendDataPath, 'utf-8'));
                let updated = false;
                for (let j = 0; j < feData.length; j++) {
                    if (feData[j].td === street) {
                        feData[j].pcx = finalWard;
                        updated = true;
                    }
                }
                if (updated) {
                    fs.writeFileSync(frontendDataPath, JSON.stringify(feData), 'utf-8');
                }
            } catch (e) {
                console.error("Lỗi cập nhật data.json:", e.message);
            }

            console.log(` => Kết quả lưu: ${finalWard}`);
        } catch (err) {
            console.error(` => Lỗi với đường ${street}:`, err.message);
        }
        
        // Tránh bị Nominatim chặn IP (chờ 1.5s)
        await delay(1500);
    }
    console.log("[REPAIR] Hoàn tất sửa đổi và đồng bộ!");
}

run();
