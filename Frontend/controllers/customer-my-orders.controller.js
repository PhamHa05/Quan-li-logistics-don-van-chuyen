// Customer My Orders Controller
app.controller('CustomerMyOrdersController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerMyOrders] Controller loaded - v2.0 with Database Integration');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerMyOrders] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerMyOrders] Error loading user:', e);
    }
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toUpperCase().trim();
    var isCustomer = (userRole === 'CUSTOMER' || userRole === 'KHACHHANG' || userRole === 'KHACH HANG' || userRole === 'KHACH');
    
    if (!isCustomer) {
        alert('Bạn không có quyền truy cập trang này!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Initialize scope
    $scope.currentUser = currentUser;
    $scope.customerInfo = {};
    $scope.loading = false;
    $scope.error = null;
    
    $scope.allOrders = [];
    $scope.filteredOrders = [];
    $scope.selectedOrder = null;
    $scope.showModal = false;
    
    // Filter
    $scope.filterStatus = 'all';
    $scope.searchText = '';
    
    // Stats
    $scope.stats = {
        total: 0,
        pending: 0,
        delivering: 0,
        completed: 0,
        failed: 0
    };
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load customer info from database
    $scope.loadCustomerInfo = function() {
        var customerId = currentUser.id || currentUser.userId || currentUser.maNguoiDung || currentUser.MaNguoiDung;
        
        if (!customerId) {
            console.warn('[CustomerMyOrders] No customer ID found');
            return;
        }
        
        console.log('[CustomerMyOrders] Loading customer info for ID:', customerId);
        
        apiService.getNguoiDungById(customerId)
            .then(function(response) {
                var customer = response.data || response;
                console.log('[CustomerMyOrders] Customer info loaded:', customer);
                
                // Backend returns camelCase (maNguoiDung, hoTen, soDienThoai, diaChi)
                $scope.customerInfo = {
                    maNguoiDung: customer.maNguoiDung || customer.Id,
                    hoTen: customer.hoTen || customer.HoTen || '',
                    email: customer.email || customer.Email || '',
                    soDienThoai: customer.soDienThoai || customer.SoDienThoai || '',
                    diaChi: customer.diaChi || customer.DiaChi || ''
                };
                
                // Update currentUser with fresh database data
                $scope.currentUser.phone = $scope.customerInfo.soDienThoai;
                $scope.currentUser.fullName = $scope.customerInfo.hoTen;
                $scope.currentUser.email = $scope.customerInfo.email;
                $scope.currentUser.address = $scope.customerInfo.diaChi;
                
                console.log('[CustomerMyOrders] Customer phone from DB:', $scope.customerInfo.soDienThoai);
                
                // Now load orders with correct phone number
                $scope.loadOrders();
            })
            .catch(function(error) {
                console.error('[CustomerMyOrders] Error loading customer info:', error);
                // Still try to load orders with existing data
                $scope.loadOrders();
            });
    };
    
    // Load orders from database
    $scope.loadOrders = function() {
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[CustomerMyOrders] Loading orders from database...');
        
        // Get customer phone (this is the key to filter orders)
        var customerPhone = $scope.customerInfo.soDienThoai || currentUser.phone || currentUser.soDienThoai || currentUser.SoDienThoai;
        var customerName = $scope.customerInfo.hoTen || currentUser.fullName || currentUser.hoTen || currentUser.HoTen;
        
        console.log('[CustomerMyOrders] Filtering by phone:', customerPhone);
        console.log('[CustomerMyOrders] Filtering by name:', customerName);
        
        apiService.getAllDonVanChuyen()
            .then(function(allOrders) {
                console.log('[CustomerMyOrders] Total orders in database:', allOrders.length);
                
                // Filter orders by customer phone number (SdtNguoiGui)
                $scope.allOrders = allOrders.filter(function(order) {
                    // Backend returns camelCase (sdtNguoiGui, tenNguoiGui)
                    var orderSenderPhone = order.sdtNguoiGui || order.SdtNguoiGui || '';
                    var orderSenderName = order.tenNguoiGui || order.TenNguoiGui || '';
                    
                    // Match by phone number (primary) or name (fallback)
                    var matchPhone = customerPhone && orderSenderPhone === customerPhone;
                    var matchName = !customerPhone && customerName && orderSenderName === customerName;
                    
                    return matchPhone || matchName;
                }).map(function(order) {
                    // Normalize order data to camelCase for consistency
                    return {
                        id: order.id || order.Id,
                        maVanDon: order.maVanDon || order.MaVanDon || 'N/A',
                        tenNguoiGui: order.tenNguoiGui || order.TenNguoiGui || '',
                        sdtNguoiGui: order.sdtNguoiGui || order.SdtNguoiGui || '',
                        diaChiLayHang: order.diaChiLayHang || order.DiaChiLayHang || '',
                        tenNguoiNhan: order.tenNguoiNhan || order.TenNguoiNhan || '',
                        sdtNguoiNhan: order.sdtNguoiNhan || order.SdtNguoiNhan || '',
                        diaChiGiaoHang: order.diaChiGiaoHang || order.DiaChiGiaoHang || '',
                        loaiHang: order.loaiHang || order.LoaiHang || 'Không xác định',
                        khoiLuong: order.khoiLuong || order.KhoiLuong || 0,
                        tienThuHo: order.tienThuHo || order.TienThuHo || 0,
                        loaiDichVu: order.loaiDichVu || order.LoaiDichVu || 'Standard',
                        trangThai: order.trangThai || order.TrangThai || 'CHO_LAY_HANG',
                        thoiGianTao: order.thoiGianTao || order.ThoiGianTao || null,
                        thoiGianCapNhat: order.thoiGianCapNhat || order.ThoiGianCapNhat || null,
                        idTaiXe: order.idTaiXe || order.IdTaiXe || null,
                        idTuyenDuong: order.idTuyenDuong || order.IdTuyenDuong || null
                    };
                });
                
                console.log('[CustomerMyOrders] Customer orders found:', $scope.allOrders.length);
                console.log('[CustomerMyOrders] Orders:', $scope.allOrders);
                
                // Calculate stats
                $scope.stats.total = $scope.allOrders.length;
                $scope.stats.pending = $scope.allOrders.filter(function(o) { 
                    return o.trangThai === 'CHO_LAY_HANG'; 
                }).length;
                $scope.stats.delivering = $scope.allOrders.filter(function(o) { 
                    return o.trangThai === 'DANG_GIAO' || o.trangThai === 'DA_LAY_HANG'; 
                }).length;
                $scope.stats.completed = $scope.allOrders.filter(function(o) { 
                    return o.trangThai === 'GIAO_THANH_CONG'; 
                }).length;
                $scope.stats.failed = $scope.allOrders.filter(function(o) { 
                    return o.trangThai === 'THAT_BAI'; 
                }).length;
                
                console.log('[CustomerMyOrders] Stats:', $scope.stats);
                
                // Apply filters
                $scope.applyFilters();
                
                $scope.loading = false;
                
                // Apply scope if not in digest
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            })
            .catch(function(error) {
                console.error('[CustomerMyOrders] Error loading orders:', error);
                $scope.error = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.';
                $scope.loading = false;
                
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredOrders = $scope.allOrders.filter(function(order) {
            // Status filter
            var matchStatus = $scope.filterStatus === 'all' || order.trangThai === $scope.filterStatus;
            
            // Text search
            var searchLower = ($scope.searchText || '').toLowerCase();
            var matchSearch = !searchLower || 
                             (order.maVanDon || '').toLowerCase().includes(searchLower) ||
                             (order.tenNguoiNhan || '').toLowerCase().includes(searchLower) ||
                             (order.sdtNguoiNhan || '').toLowerCase().includes(searchLower) ||
                             (order.diaChiGiaoHang || '').toLowerCase().includes(searchLower);
            
            return matchStatus && matchSearch;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredOrders.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Filter by status
    $scope.filterByStatus = function(status) {
        $scope.filterStatus = status;
        $scope.applyFilters();
    };
    
    // Reset filters
    $scope.resetFilters = function() {
        $scope.filterStatus = 'all';
        $scope.searchText = '';
        $scope.applyFilters();
    };
    
    // View order detail
    $scope.viewOrderDetail = function(order) {
        $scope.selectedOrder = order;
        $scope.showModal = true;
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.selectedOrder = null;
    };
    
    // Cancel order
    $scope.cancelOrder = function(order) {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng ' + order.maVanDon + '?')) {
            return;
        }
        
        // Update order status to THAT_BAI (failed/cancelled)
        var updateData = {
            Id: order.id,
            TrangThai: 'THAT_BAI'
        };
        
        apiService.updateDonVanChuyen(updateData)
            .then(function(response) {
                console.log('[CustomerMyOrders] Order cancelled:', response);
                alert('Đã hủy đơn hàng thành công!');
                $scope.loadOrders(); // Reload
            })
            .catch(function(error) {
                console.error('[CustomerMyOrders] Error cancelling order:', error);
                alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
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
    
    // Pagination
    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
        }
    };
    
    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };
    
    // Navigate
    $scope.navigateTo = function(page) {
        $window.location.href = page;
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            $window.location.href = 'login.html';
        }
    };
    
    // Load orders on init
    console.log('[CustomerMyOrders] Initializing - loading customer info from database...');
    $timeout(function() {
        $scope.loadCustomerInfo(); // This will call loadOrders() after customer info is loaded
    }, 100);
}]);
