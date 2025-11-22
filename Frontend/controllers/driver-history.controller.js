// Driver History Controller - Hoàn chỉnh với API
app.controller('DriverHistoryController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[DriverHistory] Controller loaded - v2.0 with API');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[DriverHistory] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[DriverHistory] Error loading user:', e);
    }
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toLowerCase().trim();
    var isDriver = (userRole === 'driver' || userRole === 'taixe' || userRole === 'tai xe' || userRole === 'tài xế');
    var isAdmin = (userRole === 'admin' || userRole === 'quantri' || userRole === 'quản trị' || userRole === 'quan tri');
    
    if (!isDriver && !isAdmin) {
        alert('Bạn không có quyền truy cập trang này!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Initialize scope variables
    $scope.currentUser = currentUser;
    $scope.driverInfo = {}; // Will load from API
    $scope.loading = false;
    $scope.error = null;
    
    $scope.allHistory = [];
    $scope.filteredHistory = [];
    
    // Filter options
    $scope.filterStatus = 'all'; // all, delivered, failed
    $scope.filterDateRange = 'all'; // all, today, week, month
    $scope.searchText = '';
    
    // Date range
    $scope.dateFrom = '';
    $scope.dateTo = '';
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 15;
    $scope.totalPages = 1;
    
    // Stats
    $scope.stats = {
        total: 0,
        delivered: 0,
        failed: 0,
        successRate: 0,
        totalCOD: 0
    };
    
    // Get driver ID
    var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe || currentUser.idTaiXe || currentUser.driverId;
    
    console.log('[DriverHistory] Driver ID:', driverId);
    
    // Load all data
    $scope.loadData = function() {
        if (!driverId) {
            $scope.error = 'Không tìm thấy ID tài xế. Vui lòng đăng nhập lại.';
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[DriverHistory] Loading data for driver:', driverId);
        
        // Load driver info first
        apiService.getTaiXeById(driverId)
            .then(function(driver) {
                console.log('[DriverHistory] Driver info loaded:', driver);
                $scope.driverInfo = {
                    id: driver.id || driver.Id,
                    hoTen: driver.hoTen || driver.HoTen || '-',
                    soDienThoai: driver.soDienThoai || driver.SoDienThoai || '-',
                    loaiPhuongTien: driver.loaiPhuongTien || driver.LoaiPhuongTien || '-',
                    bienSoXe: driver.bienSoXe || driver.BienSoXe || '-'
                };
                
                // Load orders from API
                return apiService.getDonVanChuyenByTaiXe(driverId);
            })
            .then(function(orders) {
                console.log('[DriverHistory] Orders loaded:', orders.length);
                
                // Normalize and process orders
                var normalizedOrders = orders.map(function(order) {
                    return {
                        id: order.id || order.Id,
                        maVanDon: order.maVanDon || order.MaVanDon,
                        tenNguoiGui: order.tenNguoiGui || order.TenNguoiGui,
                        tenNguoiNhan: order.tenNguoiNhan || order.TenNguoiNhan,
                        sdtNguoiNhan: order.sdtNguoiNhan || order.SdtNguoiNhan,
                        diaChiGiaoHang: order.diaChiGiaoHang || order.DiaChiGiaoHang,
                        loaiHang: order.loaiHang || order.LoaiHang,
                        khoiLuong: order.khoiLuong || order.KhoiLuong,
                        tienThuHo: order.tienThuHo || order.TienThuHo || 0,
                        trangThai: order.trangThai || order.TrangThai,
                        thoiGianTao: order.thoiGianTao || order.ThoiGianTao,
                        thoiGianCapNhat: order.thoiGianCapNhat || order.ThoiGianCapNhat
                    };
                });
                
                // Filter completed orders (Đã giao hoặc Thất bại)
                $scope.allHistory = normalizedOrders.filter(function(order) {
                    return order.trangThai === 'Đã giao' || order.trangThai === 'Thất bại';
                });
                
                console.log('[DriverHistory] History orders:', $scope.allHistory.length);
                
                // Calculate stats
                calculateStats();
                
                // Apply filter
                applyFilters();
                
                $scope.loading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverHistory] Error loading orders:', error);
                $scope.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
                $scope.loading = false;
                $scope.$apply();
            });
    };
    
    // Calculate statistics
    function calculateStats() {
        $scope.stats = {
            total: $scope.allHistory.length,
            delivered: $scope.allHistory.filter(function(o) { return o.trangThai === 'Đã giao'; }).length,
            failed: $scope.allHistory.filter(function(o) { return o.trangThai === 'Thất bại'; }).length,
            successRate: 0,
            totalCOD: 0
        };
        
        if ($scope.stats.total > 0) {
            $scope.stats.successRate = Math.round(($scope.stats.delivered / $scope.stats.total) * 100);
        }
        
        $scope.stats.totalCOD = $scope.allHistory
            .filter(function(o) { return o.trangThai === 'Đã giao'; })
            .reduce(function(sum, o) { return sum + o.tienThuHo; }, 0);
    }
    
    // Apply filters
    function applyFilters() {
        var filtered = $scope.allHistory;
        
        // Filter by status
        if ($scope.filterStatus !== 'all') {
            filtered = filtered.filter(function(o) {
                if ($scope.filterStatus === 'delivered') return o.trangThai === 'Đã giao';
                if ($scope.filterStatus === 'failed') return o.trangThai === 'Thất bại';
                return true;
            });
        }
        
        // Filter by date range
        if ($scope.filterDateRange !== 'all') {
            var now = new Date();
            now.setHours(23, 59, 59, 999);
            
            var startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            
            if ($scope.filterDateRange === 'today') {
                // Today
            } else if ($scope.filterDateRange === 'week') {
                startDate.setDate(startDate.getDate() - 7);
            } else if ($scope.filterDateRange === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else if ($scope.filterDateRange === 'custom') {
                if ($scope.dateFrom) {
                    startDate = new Date($scope.dateFrom);
                    startDate.setHours(0, 0, 0, 0);
                }
                if ($scope.dateTo) {
                    now = new Date($scope.dateTo);
                    now.setHours(23, 59, 59, 999);
                }
            }
            
            filtered = filtered.filter(function(o) {
                var orderDate = new Date(o.thoiGianCapNhat || o.thoiGianTao);
                return orderDate >= startDate && orderDate <= now;
            });
        }
        
        // Filter by search text
        if ($scope.searchText) {
            var searchLower = $scope.searchText.toLowerCase();
            filtered = filtered.filter(function(o) {
                return (o.maVanDon && o.maVanDon.toLowerCase().includes(searchLower)) ||
                       (o.tenNguoiNhan && o.tenNguoiNhan.toLowerCase().includes(searchLower)) ||
                       (o.sdtNguoiNhan && o.sdtNguoiNhan.includes(searchLower));
            });
        }
        
        $scope.filteredHistory = filtered;
        $scope.totalPages = Math.ceil($scope.filteredHistory.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    }
    
    // Filter change
    $scope.onFilterChange = function() {
        applyFilters();
    };
    
    // Set quick date range
    $scope.setQuickRange = function(range) {
        $scope.filterDateRange = range;
        applyFilters();
    };
    
    // Get paginated orders
    $scope.getPaginatedOrders = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredHistory.slice(start, end);
    };
    
    // Pagination
    $scope.goToPage = function(page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
        }
    };
    
    $scope.getPageNumbers = function() {
        var pages = [];
        for (var i = 1; i <= $scope.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
    };
    
    // Get status badge class
    $scope.getStatusBadgeClass = function(status) {
        var statusMap = {
            'Đã giao': 'badge-success',
            'Thất bại': 'badge-danger'
        };
        return statusMap[status] || 'badge-secondary';
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            $window.location.href = 'login.html';
        }
    };
    
    // Navigate
    $scope.navigateTo = function(page) {
        $window.location.href = page;
    };
    
    // Get user initials
    $scope.getUserInitials = function() {
        if (!currentUser.fullName && !currentUser.username) return 'TX';
        var name = currentUser.fullName || currentUser.username;
        return name.substring(0, 2).toUpperCase();
    };
    
    // Initialize
    $timeout(function() {
        $scope.loadData();
    }, 100);
}]);
