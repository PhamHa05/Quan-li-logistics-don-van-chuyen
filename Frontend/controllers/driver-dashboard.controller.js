// Driver Dashboard Controller
app.controller('DriverDashboardController', ['$scope', '$timeout', '$window', 'apiService',
    function($scope, $timeout, $window, apiService) {
    
    console.log('='.repeat(50));
    console.log('[DriverDashboard] NEW CONTROLLER LOADED - v4.0 with API');
    console.log('='.repeat(50));
    
    // Get current user from localStorage
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        console.log('[DriverDashboard] User string from storage:', userStr);
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[DriverDashboard] Parsed user object:', JSON.stringify(currentUser, null, 2));
        }
    } catch (e) {
        console.error('[DriverDashboard] Error parsing user:', e);
    }
    
    if (!currentUser) {
        console.error('[DriverDashboard] NO USER FOUND - Redirecting to login');
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role - support Vietnamese and English
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toLowerCase().trim();
    console.log('[DriverDashboard] Original role from user object:', currentUser.role);
    console.log('[DriverDashboard] Normalized role:', userRole);
    
    // Check if user is driver or admin
    var isDriver = (userRole === 'driver' || 
                    userRole === 'taixe' || 
                    userRole === 'tai xe' || 
                    userRole === 'tài xế');
    
    var isAdmin = (userRole === 'admin' || 
                   userRole === 'quantri' || 
                   userRole === 'quản trị' ||
                   userRole === 'quan tri');
    
    console.log('[DriverDashboard] Is Driver?', isDriver);
    console.log('[DriverDashboard] Is Admin?', isAdmin);
    
    if (!isDriver && !isAdmin) {
        console.error('[DriverDashboard] ACCESS DENIED - Role:', userRole);
        console.error('[DriverDashboard] User is neither driver nor admin');
        alert('Bạn không có quyền truy cập trang tài xế!\nRole hiện tại: ' + userRole);
        $window.location.href = 'login.html';
        return;
    }
    
    console.log('[DriverDashboard] ✓ ACCESS GRANTED - User authenticated as driver/admin');
    console.log('='.repeat(50));
    
    // Initialize scope variables
    $scope.currentUser = currentUser;
    $scope.driverInfo = {}; // Will load from API
    
    $scope.stats = {
        todayOrders: 0,
        deliveringOrders: 0,
        completedOrders: 0,
        codCollected: 0,
        totalOrders: 0,
        pendingOrders: 0
    };
    
    $scope.statsToday = {
        total: 0,
        delivered: 0,
        failed: 0,
        cod: 0
    };
    
    $scope.statsWeek = {
        total: 0,
        success: 0,
        successRate: 0,
        failed: 0,
        cod: 0
    };
    
    $scope.statsMonth = {
        total: 0,
        success: 0,
        successRate: 0,
        failed: 0,
        cod: 0
    };
    
    $scope.codStats = {
        totalCollected: 0,
        notSubmitted: 0,
        submitted: 0
    };
    
    $scope.pendingOrders = [];
    $scope.recentActivities = [];
    $scope.loading = true;
    $scope.error = null;
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Get status badge class
    $scope.getStatusBadgeClass = function(status) {
        var statusMap = {
            'Chờ lấy hàng': 'badge-warning',
            'Đang giao': 'badge-primary',
            'Đã giao': 'badge-success',
            'Thất bại': 'badge-danger',
            'Đã hủy': 'badge-secondary'
        };
        return statusMap[status] || 'badge-secondary';
    };
    
    // Load all data from API
    $scope.loadData = function() {
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[DriverDashboard] Loading data from API for user:', currentUser);
        
        // Get driver ID - try multiple fields
        var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe || currentUser.idTaiXe || currentUser.driverId;
        
        if (!driverId) {
            console.error('[DriverDashboard] No driver ID found in user object:', currentUser);
            // Try to find driver by other fields
            loadDriverByAlternativeFields();
            return;
        }
        
        console.log('[DriverDashboard] Loading data for driver ID:', driverId);
        
        // Load driver info first
        apiService.getTaiXeById(driverId)
            .then(function(driver) {
                console.log('[DriverDashboard] Driver info loaded:', driver);
                $scope.driverInfo = {
                    id: driver.id || driver.Id,
                    hoTen: driver.hoTen || driver.HoTen || '-',
                    soDienThoai: driver.soDienThoai || driver.SoDienThoai || '-',
                    loaiPhuongTien: driver.loaiPhuongTien || driver.LoaiPhuongTien || '-',
                    bienSoXe: driver.bienSoXe || driver.BienSoXe || '-',
                    dangSanSang: driver.dangSanSang || driver.DangSanSang || false
                };
                console.log('[DriverDashboard] Driver info mapped:', $scope.driverInfo);
                
                // Load dashboard stats
                return apiService.getDashboardStats(driverId);
            })
            .then(function(response) {
                console.log('[DriverDashboard] Dashboard stats loaded:', response);
                updateStatsFromAPI(response);
                return apiService.getDonVanChuyenByTaiXe(driverId);
            })
            .then(function(orders) {
                console.log('[DriverDashboard] Orders loaded:', orders.length);
                updateOrderLists(orders);
                $scope.loading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverDashboard] Error loading data:', error);
                $scope.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
                $scope.loading = false;
                // Fallback to localStorage if API fails
                loadFromLocalStorage();
                $scope.$apply();
            });
    };
    
    // Load driver info by alternative fields (username, email, phone)
    function loadDriverByAlternativeFields() {
        console.log('[DriverDashboard] Trying to find driver by alternative fields...');
        
        apiService.getAllTaiXe()
            .then(function(drivers) {
                console.log('[DriverDashboard] All drivers:', drivers);
                
                var driver = drivers.find(function(d) {
                    return d.soDienThoai === currentUser.phone ||
                           d.SoDienThoai === currentUser.phoneNumber ||
                           d.hoTen === currentUser.fullName ||
                           d.HoTen === currentUser.fullName;
                });
                
                if (driver) {
                    console.log('[DriverDashboard] Found driver:', driver);
                    var driverId = driver.id || driver.Id;
                    currentUser.id = driverId;
                    currentUser.maTaiXe = driverId;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    $scope.loadData(); // Retry with found ID
                } else {
                    console.error('[DriverDashboard] Driver not found in database');
                    $scope.error = 'Không tìm thấy thông tin tài xế trong hệ thống.';
                    $scope.loading = false;
                    loadFromLocalStorage(); // Fallback
                    $scope.$apply();
                }
            })
            .catch(function(error) {
                console.error('[DriverDashboard] Error finding driver:', error);
                $scope.error = 'Lỗi kết nối đến server.';
                $scope.loading = false;
                loadFromLocalStorage(); // Fallback
                $scope.$apply();
            });
    }
    
    // Update stats from API response
    function updateStatsFromAPI(apiStats) {
        console.log('[DriverDashboard] Updating stats from API. Raw response:', apiStats);
        
        // Map API response to scope variables - handle both camelCase and PascalCase
        $scope.stats = {
            todayOrders: apiStats.todayOrders || apiStats.TodayOrders || 0,
            deliveringOrders: apiStats.deliveringOrders || apiStats.DeliveringOrders || 0,
            completedOrders: apiStats.completedOrders || apiStats.CompletedOrders || 0,
            codCollected: apiStats.codCollected || apiStats.CodCollected || 0,
            totalOrders: apiStats.totalOrders || apiStats.TotalOrders || 0,
            pendingOrders: apiStats.pendingOrders || apiStats.PendingOrders || 0
        };
        
        console.log('[DriverDashboard] Stats updated:', $scope.stats);
        
        var statsToday = apiStats.statsToday || apiStats.StatsToday || {};
        $scope.statsToday = {
            total: statsToday.total || statsToday.Total || 0,
            delivered: statsToday.delivered || statsToday.Delivered || 0,
            failed: statsToday.failed || statsToday.Failed || 0,
            cod: statsToday.cod || statsToday.Cod || 0
        };
        
        var statsWeek = apiStats.statsWeek || apiStats.StatsWeek || {};
        $scope.statsWeek = {
            total: statsWeek.total || statsWeek.Total || 0,
            success: statsWeek.success || statsWeek.Success || 0,
            successRate: statsWeek.successRate || statsWeek.SuccessRate || 0,
            failed: statsWeek.failed || statsWeek.Failed || 0,
            cod: statsWeek.cod || statsWeek.Cod || 0
        };
        
        var statsMonth = apiStats.statsMonth || apiStats.StatsMonth || {};
        $scope.statsMonth = {
            total: statsMonth.total || statsMonth.Total || 0,
            success: statsMonth.success || statsMonth.Success || 0,
            successRate: statsMonth.successRate || statsMonth.SuccessRate || 0,
            failed: statsMonth.failed || statsMonth.Failed || 0,
            cod: statsMonth.cod || statsMonth.Cod || 0
        };
        
        var codStats = apiStats.codStats || apiStats.CodStats || {};
        $scope.codStats = {
            totalCollected: codStats.totalCollected || codStats.TotalCollected || 0,
            notSubmitted: codStats.notSubmitted || codStats.NotSubmitted || 0,
            submitted: codStats.submitted || codStats.Submitted || 0
        };
        
        console.log('[DriverDashboard] All stats mapped successfully');
    }
    
    // Update order lists from API
    function updateOrderLists(orders) {
        console.log('[DriverDashboard] Updating order lists. Raw orders:', orders);
        
        // Check if orders is array
        if (!Array.isArray(orders)) {
            console.error('[DriverDashboard] Orders is not an array:', orders);
            orders = [];
        }
        
        // Normalize order data
        var normalizedOrders = orders.map(function(order) {
            var normalized = {
                id: order.id || order.Id,
                orderCode: order.maVanDon || order.MaVanDon || order.id,
                receiverName: order.tenNguoiNhan || order.TenNguoiNhan || '-',
                receiverAddress: order.diaChiGiaoHang || order.DiaChiGiaoHang || '-',
                codAmount: order.tienThuHo || order.TienThuHo || 0,
                status: order.trangThai || order.TrangThai || 'Chờ lấy hàng',
                createdAt: order.thoiGianTao || order.ThoiGianTao || new Date().toISOString(),
                updatedAt: order.thoiGianCapNhat || order.ThoiGianCapNhat || new Date().toISOString()
            };
            return normalized;
        });
        
        console.log('[DriverDashboard] Normalized orders:', normalizedOrders.length);
        
        // Get pending orders (Chờ lấy hàng, Đang giao)
        $scope.pendingOrders = normalizedOrders
            .filter(function(o) { 
                return o.status === 'Chờ lấy hàng' || o.status === 'Đang giao'; 
            })
            .slice(0, 5);
        
        console.log('[DriverDashboard] Pending orders:', $scope.pendingOrders.length);
        
        // Get recent activities (Đã giao, Thất bại)
        $scope.recentActivities = normalizedOrders
            .filter(function(o) { 
                return o.status === 'Đã giao' || o.status === 'Thất bại'; 
            })
            .sort(function(a, b) { 
                return new Date(b.updatedAt) - new Date(a.updatedAt); 
            })
            .slice(0, 10);
        
        console.log('[DriverDashboard] Recent activities:', $scope.recentActivities.length);
    }
    
    // Fallback: Load from localStorage if API fails
    function loadFromLocalStorage() {
        console.log('[DriverDashboard] Falling back to localStorage...');
        try {
            var drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
            var driverInfo = drivers.find(function(d) {
                return d.email === currentUser.email || 
                       d.username === currentUser.username ||
                       d.name === currentUser.fullName;
            });
            
            if (driverInfo) {
                $scope.driverInfo = {
                    vehicleNumber: driverInfo.vehiclePlate || driverInfo.vehicleNumber || '-',
                    licenseNumber: driverInfo.driverLicense || driverInfo.licenseNumber || '-',
                    phone: driverInfo.phone || driverInfo.phoneNumber || currentUser.phone || '-'
                };
            }
            
            var allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            var myOrders = allOrders.filter(function(order) {
                return order.driver === currentUser.username || 
                       order.driver === currentUser.fullName ||
                       order.driverEmail === currentUser.email ||
                       order.assignedDriver === currentUser.username;
            });
            
            console.log('[DriverDashboard] Loaded from localStorage:', myOrders.length, 'orders');
            calculateStatsFromOrders(myOrders);
            
            $scope.pendingOrders = myOrders
                .filter(function(o) { return o.status === 'Chờ lấy hàng' || o.status === 'Đang giao'; })
                .slice(0, 5);
            
            $scope.recentActivities = myOrders
                .filter(function(o) { return o.status === 'Đã giao' || o.status === 'Thất bại'; })
                .sort(function(a, b) { 
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt); 
                })
                .slice(0, 10);
                
        } catch (e) {
            console.error('[DriverDashboard] Error loading from localStorage:', e);
        }
    }
    
    // Calculate statistics from orders (localStorage fallback)
    function calculateStatsFromOrders(orders) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        
        var weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        var monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        var todayOrders = orders.filter(function(o) {
            var orderDate = new Date(o.createdAt || o.orderDate);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });
        
        $scope.stats.todayOrders = todayOrders.length;
        $scope.stats.deliveringOrders = orders.filter(function(o) { return o.status === 'Đang giao'; }).length;
        $scope.stats.completedOrders = todayOrders.filter(function(o) { return o.status === 'Đã giao'; }).length;
        
        var todayCOD = todayOrders
            .filter(function(o) { return o.status === 'Đã giao' && o.codAmount > 0; })
            .reduce(function(sum, o) { return sum + (o.codAmount || 0); }, 0);
        $scope.stats.codCollected = todayCOD;
        
        $scope.statsToday = {
            total: todayOrders.length,
            delivered: todayOrders.filter(function(o) { return o.status === 'Đã giao'; }).length,
            failed: todayOrders.filter(function(o) { return o.status === 'Thất bại'; }).length,
            cod: todayCOD
        };
        
        var weekOrders = orders.filter(function(o) {
            var orderDate = new Date(o.createdAt || o.orderDate);
            return orderDate >= weekAgo;
        });
        
        var weekSuccess = weekOrders.filter(function(o) { return o.status === 'Đã giao'; }).length;
        $scope.statsWeek = {
            total: weekOrders.length,
            success: weekSuccess,
            successRate: weekOrders.length > 0 ? Math.round((weekSuccess / weekOrders.length) * 100) : 0,
            failed: weekOrders.filter(function(o) { return o.status === 'Thất bại'; }).length,
            cod: weekOrders
                .filter(function(o) { return o.status === 'Đã giao' && o.codAmount > 0; })
                .reduce(function(sum, o) { return sum + (o.codAmount || 0); }, 0)
        };
        
        var monthOrders = orders.filter(function(o) {
            var orderDate = new Date(o.createdAt || o.orderDate);
            return orderDate >= monthAgo;
        });
        
        var monthSuccess = monthOrders.filter(function(o) { return o.status === 'Đã giao'; }).length;
        $scope.statsMonth = {
            total: monthOrders.length,
            success: monthSuccess,
            successRate: monthOrders.length > 0 ? Math.round((monthSuccess / monthOrders.length) * 100) : 0,
            failed: monthOrders.filter(function(o) { return o.status === 'Thất bại'; }).length,
            cod: monthOrders
                .filter(function(o) { return o.status === 'Đã giao' && o.codAmount > 0; })
                .reduce(function(sum, o) { return sum + (o.codAmount || 0); }, 0)
        };
        
        var totalCollected = orders
            .filter(function(o) { return o.status === 'Đã giao' && o.codAmount > 0; })
            .reduce(function(sum, o) { return sum + (o.codAmount || 0); }, 0);
        
        var submitted = orders
            .filter(function(o) { return o.status === 'Đã giao' && o.codAmount > 0 && o.codSubmitted; })
            .reduce(function(sum, o) { return sum + (o.codAmount || 0); }, 0);
        
        $scope.codStats = {
            totalCollected: totalCollected,
            notSubmitted: totalCollected - submitted,
            submitted: submitted
        };
        
        $scope.stats.totalOrders = orders.length;
        $scope.stats.pendingOrders = orders.filter(function(o) {
            return o.status === 'Chờ lấy hàng' || o.status === 'Đang giao';
        }).length;
    }
    
    // Refresh dashboard
    $scope.refresh = function() {
        $scope.loadData();
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        }
    };
    
    // Navigate to page
    $scope.navigateTo = function(page) {
        window.location.href = page;
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
    };
    
    // Get user initials
    $scope.getUserInitials = function() {
        if (!currentUser.fullName && !currentUser.username) return 'TX';
        var name = currentUser.fullName || currentUser.username;
        return name.substring(0, 2).toUpperCase();
    };
    
    // Initialize - call loadData
    $timeout(function() {
        $scope.loadData();
    }, 100);
}]);
