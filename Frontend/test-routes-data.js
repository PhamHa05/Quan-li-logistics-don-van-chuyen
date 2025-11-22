// Test data for routes
// Chạy script này trong console để load dữ liệu test cho tuyến đường

console.log('📦 Loading test routes data...');

// Sample route for today
var today = new Date().toISOString().split('T')[0];

var sampleRoute = {
    id: 1,
    maTuyen: 'TD-Q1-' + today.replace(/-/g, ''),
    idTaiXe: 1,
    ngayGiaoHang: today,
    trangThai: 'DANG_GIAO',
    tongSoDon: 5,
    soDonHoanThanh: 2
};

// Sample delivery points
var samplePoints = [
    {
        id: 1,
        idTuyenDuong: 1,
        idDonVanChuyen: 1,
        thuTuDung: 1,
        thoiGianDuKien: '08:30:00',
        thoiGianThucTe: '08:45:00',
        trangThai: 'DA_DEN'
    },
    {
        id: 2,
        idTuyenDuong: 1,
        idDonVanChuyen: 3,
        thuTuDung: 2,
        thoiGianDuKien: '09:15:00',
        thoiGianThucTe: '09:10:00',
        trangThai: 'DA_DEN'
    },
    {
        id: 3,
        idTuyenDuong: 1,
        idDonVanChuyen: 6,
        thuTuDung: 3,
        thoiGianDuKien: '10:00:00',
        thoiGianThucTe: null,
        trangThai: 'CHO_XU_LY'
    },
    {
        id: 4,
        idTuyenDuong: 1,
        idDonVanChuyen: 2,
        thuTuDung: 4,
        thoiGianDuKien: '10:45:00',
        thoiGianThucTe: null,
        trangThai: 'CHO_XU_LY'
    }
];

// Save to localStorage
localStorage.setItem('todayRoute', JSON.stringify(sampleRoute));
localStorage.setItem('deliveryPoints', JSON.stringify(samplePoints));

console.log('✅ Test routes data loaded successfully!');
console.log('Route:', sampleRoute);
console.log('Points:', samplePoints);
console.log('Now you can test the driver-routes.html page');
