const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dataPath = path.join(__dirname, '../data/landPrices.json');
const cachePath = path.join(__dirname, '../data/wardCache.json');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8') || '{}');

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

const uniqueStreets = new Set(data.map(d => d.ten_duong).filter(Boolean));
const missingStreets = [];

for (const s of uniqueStreets) {
    const item = data.find(d => d.ten_duong === s);
    if (!item.ten_dvhc.includes('Phường An Hải, Phường An Khê')) continue;
    
    if (getExactWardLocal(item) === 'Chưa xác định Phường' && !cache[s]) {
        missingStreets.push(s);
    }
}

console.log(`[SEEDER] Found ${missingStreets.length} streets to resolve.`);

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
    for (let i = 0; i < missingStreets.length; i++) {
        const street = missingStreets[i];
        try {
            console.log(`[${i+1}/${missingStreets.length}] Fetching ${street}...`);
            const nomRes = await axios.get(`https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(street)}&city=Đà Nẵng&format=json&addressdetails=1`, {
                headers: { "Accept-Language": "vi", "User-Agent": "ZaloMiniApp_Backend/1.0" },
                timeout: 5000
            });
            
            let finalWard = "Đà Nẵng (Chưa xác định Phường)";
            const nomData = nomRes.data;
            if (nomData && nomData.length > 0) {
                const addr = nomData[0].address;
                const rawNominatimWard = addr.quarter || addr.suburb || addr.village || addr.city_district || "";
                if (rawNominatimWard) {
                    const mapped = getMappedWard(rawNominatimWard);
                    if (mapped) {
                        finalWard = mapped;
                    } else {
                        finalWard = rawNominatimWard.includes('Phường') ? rawNominatimWard : `Phường ${rawNominatimWard}`;
                    }
                }
            }
            cache[street] = finalWard;
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
            
            // Cập nhật thẳng vào data.json của Frontend để Zalo App tự nhận mà không cần gọi API Backend!
            const frontendDataPath = path.join(__dirname, '../../../my-app/public/data.json');
            try {
                const feData = JSON.parse(fs.readFileSync(frontendDataPath, 'utf-8'));
                for (let j = 0; j < feData.length; j++) {
                    if (feData[j].ten_duong === street) {
                        feData[j].phuong_chinh_xac = finalWard;
                    }
                }
                fs.writeFileSync(frontendDataPath, JSON.stringify(feData), 'utf-8');
            } catch(e) {}

            console.log(` => Result: ${finalWard}`);
        } catch (err) {
            console.error(` => Error for ${street}:`, err.message);
        }
        
        // Wait 1.5 seconds to respect Nominatim limits
        await delay(1500);
    }
    console.log('[SEEDER] Complete!');
}

run();
