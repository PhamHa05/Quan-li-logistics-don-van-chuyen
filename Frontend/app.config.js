// AngularJS App Configuration
var app = angular.module('logisticsApp', []);

// Range filter for pagination
app.filter('range', function() {
    return function(input, start, end) {
        var result = [];
        for (var i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    };
});

// API Configuration
app.constant('API_CONFIG', {
    BASE_URL: 'http://localhost:5257/api',  // Gateway URL hoặc TestAPI URL
    ENDPOINTS: {
        // Người dùng
        NGUOIDUNG: '/NguoiDung',
        NGUOIDUNG_GETBYID: '/NguoiDung/get-by-id',
        LOGIN: '/NguoiDung/login',
        
        // Đơn vận chuyển
        DONVANCHUYEN: '/DonVanChuyen',
        DONVANCHUYEN_SEARCH: '/DonVanChuyen/search',
        
        // Tài xế
        TAIXE: '/TaiXe',
        TAIXE_GETBYID: '/TaiXe/get-by-id',
        
        // Tuyến đường
        TUYENDUONG: '/TuyenDuong',
        
        // Giao dịch COD
        GIAODICHCOD: '/GiaoDichCOD',
        
        // Sự kiện trạng thái
        SUKIENTRANGTHAI: '/SuKienTrangThai',
        
        // Điểm giao hàng
        DIEMGIAOHANG: '/DiemGiaoHang'
    }
});

// HTTP Interceptor để xử lý lỗi và thêm token
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);

// Auth Interceptor
app.factory('authInterceptor', ['$q', '$window', function($q, $window) {
    return {
        request: function(config) {
            // Thêm token vào header nếu có
            var user = $window.sessionStorage.getItem('loggedInUser') || 
                      $window.localStorage.getItem('loggedInUser');
            
            if (user) {
                var userData = JSON.parse(user);
                if (userData.token) {
                    config.headers.Authorization = 'Bearer ' + userData.token;
                }
            }
            
            return config;
        },
        
        responseError: function(rejection) {
            // Xử lý lỗi 401 Unauthorized
            if (rejection.status === 401) {
                var currentPage = $window.location.pathname.split('/').pop();
                // Chỉ redirect về login nếu KHÔNG đang ở trang login
                if (currentPage !== 'login.html' && currentPage !== '') {
                    console.error('[AuthInterceptor] Unauthorized - redirecting to login');
                    $window.location.href = 'login.html';
                } else {
                    console.error('[AuthInterceptor] 401 error on login page - not redirecting');
                }
            }
            
            return $q.reject(rejection);
        }
    };
}]);

// Helper Functions
app.factory('utilsService', ['$window', function($window) {
    return {
        // Lưu user vào storage
        saveUser: function(userData, rememberMe) {
            var userJson = JSON.stringify(userData);
            if (rememberMe) {
                $window.localStorage.setItem('loggedInUser', userJson);
                $window.localStorage.setItem('currentUser', userJson);
                $window.localStorage.setItem('rememberMe', 'true');
            } else {
                $window.sessionStorage.setItem('loggedInUser', userJson);
                $window.localStorage.setItem('currentUser', userJson);
            }
        },
        
        // Lấy thông tin user
        getUser: function() {
            var userJson = $window.sessionStorage.getItem('loggedInUser') || 
                          $window.localStorage.getItem('loggedInUser');
            
            if (userJson) {
                return JSON.parse(userJson);
            }
            return null;
        },
        
        // Đăng xuất
        logout: function() {
            $window.sessionStorage.removeItem('loggedInUser');
            $window.localStorage.removeItem('loggedInUser');
            $window.localStorage.removeItem('currentUser');
            $window.localStorage.removeItem('rememberMe');
            $window.location.href = 'login.html';
        },
        
        // Kiểm tra quyền - Improved role checking
        checkRole: function(allowedRoles) {
            var user = this.getUser();
            console.log('[Auth] Checking role. User:', user, 'Allowed roles:', allowedRoles);
            
            if (!user) {
                console.log('[Auth] No user found, redirecting to login');
                alert('Vui lòng đăng nhập để tiếp tục!');
                $window.location.href = 'login.html';
                return false;
            }
            
            // Get role from different possible fields
            var userRole = (user.role || user.vaiTro || user.VaiTro || '').toLowerCase();
            
            // Normalize role names
            var roleMapping = {
                'taixe': 'driver',
                'tai xe': 'driver',
                'driver': 'driver',
                'khachhang': 'customer',
                'khach hang': 'customer',
                'customer': 'customer',
                'admin': 'admin',
                'quantri': 'admin',
                'quan tri': 'admin'
            };
            
            userRole = roleMapping[userRole] || userRole;
            console.log('[Auth] Normalized user role:', userRole);
            
            var normalizedAllowedRoles = allowedRoles ? allowedRoles.map(function(r) { 
                var normalized = r.toLowerCase();
                return roleMapping[normalized] || normalized;
            }) : [];
            
            if (normalizedAllowedRoles.length > 0 && normalizedAllowedRoles.indexOf(userRole) === -1) {
                console.log('[Auth] User role "' + userRole + '" not in allowed roles:', normalizedAllowedRoles);
                
                // Kiểm tra xem đang ở đúng trang chưa để tránh redirect loop
                var currentPage = $window.location.pathname.split('/').pop();
                var targetPage = '';
                
                switch(userRole) {
                    case 'admin':
                        targetPage = 'index.html';
                        break;
                    case 'driver':
                        targetPage = 'index-driver.html';
                        break;
                    case 'customer':
                        targetPage = 'index-customer.html';
                        break;
                    default:
                        targetPage = 'login.html';
                }
                
                // Chỉ redirect nếu chưa ở đúng trang
                if (currentPage !== targetPage) {
                    console.log('[Auth] Redirecting from', currentPage, 'to', targetPage);
                    $window.location.href = targetPage;
                } else {
                    console.log('[Auth] Already on correct page:', currentPage);
                }
                return false;
            }
            
            console.log('[Auth] Access granted for role:', user.role);
            return true;
        },
        
        // Format date
        formatDate: function(dateString) {
            if (!dateString) return '';
            var date = new Date(dateString);
            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
        },
        
        // Format datetime
        formatDateTime: function(dateString) {
            if (!dateString) return '';
            var date = new Date(dateString);
            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            var hours = ('0' + date.getHours()).slice(-2);
            var minutes = ('0' + date.getMinutes()).slice(-2);
            return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
        },
        
        // Format currency
        formatCurrency: function(amount) {
            if (!amount) return '0 đ';
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }
    };
}]);
