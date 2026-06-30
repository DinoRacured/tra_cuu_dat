import React, { useEffect, useState } from "react";
import { Page, Header, Box, Text, useNavigate } from "zmp-ui";
import bg from "@/static/dragon_bg.png";
import rawData from "../../public/data.json";

export default function SearchPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const dvhcParam = queryParams.get('dvhc') || '';
  const streetParam = queryParams.get('street') || '';
  const segmentParam = queryParams.get('segment') || '';
  const cacheKey = `${dvhcParam}_${streetParam}_${segmentParam}`;

  const cachedSearch = (window as any).__searchCache;
  const isCacheValid = cachedSearch?.key === cacheKey;

  const [results, setResults] = useState<any[]>(() => isCacheValid ? cachedSearch.results : []);
  const [loading, setLoading] = useState(() => !isCacheValid);
  const navigate = useNavigate();

  // Lưu trạng thái mỗi khi results thay đổi để khi back về vẫn giữ nguyên list
  useEffect(() => {
    if (results.length > 0) {
      (window as any).__searchCache = {
        key: cacheKey,
        results: results
      };
    }
  }, [results, cacheKey]);

  useEffect(() => {
    if (isCacheValid && results.length > 0) {
      // Đã có cache thì bỏ qua fetch lại để không bị reset thanh cuộn
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        // Lấy query string từ URL (VD: ?dvhc=...&street=...)
        const queryParams = new URLSearchParams(window.location.search);
        const dvhc = queryParams.get('dvhc') || '';
        const street = queryParams.get('street') || '';
        const segment = queryParams.get('segment') || '';

        // Trích xuất mảng dữ liệu trực tiếp từ file JSON được bundle tĩnh
        let rawRecords = rawData;

        if (!Array.isArray(rawRecords)) {
          rawRecords = [];
        }

        // Ánh xạ lại các phím ngắn về phím dài ban đầu để phần code React còn lại chạy bình thường
        const records = rawRecords.map((d: any) => ({
          ten_duong: d.td,
          doan_duong: d.dd,
          phuong_chinh_xac: d.pcx,
          gia_dat_o_vt1: d.o1,
          gia_dat_o_vt2: d.o2,
          gia_dat_o_vt3: d.o3,
          gia_dat_o_vt4: d.o4,
          gia_dat_o_vt5: d.o5,
          gia_dat_tmdv_vt1: d.tm1,
          gia_dat_tmdv_vt2: d.tm2,
          gia_dat_tmdv_vt3: d.tm3,
          gia_dat_tmdv_vt4: d.tm4,
          gia_dat_tmdv_vt5: d.tm5,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt1: d.sx1,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt2: d.sx2,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt3: d.sx3,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt4: d.sx4,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt5: d.sx5
        }));

        // Lọc dữ liệu ngay trên RAM của điện thoại (Cực kỳ nhanh)
        const filterDvhc = dvhc.trim().toLowerCase();
        const filterStreet = street.trim().toLowerCase();
        const filterSegment = segment.trim().toLowerCase();

        let filteredRecords = records.filter((item: any) => {
          let match = true;

          if (filterStreet) {
            const itemStreet = (item.ten_duong || '').toLowerCase();
            if (!itemStreet.includes(filterStreet)) match = false;
          }

          if (filterSegment) {
            const itemSegment = (item.doan_duong || '').toLowerCase();
            if (!itemSegment.includes(filterSegment)) match = false;
          }

          // Lưu ý: Chưa lọc dvhc ở bước này vì dvhc gốc bị lỗi gộp 12 phường!
          // Sẽ lọc dvhc ở bước sau khi đã chạy analyzeWard
          return match;
        });

        // Phân tích chính xác phường dựa vào tên đường, đoạn đường và dữ liệu gốc (Cập nhật sáp nhập 23 Phường Mới)
        const analyzeWard = (street: string, segment: string, searchedWard: string, rawTenDvhc: string) => {
          // 1. Nếu rawTenDvhc đã là một phường chính xác (không bị gộp chuỗi, VD: các phường Quảng Nam sáp nhập)
          if (rawTenDvhc && !rawTenDvhc.includes(',')) {
            return rawTenDvhc;
          }

          // 2. Xử lý các đường thuộc 12 phường Đà Nẵng (bị gộp chuỗi)
          const s = (street || '').toLowerCase();
          const seg = (segment || '').toLowerCase();
          const text = s + ' ' + seg;

          // Bản đồ map (Từ khóa phường cũ/đường -> Tên 12 Phường Mới 2026)
          // 1. Khai báo bộ từ khóa chuẩn hóa (Bao phủ toàn bộ đường và ĐVHC cũ/mới)
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
          const getExactWard = (item) => {
            const rawDvhc = (item.ten_dvhc || '').toLowerCase();
            const rawStreet = (item.ten_duong || '').toLowerCase();

            // Bước 1: Ưu tiên bắt các tuyến đường được nêu đích danh trong mapping (để chống nhiễu từ ĐVHC)
            let match = wardMapping.find(ward =>
              ward.keywords.some(kw => rawStreet.includes(kw))
            );

            // Bước 2: Nếu tên đường không khớp (như các đường KDC mới, đường liên thôn, đoạn đường không tên)
            // thì chuyển sang đọc phần "ten_dvhc" (Đơn vị hành chính cũ / Vùng sáp nhập)
            if (!match) {
              match = wardMapping.find(ward =>
                ward.keywords.some(kw => rawDvhc.includes(kw))
              );
            }

            // Bước 3: Nếu dữ liệu trong file đã ghi đúng chuẩn chữ "Phường..." thì trả về luôn (vd "Phường Tam Kỳ")
            if (!match && rawDvhc.includes('phường')) {
              const directMatch = wardMapping.find(w => rawDvhc.includes(w.newWard.toLowerCase()));
              if (directMatch) return directMatch.newWard;
            }

            return match ? match.newWard : "Đang cập nhật";
          };

          for (const mapping of wardMapping) {
            for (const kw of mapping.keywords) {
              if (text.includes(kw)) {
                return mapping.newWard;
              }
            }
          }


          // 3. Xử lý các đường lớn (cắt ngang nhiều phường)
          if (s === "2 tháng 9") {
            if (seg.includes("bảo tàng chăm")) return "Phường Hải Châu";
            return "Phường Hòa Cường";
          }
          if (s.includes("lê duẩn")) {
            if (seg.includes("ông ích khiêm")) return "Phường Thanh Khê";
            return "Phường Hải Châu";
          }
          if (s.includes("nguyễn văn linh")) {
            if (seg.includes("sân bay")) return "Phường Thanh Khê";
            return "Phường Hải Châu";
          }
          if (s.includes("điện biên phủ")) return "Phường Thanh Khê";
          if (s.includes("võ nguyên giáp")) return "Phường An Hải";
          if (s.includes("phạm văn đồng")) return "Phường An Hải";

          // 4. Ưu tiên lấy Tên Phường mà người dùng vừa tìm kiếm nếu không phân tích được
          if (searchedWard) {
            return searchedWard;
          }

          // 5. Nếu không khớp từ điển, hiển thị Tên Thành phố/Thị xã thay vì "Đang tra cứu..."
          if (rawTenDvhc.includes("Hải Châu") || rawTenDvhc.includes("Cẩm Lệ")) return "Đà Nẵng (Chưa xác định Phường)";
          if (rawTenDvhc.includes("Hội An")) return "Hội An (Chưa xác định Phường)";
          if (rawTenDvhc.includes("Tam Kỳ")) return "Tam Kỳ (Chưa xác định Phường)";
          if (rawTenDvhc.includes("Điện Bàn")) return "Điện Bàn (Chưa xác định Phường)";

          return "Chưa xác định Phường";
        };

        // Áp dụng phân tích cục bộ trước hoặc lấy sẵn từ data.json
        let enrichedRecords = filteredRecords.map((r: any) => ({
          ...r,
          phuong_chinh_xac: r.phuong_chinh_xac 
                              ? r.phuong_chinh_xac 
                              : analyzeWard(r.ten_duong, r.doan_duong, dvhc, '')
        }));

        // BƯỚC LỌC SIÊU VIỆT: Lọc theo Phường SAU KHI đã phân tích chính xác
        if (filterDvhc) {
          enrichedRecords = enrichedRecords.filter((r: any) =>
            (r.phuong_chinh_xac || '').toLowerCase().includes(filterDvhc) ||
            r.phuong_chinh_xac?.includes("Chưa xác định")
          );
        }

        // Lưu toàn bộ kết quả lọc được (Để dùng cho nút Tải thêm)
        (window as any).fullFilteredRecords = enrichedRecords; // Lưu tạm vào global để load more

        // Giới hạn hiển thị ban đầu để UI không bị đơ
        const initialDisplay = enrichedRecords.slice(0, (window as any).currentDisplayLimit || 100);

        // Hiển thị ngay kết quả cục bộ
        setResults([...initialDisplay]);
        setLoading(false); // Tắt loading spinner ngay lập tức
        return;
      } catch (error) {
        console.error("Lỗi Fetch Backend:", error);
        // Khi xảy ra lỗi (VD API chết hoặc Backend chưa bật), trả về mảng rỗng thay vì dữ liệu mẫu
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const loadMore = () => {
    const fullRecords = (window as any).fullFilteredRecords;
    if (fullRecords) {
      const currentLen = results.length;
      const nextLimit = currentLen + 100;
      (window as any).currentDisplayLimit = nextLimit;
      setResults([...fullRecords.slice(0, nextLimit)]);
    }
  };

  // Phục hồi thanh cuộn khi render xong từ Cache
  useEffect(() => {
    if (isCacheValid && results.length > 0) {
      setTimeout(() => {
        const scrollY = (window as any).__searchCache_scrollY;
        if (scrollY !== undefined) {
          const searchPage = document.querySelector('.zmp-search-page');
          const scrollTarget = searchPage?.querySelector('.zmp-page-content') || searchPage || document.documentElement;
          if (scrollTarget) {
            scrollTarget.scrollTop = scrollY;
          }
        }
      }, 50);
    }
  }, [isCacheValid, results.length]);

  return (
    <Page 
      className="relative bg-[#FAFAFA] min-h-screen pb-[100px] z-0 zmp-search-page"
      onScroll={(e) => {
        const target = e.target as HTMLElement;
        (window as any).__searchCache_scrollY = target.scrollTop || 0;
      }}
    >
      <Header title="Kết quả tra cứu" showBackIcon />
      <Box className="px-4 pt-[100px] pb-4 space-y-4 relative z-10">
        {loading ? (
          <Text className="text-center text-gray-500 mt-10">Đang tải dữ liệu...</Text>
        ) : (
          <>
            <Text className="text-base font-semibold text-gray-600 mb-2">
              Tìm thấy {((window as any).fullFilteredRecords?.length || results.length)} kết quả
            </Text>
            {results.map((item, index) => (
              <Box
                key={item.id || index}
                className="bg-white p-4 rounded-xl shadow-sm active:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/detail?id=${item.id}`, { state: { item } })}
              >
                <Text className="font-bold text-lg text-[#1A1A1A] mb-1">{item.ten_duong || item.street}</Text>
                <Text className="text-sm text-gray-500 mb-2">{item.doan_duong || item.segment}</Text>
                <Box className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-xs text-gray-400">{item.phuong_chinh_xac}</Text>
                  <Text className="font-bold text-lg text-blue-600">
                    {item.gia_dat_o_vt1 ? parseFloat(item.gia_dat_o_vt1.replace(',', '.')).toString() : '---'} tr/m²
                  </Text>
                </Box>
              </Box>
            ))}

            {/* Nút Xem Thêm */}
            {((window as any).fullFilteredRecords?.length || 0) > results.length && (
              <Box className="flex justify-center mt-6 mb-8 pt-4">
                <div
                  onClick={loadMore}
                  className="bg-blue-100 text-blue-700 font-bold px-8 py-3 rounded-full active:bg-blue-200 cursor-pointer text-sm shadow-sm"
                >
                  Xem thêm các đường khác
                </div>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Background Image */}
      <div
        className="fixed bottom-0 left-0 w-full h-[50vh] bg-no-repeat opacity-60 pointer-events-none z-[-1]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "150%",
          backgroundPosition: "right -1px bottom 0px"
        }}
      />
    </Page>
  );
}
