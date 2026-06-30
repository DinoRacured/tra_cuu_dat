import React, { useEffect, useState } from "react";
import { Page, Header, Box, Text } from "zmp-ui";
import bg from "@/static/dragon_bg.png";

export default function DetailPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy state truyền từ trang Search (nếu có) thông qua react-router (ZMP UI)
    const passedState = window.history.state?.usr?.item;
    
    if (passedState) {
      setData({
        ...passedState
      });
      setLoading(false);
    } else {
      // Nếu không có state truyền sang (tải trực tiếp trang Detail), 
      // ở môi trường thực tế sẽ gọi API GET chi tiết dựa trên query param id.
      // Vì hiện tại chưa có API chi tiết, ta set data null.
      setData(null);
      setLoading(false);
    }
  }, []);

  const renderPriceGroup = (title: string, dataKeyPrefix: string) => {
    const vt1 = data?.[`${dataKeyPrefix}_vt1`];
    // Nếu không có giá trị mặt tiền (VT1), ẩn luôn nhóm đất này
    if (!vt1) return null;

    const subPositions = [
      { key: 'vt2', label: 'Vị trí 2' },
      { key: 'vt3', label: 'Vị trí 3' },
      { key: 'vt4', label: 'Vị trí 4' },
      { key: 'vt5', label: 'Vị trí 5' }
    ];

    // Lọc ra các vị trí phụ có dữ liệu
    const validSubPositions = subPositions.filter(pos => data?.[`${dataKeyPrefix}_${pos.key}`]);

    return (
      <Box className="bg-blue-50 p-4 rounded-xl mt-4">
        <Box className={`flex justify-between items-center ${validSubPositions.length > 0 ? 'border-b border-blue-200 pb-3 mb-3' : ''}`}>
          <Box className="flex-1 pr-2">
            <Text className="text-sm text-blue-800 font-bold uppercase tracking-wider">{title}</Text>
            <Text className="text-xs text-blue-600 mt-0.5">Vị trí 1 (Mặt tiền)</Text>
          </Box>
          <Text className="text-xl font-extrabold text-blue-700 shrink-0 whitespace-nowrap">
            {parseFloat(vt1.replace(',', '.')).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr/m²
          </Text>
        </Box>
        {validSubPositions.length > 0 && (
          <Box className="space-y-2.5">
            {validSubPositions.map(pos => {
              const val = data[`${dataKeyPrefix}_${pos.key}`];
              return (
                <Box key={pos.key} className="flex justify-between items-center pl-2">
                  <Text className="text-sm text-gray-600 flex-1 pr-2">{pos.label}</Text>
                  <Text className="text-sm font-bold text-gray-800 shrink-0 whitespace-nowrap">
                    {parseFloat(val.replace(',', '.')).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr/m²
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Page className="relative bg-[#FAFAFA] min-h-screen pb-[100px] z-0">
      <Header title="Chi tiết giá đất" showBackIcon />
      <Box className="p-4 pt-[100px] relative z-10">
        {loading ? (
          <Text className="text-center text-gray-500 mt-10">Đang tải...</Text>
        ) : !data ? (
          <Text className="text-center text-gray-500 mt-10">Không tìm thấy thông tin chi tiết.</Text>
        ) : (
          <Box className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <Box>
              <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tên đường</Text>
              <Text className="font-bold text-xl text-[#1A1A1A]">{data.street || data.ten_duong}</Text>
            </Box>
            <Box>
              <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">Đoạn đường</Text>
              <Text className="text-lg text-gray-800">{data.segment || data.doan_duong}</Text>
            </Box>
            <Box>
              <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">Đơn vị hành chính</Text>
              <Text className="text-base font-medium text-gray-700">{data.phuong_chinh_xac || data.dvhc || data.ten_dvhc}</Text>
            </Box>
            <Box>
              {renderPriceGroup("Giá Đất Ở", "gia_dat_o")}
              {renderPriceGroup("Thương mại Dịch vụ", "gia_dat_tmdv")}
              {renderPriceGroup("Sản xuất Phi Nông nghiệp", "gia_dat_co_so_san_xuat_phi_nong_nghiep")}
            </Box>
          </Box>
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
