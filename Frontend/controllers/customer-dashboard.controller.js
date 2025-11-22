// Customer Dashboard Controller
app.controller('CustomerDashboardController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerDashboard] Controller loaded - v1.0 with API');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerDashboard] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerDashboard] Error loading user:', e);
    }
    
    if (!currentUser) {
        console.error('[CustomerDashboard] No user found - redirecting to login');
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toUpperCase().trim();
    var isCustomer = (userRole === 'CUSTOMER' || userRole === 'KHACHHANG' || userRole === 'KHACH HANG' || userRole === 'KHACH');
    var isAdmin = (userRole === 'ADMIN' || userRole === 'QUANTRI');
    
    console.log('[CustomerDashboard] Role check - userRole:', userRole, 'isCustomer:', isCustomer, 'isAdmin:', isAdmin);
    
    if (!isCustomer && !isAdmin) {
        console.error('[CustomerDashboard] Access denied for role:', userRole);
        alert('Bạn không có quyền truy cập trang này!');
        
        // Redirect về đúng trang theo role thay vì login
        if (userRole === 'TAIXE' || userRole === 'TAI XE' || userRole === 'DRIVER') {
            $window.location.href = 'index-driver.html';
        } else {
            $window.location.href = 'login.html';
        }
        return;
    }
    
    console.log('[CustomerDashboard] Access granted - continuing...');
    
    // Initialize scope
    $scope.currentUser = currentUser;
    $scope.customerInfo = {};
    $scope.loading = false;
    $scope.error = null;
    
    $scope.stats = {
        totalOrders: 0,
        pendingOrders: 0,
        deliveringOrders: 0,
        completedOrders: 0,
        failedOrders: 0,
        totalCOD: 0
    };
    
    $scope.recentOrders = [];
    
    // Load customer data
    $scope.loadData = function() {
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[CustomerDashboard] ========== LOADING DATA ==========');
        console.log('[CustomerDashboard] Current user:', currentUser);
        console.log('[CustomerDashboard] User ID:', currentUser.id || currentUser.userId);
        console.log('[CustomerDashboard] User phone:', currentUser.phone || currentUser.soDienThoai);
        console.log('[CustomerDashboard] User name:', currentUser.fullName || currentUser.hoTen);
        
        // Get customer ID
        var customerId = currentUser.id || currentUser.userId || currentUser.maNguoiDung || currentUser.MaNguoiDung;
        
        // Load customer info from NguoiDung API
        if (customerId) {
            apiService.getNguoiDungById(customerId)
                .then(function(customer) {
                    console.log('[CustomerDashboard] Customer info loaded:', customer);
                    $scope.customerInfo = {
                        id: customer.maNguoiDung || customer.MaNguoiDung,
                        hoTen: customer.hoTen || customer.HoTen || '-',
                        email: customer.email || customer.Email || '-',
                        soDienThoai: customer.soDienThoai || customer.SoDienThoai || '-',
                        diaChi: customer.diaChi || customer.DiaChi || '-'
                    };
                })
                .catch(function(error) {
                    console.error('[CustomerDashboard] Error loading customer info:', error);
                });
        }
        
        // Load all orders and filter by customer phone/email
        apiService.getAllDonVanChuyen()
            .then(function(allOrders) {
                console.log('[CustomerDashboard] All orders loaded:', allOrders ? allOrders.length : 0);
                
                // Ensure allOrders is an array
                if (!Array.isArray(allOrders)) {
                    console.warn('[CustomerDashboard] allOrders is not an array:', allOrders);
                    allOrders = [];
                }
                
                // Filter orders by customer (match by phone or name)
                var customerPhone = currentUser.phone || currentUser.soDienThoai || currentUser.SoDienThoai;
                var customerName = currentUser.fullName || currentUser.hoTen || currentUser.HoTen;
                
                console.log('[CustomerDashboard] Filtering by phone:', customerPhone, 'or name:', customerName);
                
                var myOrders = allOrders.filter(function(order) {
                    var orderPhone = order.sdtNguoiGui || order.SdtNguoiGui || '';
                    var orderName = order.tenNguoiGui || order.TenNguoiGui || '';
                    return orderPhone === customerPhone || orderName === customerName;
                });
                
                console.log('[CustomerDashboard] My orders:', myOrders.length);
                
                // Calculate stats
                $scope.stats.totalOrders = myOrders.length;
                
                myOrders.forEach(function(order) {
                    var status = order.trangThai || order.TrangThai || '';
                    switch(status) {
                        case 'CHO_LAY_HANG':
                            $scope.stats.pendingOrders++;
                            break;
                        case 'DA_LAY_HANG':
                        case 'DANG_GIAO':
                            $scope.stats.deliveringOrders++;
                            break;
                        case 'GIAO_THANH_CONG':
                            $scope.stats.completedOrders++;
                            $scope.stats.totalCOD += (order.tienThuHo || order.TienThuHo || 0);
                            break;
                        case 'THAT_BAI':
                            $scope.stats.failedOrders++;
                            break;
                    }
                });
                
                // Get recent orders (last 5)
                $scope.recentOrders = myOrders
                    .sort(function(a, b) {
                        var dateA = new Date(a.thoiGianTao || a.ThoiGianTao);
                        var dateB = new Date(b.thoiGianTao || b.ThoiGianTao);
                        return dateB - dateA;
                    })
                    .slice(0, 5)
                    .map(function(order) {
                        return {
                            id: order.id || order.Id,
                            maVanDon: order.maVanDon || order.MaVanDon,
                            tenNguoiNhan: order.tenNguoiNhan || order.TenNguoiNhan,
                            diaChiGiaoHang: order.diaChiGiaoHang || order.DiaChiGiaoHang,
                            trangThai: order.trangThai || order.TrangThai,
                            thoiGianTao: order.thoiGianTao || order.ThoiGianTao,
                            tienThuHo: order.tienThuHo || order.TienThuHo
                        };
                    });
                
                $scope.loading = false;
                console.log('[CustomerDashboard] Data loaded successfully');
                
                // Try to apply if not already in digest cycle
                if (!$scope.$$phase) {
                    try {
                        $scope.$apply();
                    } catch (e) {
                        console.log('[CustomerDashboard] Already in digest');
                    }
                }
            })
            .catch(function(error) {
                console.error('[CustomerDashboard] Error loading orders:', error);
                console.error('[CustomerDashboard] Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    data: error.data
                });
                
                // Only show error if it's a real error (not 404 or no data)
                if (error && error.status && error.status !== 404) {
                    $scope.error = 'Không thể kết nối đến server. Vui lòng kiểm tra API đang chạy.';
                } else {
                    // No error, just no data
                    console.log('[CustomerDashboard] No orders found, but no error');
                    $scope.error = null;
                }
                
                $scope.loading = false;
                
                // Try to apply if not already in digest cycle
                if (!$scope.$$phase) {
                    try {
                        $scope.$apply();
                    } catch (e) {
                        console.log('[CustomerDashboard] Already in digest');
                    }
                }
            });
    };
    
    // Get status text
    $scope.getStatusText = function(status) {
        var statusMap = {
            'CHO_LAY_HANG': 'Chờ lấy hàng',
            'DA_LAY_HANG': 'Đã lấy hàng',
            'DANG_GIAO': 'Đang giao',
            'GIAO_THANH_CONG': 'Giao thành công',
            'THAT_BAI': 'Thất bại'
        };
        return statusMap[status] || status;
    };
    
    // Get status badge class
    $scope.getStatusBadgeClass = function(status) {
        var classMap = {
            'CHO_LAY_HANG': 'badge-warning',
            'DA_LAY_HANG': 'badge-info',
            'DANG_GIAO': 'badge-primary',
            'GIAO_THANH_CONG': 'badge-success',
            'THAT_BAI': 'badge-danger'
        };
        return classMap[status] || 'badge-secondary';
    };
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
    };
    
    // Get user initials
    $scope.getUserInitials = function() {
        var name = $scope.customerInfo.hoTen || currentUser.fullName || currentUser.username || 'KH';
        return name.substring(0, 2).toUpperCase();
    };
    
    // Navigate to page
    $scope.navigateTo = function(page) {
        $window.location.href = page;
    };
    
    // View order details
    $scope.viewOrder = function(orderId) {
        $window.location.href = 'customer-my-orders.html?id=' + orderId;
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            $window.location.href = 'login.html';
        }
    };
    
    // Load data on init
    $timeout(function() {
        $scope.loadData();
    }, 100);
}]);
