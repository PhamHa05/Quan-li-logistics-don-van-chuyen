// API Service - Xử lý tất cả các request đến backend
app.factory('apiService', ['$http', '$q', 'API_CONFIG', function($http, $q, API_CONFIG) {
    var service = {};
    
    // Helper function để build URL
    function buildUrl(endpoint) {
        return API_CONFIG.BASE_URL + endpoint;
    }
    
    // Helper function để normalize response (chuyển C# naming sang JS naming)
    function normalizeResponse(data) {
        if (!data) return data;
        
        // Nếu là array, normalize từng item
        if (Array.isArray(data)) {
            return data.map(normalizeResponse);
        }
        
        // Nếu là object, normalize properties
        if (typeof data === 'object') {
            var normalized = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    // Convert PascalCase to camelCase
                    var normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
                    normalized[normalizedKey] = data[key];
                    // Keep original key as well for compatibility
                    normalized[key] = data[key];
                }
            }
            return normalized;
        }
        
        return data;
    }
    
    // Generic GET request
    service.get = function(endpoint, params) {
        return $http({
            method: 'GET',
            url: buildUrl(endpoint),
            params: params
        }).then(function(response) {
            return normalizeResponse(response.data);
        }).catch(function(error) {
            console.error('GET Error:', error);
            return $q.reject(error);
        });
    };
    
    // Generic POST request
    service.post = function(endpoint, data) {
        return $http({
            method: 'POST',
            url: buildUrl(endpoint),
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            return normalizeResponse(response.data);
        }).catch(function(error) {
            console.error('POST Error:', error);
            return $q.reject(error);
        });
    };
    
    // Generic PUT request
    service.put = function(endpoint, data) {
        return $http({
            method: 'PUT',
            url: buildUrl(endpoint),
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            return response.data;
        }).catch(function(error) {
            console.error('PUT Error:', error);
            return $q.reject(error);
        });
    };
    
    // Generic DELETE request
    service.delete = function(endpoint) {
        return $http({
            method: 'DELETE',
            url: buildUrl(endpoint)
        }).then(function(response) {
            return response.data;
        }).catch(function(error) {
            console.error('DELETE Error:', error);
            return $q.reject(error);
        });
    };
    
    // ==================== NGƯỜI DÙNG APIs ====================
    
    // Đăng nhập
    service.login = function(tenDangNhap, matKhau) {
        return service.post(API_CONFIG.ENDPOINTS.LOGIN, {
            TenDangNhap: tenDangNhap,
            MatKhau: matKhau
        });
    };
    
    // Lấy tất cả người dùng
    service.getAllNguoiDung = function(hoTen, tenDangNhap) {
        return service.get(API_CONFIG.ENDPOINTS.NGUOIDUNG, {
            hoTen: hoTen,
            tenDangNhap: tenDangNhap
        });
    };
    
    // Lấy người dùng theo ID
    service.getNguoiDungById = function(id) {
        return service.get(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/get-by-id/' + id);
    };
    
    // Tạo người dùng mới
    service.createNguoiDung = function(userData) {
        return service.post(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/create', userData);
    };
    
    // Cập nhật người dùng
    service.updateNguoiDung = function(userData) {
        return service.put(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/update', userData);
    };
    
    // Xóa người dùng
    service.deleteNguoiDung = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/delete/' + id);
    };
    
    // Đổi mật khẩu
    service.updatePassword = function(id, matKhauMoi) {
        return service.put(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/update-password/' + id, {
            MatKhauMoi: matKhauMoi
        });
    };
    
    // Đổi mật khẩu (với mật khẩu cũ để xác thực)
    service.changePassword = function(changePasswordData) {
        // Backend endpoint: PUT /api/NguoiDung/change-password
        // Body: { MaNguoiDung, MatKhauCu, MatKhauMoi }
        return service.put(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/change-password', changePasswordData);
    };
    
    // Cập nhật trạng thái
    service.updateStatus = function(id, trangThai) {
        return service.put(API_CONFIG.ENDPOINTS.NGUOIDUNG + '/update-status/' + id, {
            TrangThai: trangThai
        });
    };
    
    // ==================== ĐƠN VẬN CHUYỂN APIs ====================
    
    // Lấy tất cả đơn vận chuyển (sử dụng search với params rỗng)
    service.getAllDonVanChuyen = function() {
        return service.post(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/search', {
            PageIndex: 1,
            PageSize: 1000,
            MaVanDon: '',
            TrangThai: ''
        }).then(function(response) {
            console.log('[API] getAllDonVanChuyen response:', response);
            // API trả về { TotalItems, Data } hoặc { totalItems, data }
            var orders = response.data || response.Data || response || [];
            console.log('[API] Extracted orders:', orders.length);
            return Array.isArray(orders) ? orders : [];
        }).catch(function(error) {
            console.error('[API] getAllDonVanChuyen error:', error);
            // Return empty array instead of rejecting
            return [];
        });
    };
    
    // Lấy đơn vận chuyển theo ID
    service.getDonVanChuyenById = function(id) {
        return service.get(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/get-by-id/' + id);
    };
    
    // Lấy đơn vận chuyển theo ID tài xế
    service.getDonVanChuyenByTaiXe = function(idTaiXe) {
        return service.get(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/by-tai-xe/' + idTaiXe);
    };
    
    // Tìm kiếm đơn vận chuyển
    service.searchDonVanChuyen = function(searchData) {
        return service.post(API_CONFIG.ENDPOINTS.DONVANCHUYEN_SEARCH, searchData);
    };
    
    // Tạo đơn vận chuyển mới
    service.createDonVanChuyen = function(orderData) {
        return service.post(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/create', orderData);
    };
    
    // Cập nhật đơn vận chuyển
    service.updateDonVanChuyen = function(orderData) {
        return service.put(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/update', orderData);
    };
    
    // Xóa đơn vận chuyển
    service.deleteDonVanChuyen = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.DONVANCHUYEN + '/delete/' + id);
    };
    
    // ==================== TÀI XẾ APIs ====================
    
    // Lấy tất cả tài xế (sử dụng search với params rỗng)
    service.getAllTaiXe = function() {
        return service.post(API_CONFIG.ENDPOINTS.TAIXE + '/search', {
            PageIndex: 1,
            PageSize: 1000,
            HoTen: '',
            SoDienThoai: ''
        }).then(function(response) {
            // API trả về { TotalItems, Data }
            return response.data || response.Data || [];
        });
    };
    
    // Lấy tài xế theo ID
    service.getTaiXeById = function(id) {
        return service.get(API_CONFIG.ENDPOINTS.TAIXE + '/get-by-id/' + id);
    };
    
    // Tạo tài xế mới
    service.createTaiXe = function(driverData) {
        return service.post(API_CONFIG.ENDPOINTS.TAIXE + '/create', driverData);
    };
    
    // Cập nhật tài xế
    service.updateTaiXe = function(driverData) {
        return service.put(API_CONFIG.ENDPOINTS.TAIXE + '/update', driverData);
    };
    
    // Xóa tài xế
    service.deleteTaiXe = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.TAIXE + '/delete/' + id);
    };
    
    // Lấy thống kê dashboard cho tài xế
    service.getDashboardStats = function(idTaiXe) {
        return service.get(API_CONFIG.ENDPOINTS.TAIXE + '/dashboard-stats/' + idTaiXe);
    };
    
    // ==================== TUYẾN ĐƯỜNG APIs ====================
    
    // Lấy tất cả tuyến đường (sử dụng search với params rỗng)
    service.getAllTuyenDuong = function() {
        return service.post(API_CONFIG.ENDPOINTS.TUYENDUONG + '/search', {
            PageIndex: 1,
            PageSize: 1000,
            MaTuyen: '',
            IdTaiXe: null
        }).then(function(response) {
            // API trả về { TotalItems, Data }
            return response.data || response.Data || [];
        });
    };
    
    // Lấy tuyến đường theo ID
    service.getTuyenDuongById = function(id) {
        return service.get(API_CONFIG.ENDPOINTS.TUYENDUONG + '/get-by-id/' + id);
    };
    
    // Tạo tuyến đường mới
    service.createTuyenDuong = function(routeData) {
        return service.post(API_CONFIG.ENDPOINTS.TUYENDUONG + '/create', routeData);
    };
    
    // Cập nhật tuyến đường
    service.updateTuyenDuong = function(routeData) {
        return service.put(API_CONFIG.ENDPOINTS.TUYENDUONG + '/update', routeData);
    };
    
    // Xóa tuyến đường
    service.deleteTuyenDuong = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.TUYENDUONG + '/delete/' + id);
    };
    
    // ==================== GIAO DỊCH COD APIs ====================
    
    // Lấy tất cả giao dịch COD
    service.getAllGiaoDichCOD = function() {
        return service.get(API_CONFIG.ENDPOINTS.GIAODICHCOD);
    };
    
    // Lấy giao dịch COD theo ID
    service.getGiaoDichCODById = function(id) {
        return service.get(API_CONFIG.ENDPOINTS.GIAODICHCOD + '/get-by-id/' + id);
    };
    
    // Tạo giao dịch COD mới
    service.createGiaoDichCOD = function(codData) {
        return service.post(API_CONFIG.ENDPOINTS.GIAODICHCOD + '/create', codData);
    };
    
    // Cập nhật giao dịch COD
    service.updateGiaoDichCOD = function(codData) {
        return service.put(API_CONFIG.ENDPOINTS.GIAODICHCOD + '/update', codData);
    };
    
    // Xóa giao dịch COD
    service.deleteGiaoDichCOD = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.GIAODICHCOD + '/delete/' + id);
    };
    
    // Nộp COD cho đơn hàng
    service.submitCOD = function(idDonVanChuyen) {
        return service.put(API_CONFIG.ENDPOINTS.GIAODICHCOD + '/submit-cod/' + idDonVanChuyen);
    };
    
    // ==================== SỰ KIỆN TRẠNG THÁI APIs ====================
    
    // Lấy tất cả sự kiện trạng thái
    service.getAllSuKienTrangThai = function() {
        return service.get(API_CONFIG.ENDPOINTS.SUKIENTRANGTHAI);
    };
    
    // Lấy sự kiện trạng thái theo đơn vận chuyển
    service.getSuKienTrangThaiByDonVanChuyen = function(donVanChuyenId) {
        return service.get(API_CONFIG.ENDPOINTS.SUKIENTRANGTHAI + '/don-van-chuyen/' + donVanChuyenId);
    };
    
    // Tạo sự kiện trạng thái mới
    service.createSuKienTrangThai = function(eventData) {
        return service.post(API_CONFIG.ENDPOINTS.SUKIENTRANGTHAI + '/create', eventData);
    };
    
    // ==================== ĐIỂM GIAO HÀNG APIs ====================
    
    // Lấy tất cả điểm giao hàng
    service.getAllDiemGiaoHang = function() {
        return service.get(API_CONFIG.ENDPOINTS.DIEMGIAOHANG);
    };
    
    // Lấy điểm giao hàng theo tuyến đường
    service.getDiemGiaoHangByTuyenDuong = function(tuyenDuongId) {
        return service.get(API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/tuyen-duong/' + tuyenDuongId);
    };
    
    // Tạo điểm giao hàng mới
    service.createDiemGiaoHang = function(pointData) {
        return service.post(API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/create', pointData);
    };
    
    // Cập nhật điểm giao hàng
    service.updateDiemGiaoHang = function(pointData) {
        return service.put(API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/update', pointData);
    };
    
    // Xóa điểm giao hàng
    service.deleteDiemGiaoHang = function(id) {
        return service.delete(API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/delete/' + id);
    };
    
    return service;
}]);
