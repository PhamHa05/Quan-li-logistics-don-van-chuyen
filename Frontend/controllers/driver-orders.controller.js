// Driver Orders Controller - AngularJS Complete Version
app.controller('DriverOrdersController', ['$scope', '$window', '$http', '$timeout', 'API_CONFIG',
    function($scope, $window, $http, $timeout, API_CONFIG) {
    
    console.log('==================================================');
    console.log('[DriverOrders] Controller initialized');
    console.log('[DriverOrders] API Base URL:', API_CONFIG.BASE_URL);
    console.log('==================================================');
    
    // Get current user from storage
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('[DriverOrders] Error loading user:', e);
    }
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role - support Vietnamese and English roles
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toLowerCase().trim();
    var roleMap = {
        'taixe': 'driver',
        'tai xe': 'driver',
        'driver': 'driver',
        'admin': 'admin',
        'quantri': 'admin'
    };
    var normalizedRole = roleMap[userRole] || userRole;
    
    console.log('[DriverOrders] User:', currentUser.username || currentUser.tenDangNhap, 'Role:', userRole, '→', normalizedRole);
    
    if (normalizedRole !== 'driver' && normalizedRole !== 'admin') {
        console.error('[DriverOrders] Access denied for role:', normalizedRole);
        $window.location.href = normalizedRole === 'customer' ? 'index-customer.html' : 'login.html';
        return;
    }
    
    // Initialize scope variables
    $scope.currentUser = currentUser;
    $scope.driverInfo = {}; // Will load from API
    $scope.orders = [];
    $scope.filteredOrders = [];
    $scope.paginatedOrders = [];
    $scope.isLoading = false;
    $scope.selectedOrder = null;
    $scope.showDetailModal = false;
    
    // Statistics
    $scope.stats = {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        failedOrders: 0,
        totalCOD: 0
    };
    
    // Search and filter
    $scope.searchText = '';
    $scope.filterStatus = '';
    $scope.filterDate = '';
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Status options
    $scope.statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'CHO_LAY_HANG', label: 'Chờ lấy hàng' },
        { value: 'DA_LAY_HANG', label: 'Đã lấy hàng' },
        { value: 'DANG_GIAO', label: 'Đang giao' },
        { value: 'GIAO_THANH_CONG', label: 'Giao thành công' },
        { value: 'THAT_BAI', label: 'Thất bại' }
    ];
    
    // ==================== UTILITY FUNCTIONS ====================
    
    // Format currency (Vietnamese)
    $scope.formatCurrency = function(amount) {
        if (!amount || amount === 0) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };
    
    // Format date and time
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        try {
            var date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('vi-VN') + ' ' + 
                   date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return '-';
        }
    };
    
    // Get status badge CSS class
    $scope.getStatusBadgeClass = function(status) {
        var statusMap = {
            'CHO_LAY_HANG': 'badge-warning',
            'DA_LAY_HANG': 'badge-info',
            'DANG_GIAO': 'badge-primary',
            'GIAO_THANH_CONG': 'badge-success',
            'THAT_BAI': 'badge-danger'
        };
        return statusMap[status] || 'badge-secondary';
    };
    
    // Get Vietnamese status label
    $scope.getStatusLabel = function(status) {
        var labels = {
            'CHO_LAY_HANG': 'Chờ lấy hàng',
            'DA_LAY_HANG': 'Đã lấy hàng',
            'DANG_GIAO': 'Đang giao',
            'GIAO_THANH_CONG': 'Giao thành công',
            'THAT_BAI': 'Thất bại'
        };
        return labels[status] || status;
    };
    
    // ==================== DATA LOADING ====================
    
    // Load driver info first
    var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe || currentUser.idTaiXe || currentUser.driverId;
    
    if (driverId) {
        $http.get(API_CONFIG.BASE_URL + '/api/TaiXe/get-by-id/' + driverId)
            .then(function(response) {
                var driver = response.data;
                $scope.driverInfo = {
                    hoTen: driver.hoTen || driver.HoTen || '-',
                    soDienThoai: driver.soDienThoai || driver.SoDienThoai || '-',
                    bienSoXe: driver.bienSoXe || driver.BienSoXe || '-'
                };
                console.log('[DriverOrders] Driver info loaded:', $scope.driverInfo);
            })
            .catch(function(error) {
                console.error('[DriverOrders] Error loading driver info:', error);
            });
    }
    
    // Load orders from API
    $scope.loadOrders = function() {
        $scope.isLoading = true;
        console.log('[DriverOrders] Loading orders from API...');
        
        var searchRequest = {
            PageIndex: 1,
            PageSize: 1000,
            MaVanDon: "",
            TrangThai: ""
        };
        
        $http.post(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DONVANCHUYEN_SEARCH, searchRequest)
            .then(function(response) {
                console.log('[DriverOrders] API response:', response.data);
                var allOrders = response.data.data || response.data.Data || [];
                console.log('[DriverOrders] Total orders from API:', allOrders.length);
                processOrders(allOrders);
            })
            .catch(function(error) {
                console.error('[DriverOrders] API error:', error);
                alert('Không thể tải dữ liệu từ server. Vui lòng thử lại!');
                // Fallback to localStorage
                loadOrdersFromLocalStorage();
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Fallback: Load from localStorage
    function loadOrdersFromLocalStorage() {
        console.log('[DriverOrders] Loading from localStorage as fallback...');
        try {
            var allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            console.log('[DriverOrders] Found', allOrders.length, 'orders in localStorage');
            processOrders(allOrders);
        } catch (e) {
            console.error('[DriverOrders] Error loading from localStorage:', e);
            $scope.orders = [];
            calculateStats();
            $scope.applyFilters();
        }
    }
    
    // Process and normalize orders data
    function processOrders(data) {
        console.log('[DriverOrders] Processing', data.length, 'orders...');
        
        // Normalize property names from C# PascalCase to JavaScript camelCase
        var normalizedOrders = data.map(function(order) {
            return {
                id: order.Id || order.id,
                maVanDon: order.MaVanDon || order.maVanDon || '',
                tenNguoiGui: order.TenNguoiGui || order.tenNguoiGui || '',
                sdtNguoiGui: order.SdtNguoiGui || order.sdtNguoiGui || '',
                diaChiLayHang: order.DiaChiLayHang || order.diaChiLayHang || '',
                tenNguoiNhan: order.TenNguoiNhan || order.tenNguoiNhan || '',
                sdtNguoiNhan: order.SdtNguoiNhan || order.sdtNguoiNhan || '',
                diaChiGiaoHang: order.DiaChiGiaoHang || order.diaChiGiaoHang || '',
                loaiHang: order.LoaiHang || order.loaiHang || 'Hàng hóa',
                khoiLuong: order.KhoiLuong || order.khoiLuong || 0,
                tienThuHo: order.TienThuHo || order.tienThuHo || 0,
                loaiDichVu: order.LoaiDichVu || order.loaiDichVu || 'THONG_THUONG',
                trangThai: order.TrangThai || order.trangThai || 'CHO_LAY_HANG',
                idTaiXe: order.IdTaiXe || order.idTaiXe,
                idTuyenDuong: order.IdTuyenDuong || order.idTuyenDuong,
                thoiGianTao: order.ThoiGianTao || order.thoiGianTao,
                thoiGianCapNhat: order.ThoiGianCapNhat || order.thoiGianCapNhat
            };
        });
        
        // Filter orders for current driver (demo: show idTaiXe 1 and 3)
        var driverId = currentUser.id || currentUser.userId || currentUser.maNguoiDung;
        
        $scope.orders = normalizedOrders.filter(function(order) {
            // Show orders with idTaiXe or unassigned orders
            if (order.idTaiXe) {
                // Demo mode: show driver 1 and 3's orders
                return order.idTaiXe === 1 || order.idTaiXe === 3;
            }
            return true; // Show unassigned orders
        });
        
        console.log('[DriverOrders] Filtered to', $scope.orders.length, 'orders for display');
        
        calculateStats();
        $scope.applyFilters();
    }
    
    // Calculate statistics
    function calculateStats() {
        $scope.stats.totalOrders = $scope.orders.length;
        
        $scope.stats.pendingOrders = $scope.orders.filter(function(o) {
            return o.trangThai === 'CHO_LAY_HANG' || 
                   o.trangThai === 'DA_LAY_HANG' || 
                   o.trangThai === 'DANG_GIAO';
        }).length;
        
        $scope.stats.completedOrders = $scope.orders.filter(function(o) {
            return o.trangThai === 'GIAO_THANH_CONG';
        }).length;
        
        $scope.stats.failedOrders = $scope.orders.filter(function(o) {
            return o.trangThai === 'THAT_BAI';
        }).length;
        
        $scope.stats.totalCOD = $scope.orders
            .filter(function(o) { 
                return o.trangThai === 'GIAO_THANH_CONG' && o.tienThuHo > 0; 
            })
            .reduce(function(sum, o) { 
                return sum + (parseFloat(o.tienThuHo) || 0); 
            }, 0);
        
        console.log('[DriverOrders] Stats calculated:', $scope.stats);
    }
    
    // ==================== FILTERING & PAGINATION ====================
    
    // Apply all filters
    $scope.applyFilters = function() {
        $scope.filteredOrders = $scope.orders.filter(function(order) {
            // Search text filter
            if ($scope.searchText) {
                var searchLower = $scope.searchText.toLowerCase();
                var matchesSearch = 
                    (order.maVanDon && order.maVanDon.toLowerCase().indexOf(searchLower) > -1) ||
                    (order.tenNguoiNhan && order.tenNguoiNhan.toLowerCase().indexOf(searchLower) > -1) ||
                    (order.sdtNguoiNhan && order.sdtNguoiNhan.indexOf(searchLower) > -1) ||
                    (order.diaChiGiaoHang && order.diaChiGiaoHang.toLowerCase().indexOf(searchLower) > -1);
                if (!matchesSearch) return false;
            }
            
            // Status filter
            if ($scope.filterStatus && order.trangThai !== $scope.filterStatus) {
                return false;
            }
            
            // Date filter
            if ($scope.filterDate) {
                try {
                    var orderDate = new Date(order.thoiGianTao || order.ngayTao);
                    var filterDate = new Date($scope.filterDate);
                    if (orderDate.toDateString() !== filterDate.toDateString()) {
                        return false;
                    }
                } catch (e) {
                    // Ignore date parsing errors
                }
            }
            
            return true;
        });
        
        // Update pagination
        $scope.totalPages = Math.ceil($scope.filteredOrders.length / $scope.itemsPerPage) || 1;
        $scope.currentPage = 1;
        updatePagination();
    };
    
    // Update paginated view
    function updatePagination() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        $scope.paginatedOrders = $scope.filteredOrders.slice(start, end);
    }
    
    // Quick filter by status from cards
    $scope.filterByStatus = function(status) {
        $scope.filterStatus = status;
        $scope.applyFilters();
    };
    
    // Pagination controls
    $scope.goToPage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
        updatePagination();
    };
    
    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            updatePagination();
        }
    };
    
    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            updatePagination();
        }
    };
    
    // ==================== ORDER ACTIONS ====================
    
    // View order details in modal
    $scope.viewOrderDetails = function(order) {
        console.log('[DriverOrders] Opening order details:', order.maVanDon);
        $scope.selectedOrder = order;
        $scope.showDetailModal = true;
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showDetailModal = false;
        $scope.selectedOrder = null;
    };
    
    // Update order status
    $scope.updateOrderStatus = function(order, newStatus) {
        var statusLabels = {
            'DA_LAY_HANG': 'Đã lấy hàng',
            'DANG_GIAO': 'Đang giao',
            'GIAO_THANH_CONG': 'Giao thành công',
            'THAT_BAI': 'Thất bại'
        };
        
        if (!confirm('Bạn có chắc muốn cập nhật trạng thái thành "' + statusLabels[newStatus] + '"?')) {
            return;
        }
        
        $scope.isLoading = true;
        console.log('[DriverOrders] Updating order', order.id, 'to status:', newStatus);
        
        // Prepare full order data for update
        var updateData = {
            Id: order.id,
            MaVanDon: order.maVanDon,
            TenNguoiGui: order.tenNguoiGui,
            SdtNguoiGui: order.sdtNguoiGui,
            DiaChiLayHang: order.diaChiLayHang,
            TenNguoiNhan: order.tenNguoiNhan,
            SdtNguoiNhan: order.sdtNguoiNhan,
            DiaChiGiaoHang: order.diaChiGiaoHang,
            LoaiHang: order.loaiHang,
            KhoiLuong: order.khoiLuong,
            TienThuHo: order.tienThuHo,
            LoaiDichVu: order.loaiDichVu,
            TrangThai: newStatus,
            IdTaiXe: order.idTaiXe,
            IdTuyenDuong: order.idTuyenDuong
        };
        
        // Call API update endpoint
        var updateUrl = API_CONFIG.BASE_URL + '/DonVanChuyen/update';
        
        $http.put(updateUrl, updateData)
            .then(function(response) {
                console.log('[DriverOrders] Update success:', response.data);
                alert('✅ Cập nhật trạng thái thành công!');
                
                // Update local data
                order.trangThai = newStatus;
                if ($scope.selectedOrder && $scope.selectedOrder.id === order.id) {
                    $scope.selectedOrder.trangThai = newStatus;
                }
                
                // Recalculate stats
                calculateStats();
                $scope.applyFilters();
                
                // Close modal
                $scope.closeModal();
            })
            .catch(function(error) {
                console.error('[DriverOrders] Update error:', error);
                alert('❌ Có lỗi xảy ra khi cập nhật trạng thái!\n' + 
                      (error.data && error.data.message ? error.data.message : 'Vui lòng thử lại.'));
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // ==================== OTHER ACTIONS ====================
    
    // Refresh data
    $scope.refresh = function() {
        console.log('[DriverOrders] Refreshing data...');
        $scope.loadOrders();
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            $window.location.href = 'login.html';
        }
    };
    
    // ==================== INITIALIZATION ====================
    
    // Load orders on init
    $timeout(function() {
        console.log('[DriverOrders] Starting to load orders...');
        $scope.loadOrders();
    }, 100);
    
}]);
