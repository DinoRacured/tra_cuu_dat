const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../../my-app/public/data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const keyMapping = {
    ten_duong: 'td',
    doan_duong: 'dd',
    phuong_chinh_xac: 'pcx',
    gia_dat_o_vt1: 'o1',
    gia_dat_o_vt2: 'o2',
    gia_dat_o_vt3: 'o3',
    gia_dat_o_vt4: 'o4',
    gia_dat_o_vt5: 'o5',
    gia_dat_tmdv_vt1: 'tm1',
    gia_dat_tmdv_vt2: 'tm2',
    gia_dat_tmdv_vt3: 'tm3',
    gia_dat_tmdv_vt4: 'tm4',
    gia_dat_tmdv_vt5: 'tm5',
    gia_dat_co_so_san_xuat_phi_nong_nghiep_vt1: 'sx1',
    gia_dat_co_so_san_xuat_phi_nong_nghiep_vt2: 'sx2',
    gia_dat_co_so_san_xuat_phi_nong_nghiep_vt3: 'sx3',
    gia_dat_co_so_san_xuat_phi_nong_nghiep_vt4: 'sx4',
    gia_dat_co_so_san_xuat_phi_nong_nghiep_vt5: 'sx5'
};

const compressedData = rawData.map(item => {
    const newItem = {};
    for (const [key, value] of Object.entries(item)) {
        if (keyMapping[key]) {
            newItem[keyMapping[key]] = value;
        } else {
            newItem[key] = value;
        }
    }
    return newItem;
});

fs.writeFileSync(dataPath, JSON.stringify(compressedData), 'utf-8');
console.log('Size after compression:', fs.statSync(dataPath).size, 'bytes');
