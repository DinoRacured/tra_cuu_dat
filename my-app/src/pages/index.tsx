import React, { useState } from "react";
import { Box, Button, Icon, Page, Text, Input, Select, useNavigate } from "zmp-ui";
import bg from "@/static/dragon_bg.png";

const { Option } = Select;

function HomePage() {
  const [dvhc, setDvhc] = useState("");
  const [street, setStreet] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    // Xoá cache tìm kiếm khi quay lại trang chủ
    delete (window as any).__searchCache;
    delete (window as any).fullFilteredRecords;
    (window as any).currentDisplayLimit = 100;
  }, []);

  const handleSearch = () => {

    const searchParams = new URLSearchParams();
    if (dvhc) searchParams.append("dvhc", dvhc);
    if (street) searchParams.append("street", street);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <Page className="relative bg-white min-h-screen pb-[100px] z-0">
      <Box className="px-5 pt-[120px]">
        <Text.Title className="text-4xl font-medium mb-16 text-[#1A1A1A] tracking-tight">Tra cứu giá đất phi nông nghiệp trên địa bàn thành phố Đà Nẵng</Text.Title>

        <Box className="space-y-6 relative z-10">
          {/* Tên Đơn Vị Hành Chính */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-2">
            <div className="text-sm text-gray-400 font-semibold tracking-widest mb-1 uppercase">Tên Đơn Vị Hành Chính</div>
            <Input
              placeholder="Nhập tên ĐVHC..."
              value={dvhc}
              onChange={(e) => setDvhc(e.target.value)}
              className="w-full !p-0 !border-none !shadow-none !bg-transparent text-lg font-medium outline-none placeholder-gray-300"
            />
          </div>

          {/* Tên Đường */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-2">
            <div className="text-sm text-gray-400 font-semibold tracking-widest mb-1 uppercase">Tên Đường</div>
            <Input
              placeholder="Nhập tên đường..."
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              clearable
              className="w-full !p-0 !border-none !shadow-none text-lg font-medium"
            />
          </div>
        </Box>

        <Box className="mt-12 flex justify-center relative z-10">
          <Button
            onClick={handleSearch}
            className="w-[200px] h-[48px] rounded-full font-semibold text-lg shadow-md"
            style={{ backgroundColor: "#8eb2f7", border: "none", color: "#fff" }}
            prefixIcon={<Icon icon="zi-search" className="text-white" />}
          >
            Tra cứu
          </Button>
        </Box>
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

export default HomePage;
