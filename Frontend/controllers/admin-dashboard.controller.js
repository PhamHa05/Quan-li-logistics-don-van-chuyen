// Admin Dashboard Controller - AngularJS
app.controller('AdminDashboardController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    console.log('[AdminDashboard] Controller initializing...');
    
    // Get current user
    var currentUser = utilsService.getUser();
    if (!currentUser) {
        console.log('[AdminDashboard] No user found, redirecting to login');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check if user is admin - SILENT redirect if not
    var userRole = String(currentUser.role || currentUser.vaiTro || '').toLowerCase().trim();
    var roleMap = {
        'taixe': 'driver',
        'tai xe': 'driver',
        'driver': 'driver',
        'khach': 'customer',
        'khachhang': 'customer',
        'khach hang': 'customer',
        'customer': 'customer',
        'admin': 'admin',
        'quantri': 'admin'
    };
    var normalizedRole = roleMap[userRole] || userRole;
    
    console.log('[AdminDashboard] User role:', userRole, '→ normalized:', normalizedRole);
    
    // If not admin, redirect silently WITHOUT alert
    if (normalizedRole !== 'admin') {
        console.log('[AdminDashboard] User is not admin, redirecting to appropriate page...');
        switch(normalizedRole) {
            case 'driver':
                $window.location.href = 'index-driver.html';
                break;
            case 'customer':
                $window.location.href = 'index-customer.html';
                break;
            default:
                $window.location.href = 'login.html';
        }
        return;
    }
    
    console.log('[AdminDashboard] Access granted, initializing...');
    
    // Initialize
    $scope.currentUser = utilsService.getUser();
    console.log('[Dashboard] Current user:', $scope.currentUser);
    $scope.isLoading = false;
    
    // Dashboard statistics
    $scope.stats = {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalDrivers: 0,
        activeDrivers: 0,
        totalRevenue: 0,
        totalCOD: 0
    };
    
    // Recent orders
    $scope.recentOrders = [];
    
    // Charts data
    $scope.chartData = {
        ordersByStatus: [],
        revenueByMonth: []
    };
    
    // Load dashboard data
    $scope.loadDashboard = function() {
        $scope.isLoading = true;
        console.log('[Dashboard] Loading data...');
        
        // Load orders
        apiService.getAllDonVanChuyen()
            .then(function(orders) {
                console.log('[Dashboard] Orders loaded:', orders);
                
                // Check if orders is array or object with data property
                if (!Array.isArray(orders)) {
                    console.warn('[Dashboard] Orders is not array, extracting data property');
                    orders = [];
                }
                
                $scope.stats.totalOrders = orders.length;
                $scope.stats.pendingOrders = orders.filter(function(o) {
                    var status = o.trangThai || o.TrangThai || '';
                    return status === 'CHO_LAY_HANG' || status === 'pending' || status === 'confirmed'; 
                }).length;
                $scope.stats.completedOrders = orders.filter(function(o) {
                    var status = o.trangThai || o.TrangThai || '';
                    return status === 'GIAO_THANH_CONG' || status === 'delivered'; 
                }).length;
                
                // Calculate revenue from completed orders
                $scope.stats.totalRevenue = orders.reduce(function(sum, order) {
                    var status = order.trangThai || order.TrangThai || '';
                    if (status === 'GIAO_THANH_CONG' || status === 'delivered') {
                        // Database doesn't have PhiVanChuyen, estimate from TienThuHo
                        var codAmount = order.tienThuHo || order.TienThuHo || 0;
                        return sum + (codAmount * 0.1); // Assume 10% shipping fee
                    }
                    return sum;
                }, 0);
                
                // Calculate COD
                $scope.stats.totalCOD = orders.reduce(function(sum, order) {
                    return sum + (order.tienThuHo || order.TienThuHo || 0);
                }, 0);
                
                // Get recent orders (last 5)
                $scope.recentOrders = orders
                    .sort(function(a, b) { 
                        var dateA = new Date(a.ngayTao || a.NgayTao);
                        var dateB = new Date(b.ngayTao || b.NgayTao);
                        return dateB - dateA; 
                    })
                    .slice(0, 5);
                
                // Prepare chart data - orders by status
                var statusCounts = {};
                orders.forEach(function(order) {
                    var status = order.trangThai || order.TrangThai || 'unknown';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                
                $scope.chartData.ordersByStatus = Object.keys(statusCounts).map(function(status) {
                    return {
                        status: $scope.getStatusText(status),
                        count: statusCounts[status]
                    };
                });
                
                console.log('[Dashboard] Stats:', $scope.stats);
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('[Dashboard] Error loading orders:', error);
                alert('Không thể tải dữ liệu đơn hàng. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
        
        // Load drivers
        apiService.getAllTaiXe()
            .then(function(drivers) {
                console.log('[Dashboard] Drivers loaded:', drivers);
                
                // Check if drivers is array
                if (!Array.isArray(drivers)) {
                    console.warn('[Dashboard] Drivers is not array, extracting data property');
                    drivers = [];
                }
                
                $scope.stats.totalDrivers = drivers.length;
                $scope.stats.activeDrivers = drivers.filter(function(d) {
                    var dangSanSang = d.dangSanSang || d.DangSanSang;
                    return dangSanSang === true;
                }).length;
            })
            .catch(function(error) {
                console.error('[Dashboard] Error loading drivers:', error);
            });
        
        // Load routes
        apiService.getAllTuyenDuong()
            .then(function(routes) {
                console.log('[Dashboard] Routes loaded:', routes);
                
                // Check if routes is array
                if (!Array.isArray(routes)) {
                    console.warn('[Dashboard] Routes is not array');
                    routes = [];
                }
                
                $scope.stats.routesPlanning = routes.filter(function(r) {
                    return r.trangThai === 'DA_LAP_KE_HOACH';
                }).length;
                $scope.stats.routesActive = routes.filter(function(r) {
                    return r.trangThai === 'DANG_GIAO';
                }).length;
                $scope.stats.routesCompleted = routes.filter(function(r) {
                    return r.trangThai === 'HOAN_THANH';
                }).length;
            })
            .catch(function(error) {
                console.error('[Dashboard] Error loading routes:', error);
            });
    };
    
    // Get status text - Map từ database status (tiếng Việt không dấu)
    $scope.getStatusText = function(status) {
        var statusMap = {
            // Database statuses (Vietnamese without diacritics)
            'CHO_LAY_HANG': 'Chờ lấy hàng',
            'DA_LAY_HANG': 'Đã lấy hàng',
            'DANG_GIAO': 'Đang giao',
            'GIAO_THANH_CONG': 'Giao thành công',
            'THAT_BAI': 'Thất bại',
            // English versions for compatibility
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'picking': 'Đang lấy hàng',
            'picked': 'Đã lấy hàng',
            'in_transit': 'Đang vận chuyển',
            'delivering': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'failed': 'Giao thất bại',
            'cancelled': 'Đã hủy',
            'returned': 'Hoàn trả'
        };
        return statusMap[status] || status;
    };
    
    // Get status class
    $scope.getStatusClass = function(status) {
        var statusClassMap = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'picking': 'status-picking',
            'picked': 'status-picked',
            'in_transit': 'status-in-transit',
            'delivering': 'status-delivering',
            'delivered': 'status-delivered',
            'failed': 'status-failed',
            'cancelled': 'status-cancelled',
            'returned': 'status-returned'
        };
        return statusClassMap[status] || '';
    };
    
    // View order details
    $scope.viewOrder = function(orderId) {
        $window.location.href = 'admin-orders.html?id=' + orderId;
    };
    
    // Format currency
    $scope.formatCurrency = utilsService.formatCurrency;
    
    // Format date
    $scope.formatDate = utilsService.formatDate;
    $scope.formatDateTime = utilsService.formatDateTime;
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load dashboard on init
    $scope.loadDashboard();
}]);
