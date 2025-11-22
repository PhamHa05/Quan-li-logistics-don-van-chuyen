// Customer Payment History Controller - AngularJS
app.controller('CustomerPaymentHistoryController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerPaymentHistory] Controller loaded - v1.0 with Database Integration');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerPaymentHistory] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerPaymentHistory] Error loading user:', e);
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
    
    $scope.allPayments = [];
    $scope.filteredPayments = [];
    
    // Filters
    $scope.filterStatus = 'all';
    $scope.filterMonth = '';
    $scope.searchText = '';
    
    // Stats
    $scope.stats = {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        codAmount: 0,
        totalTransactions: 0,
        paidCount: 0,
        pendingCount: 0
    };
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load customer info from database
    $scope.loadCustomerInfo = function() {
        var customerId = currentUser.id || currentUser.userId || currentUser.maNguoiDung || currentUser.MaNguoiDung;
        
        if (!customerId) {
            console.warn('[CustomerPaymentHistory] No customer ID found');
            return;
        }
        
        console.log('[CustomerPaymentHistory] Loading customer info for ID:', customerId);
        
        apiService.getNguoiDungById(customerId)
            .then(function(response) {
                var customer = response.data || response;
                console.log('[CustomerPaymentHistory] Customer info loaded:', customer);
                
                // Backend returns camelCase
                $scope.customerInfo = {
                    maNguoiDung: customer.maNguoiDung || customer.Id,
                    hoTen: customer.hoTen || customer.HoTen || '',
                    email: customer.email || customer.Email || '',
                    soDienThoai: customer.soDienThoai || customer.SoDienThoai || '',
                    diaChi: customer.diaChi || customer.DiaChi || ''
                };
                
                // Update currentUser
                $scope.currentUser.phone = $scope.customerInfo.soDienThoai;
                $scope.currentUser.fullName = $scope.customerInfo.hoTen;
                
                console.log('[CustomerPaymentHistory] Customer phone:', $scope.customerInfo.soDienThoai);
                
                // Now load payment history
                $scope.loadPaymentHistory();
            })
            .catch(function(error) {
                console.error('[CustomerPaymentHistory] Error loading customer info:', error);
                $scope.loadPaymentHistory(); // Try anyway
            });
    };
    
    // Load payment history (COD transactions for customer's orders)
    $scope.loadPaymentHistory = function() {
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[CustomerPaymentHistory] Loading payment history...');
        
        var customerPhone = $scope.customerInfo.soDienThoai || currentUser.phone || currentUser.soDienThoai;
        
        // Step 1: Load all customer's orders
        apiService.getAllDonVanChuyen()
            .then(function(allOrders) {
                console.log('[CustomerPaymentHistory] Total orders in database:', allOrders.length);
                
                // Filter orders by customer phone
                var customerOrders = allOrders.filter(function(order) {
                    var orderPhone = order.sdtNguoiGui || order.SdtNguoiGui || '';
                    return orderPhone === customerPhone;
                });
                
                console.log('[CustomerPaymentHistory] Customer orders found:', customerOrders.length);
                
                if (customerOrders.length === 0) {
                    $scope.allPayments = [];
                    $scope.calculateStats();
                    $scope.applyFilters();
                    $scope.loading = false;
                    if (!$scope.$$phase) $scope.$apply();
                    return;
                }
                
                // Step 2: Load all COD transactions
                return apiService.getAllGiaoDichCOD().then(function(allCODTransactions) {
                    console.log('[CustomerPaymentHistory] Total COD transactions:', allCODTransactions.length);
                    
                    // Create order ID map for quick lookup
                    var customerOrderIds = customerOrders.map(function(o) {
                        return o.id || o.Id;
                    });
                    
                    // Create order map for details
                    var orderMap = {};
                    customerOrders.forEach(function(order) {
                        orderMap[order.id || order.Id] = order;
                    });
                    
                    // Filter COD transactions for customer's orders
                    $scope.allPayments = allCODTransactions.filter(function(cod) {
                        var orderId = cod.idDonVanChuyen || cod.IdDonVanChuyen;
                        return customerOrderIds.indexOf(orderId) !== -1;
                    }).map(function(cod) {
                        // Get order details
                        var orderId = cod.idDonVanChuyen || cod.IdDonVanChuyen;
                        var order = orderMap[orderId] || {};
                        
                        // Normalize payment data
                        return {
                            id: cod.id || cod.Id,
                            idDonVanChuyen: orderId,
                            maVanDon: order.maVanDon || order.MaVanDon || 'N/A',
                            soTienDuKien: cod.soTienDuKien || cod.SoTienDuKien || 0,
                            soTienThucTe: cod.soTienThucTe || cod.SoTienThucTe || null,
                            thoiGianThuTien: cod.thoiGianThuTien || cod.ThoiGianThuTien || null,
                            daDoiSoat: cod.daDoiSoat || cod.DaDoiSoat || false,
                            trangThaiThanhToan: cod.trangThaiThanhToan || cod.TrangThaiThanhToan || 'Chưa thanh toán',
                            // Order details
                            tenNguoiNhan: order.tenNguoiNhan || order.TenNguoiNhan || '',
                            sdtNguoiNhan: order.sdtNguoiNhan || order.SdtNguoiNhan || '',
                            diaChiGiaoHang: order.diaChiGiaoHang || order.DiaChiGiaoHang || '',
                            trangThaiDon: order.trangThai || order.TrangThai || '',
                            thoiGianTao: order.thoiGianTao || order.ThoiGianTao || null
                        };
                    });
                    
                    console.log('[CustomerPaymentHistory] Customer payments found:', $scope.allPayments.length);
                    console.log('[CustomerPaymentHistory] Payments:', $scope.allPayments);
                    
                    // Calculate stats
                    $scope.calculateStats();
                    
                    // Apply filters
                    $scope.applyFilters();
                    
                    $scope.loading = false;
                    if (!$scope.$$phase) $scope.$apply();
                });
            })
            .catch(function(error) {
                console.error('[CustomerPaymentHistory] Error loading payment history:', error);
                $scope.error = 'Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.';
                $scope.loading = false;
                if (!$scope.$$phase) $scope.$apply();
            });
    };
    
    // Calculate statistics
    $scope.calculateStats = function() {
        $scope.stats.totalTransactions = $scope.allPayments.length;
        
        $scope.stats.totalAmount = $scope.allPayments.reduce(function(sum, p) {
            return sum + (parseFloat(p.soTienDuKien) || 0);
        }, 0);
        
        // Count paid transactions
        $scope.stats.paidCount = 0;
        $scope.stats.paidAmount = $scope.allPayments.reduce(function(sum, p) {
            if (p.trangThaiThanhToan === 'Đã thanh toán' || p.daDoiSoat) {
                $scope.stats.paidCount++;
                return sum + (parseFloat(p.soTienThucTe) || parseFloat(p.soTienDuKien) || 0);
            }
            return sum;
        }, 0);
        
        // Count pending transactions
        $scope.stats.pendingCount = 0;
        $scope.stats.pendingAmount = $scope.allPayments.reduce(function(sum, p) {
            if (p.trangThaiThanhToan !== 'Đã thanh toán' && !p.daDoiSoat) {
                $scope.stats.pendingCount++;
                return sum + (parseFloat(p.soTienDuKien) || 0);
            }
            return sum;
        }, 0);
        
        $scope.stats.codAmount = $scope.stats.totalAmount; // All are COD
        
        console.log('[CustomerPaymentHistory] Stats:', $scope.stats);
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredPayments = $scope.allPayments.filter(function(payment) {
            // Status filter
            var matchStatus = true;
            if ($scope.filterStatus === 'paid') {
                matchStatus = payment.trangThaiThanhToan === 'Đã thanh toán' || payment.daDoiSoat;
            } else if ($scope.filterStatus === 'pending') {
                matchStatus = payment.trangThaiThanhToan !== 'Đã thanh toán' && !payment.daDoiSoat;
            }
            
            // Month filter
            var matchMonth = true;
            if ($scope.filterMonth) {
                var paymentDate = new Date(payment.thoiGianThuTien || payment.thoiGianTao);
                var filterDate = new Date($scope.filterMonth);
                matchMonth = paymentDate.getMonth() === filterDate.getMonth() &&
                            paymentDate.getFullYear() === filterDate.getFullYear();
            }
            
            // Text search
            var searchLower = ($scope.searchText || '').toLowerCase();
            var matchSearch = !searchLower ||
                            (payment.maVanDon || '').toLowerCase().includes(searchLower) ||
                            (payment.tenNguoiNhan || '').toLowerCase().includes(searchLower) ||
                            (payment.sdtNguoiNhan || '').toLowerCase().includes(searchLower);
            
            return matchStatus && matchMonth && matchSearch;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredPayments.length / $scope.itemsPerPage);
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
        $scope.filterMonth = '';
        $scope.searchText = '';
        $scope.applyFilters();
    };
    
    // Get payment status text
    $scope.getPaymentStatusText = function(payment) {
        if (payment.daDoiSoat || payment.trangThaiThanhToan === 'Đã thanh toán') {
            return 'Đã thanh toán';
        }
        return 'Chưa thanh toán';
    };
    
    // Get payment status class
    $scope.getPaymentStatusClass = function(payment) {
        if (payment.daDoiSoat || payment.trangThaiThanhToan === 'Đã thanh toán') {
            return 'badge-success';
        }
        return 'badge-warning';
    };
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + 
               date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
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
    
    // Export to Excel (placeholder)
    $scope.exportToExcel = function() {
        alert('Chức năng xuất Excel đang được phát triển...');
    };
    
    // Initialize: Load customer info
    console.log('[CustomerPaymentHistory] Initializing - loading customer info from database...');
    $timeout(function() {
        $scope.loadCustomerInfo();
    }, 100);
}]);
