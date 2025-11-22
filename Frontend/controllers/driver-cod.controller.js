// Driver COD Controller - Hoàn chỉnh với API
app.controller('DriverCODController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[DriverCOD] Controller loaded - v2.0 with API');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[DriverCOD] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[DriverCOD] Error loading user:', e);
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
    
    $scope.stats = {
        totalCollected: 0,
        totalSubmitted: 0,
        totalPending: 0,
        pendingCount: 0,
        submittedCount: 0
    };
    
    $scope.codOrders = [];
    $scope.filteredOrders = [];
    $scope.filterStatus = 'all'; // all, collected, submitted
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Get driver ID
    var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe || currentUser.idTaiXe || currentUser.driverId;
    
    console.log('[DriverCOD] Driver ID:', driverId);
    
    // Load all data
    $scope.loadData = function() {
        if (!driverId) {
            $scope.error = 'Không tìm thấy ID tài xế. Vui lòng đăng nhập lại.';
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[DriverCOD] Loading data for driver:', driverId);
        
        // Load driver info first
        apiService.getTaiXeById(driverId)
            .then(function(driver) {
                console.log('[DriverCOD] Driver info loaded:', driver);
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
                console.log('[DriverCOD] Orders loaded:', orders.length);
                
                // Normalize and process orders
                var normalizedOrders = orders.map(function(order) {
                    return {
                        id: order.id || order.Id,
                        maVanDon: order.maVanDon || order.MaVanDon,
                        tenNguoiNhan: order.tenNguoiNhan || order.TenNguoiNhan,
                        sdtNguoiNhan: order.sdtNguoiNhan || order.SdtNguoiNhan,
                        diaChiGiaoHang: order.diaChiGiaoHang || order.DiaChiGiaoHang,
                        tienThuHo: order.tienThuHo || order.TienThuHo || 0,
                        trangThai: order.trangThai || order.TrangThai,
                        thoiGianTao: order.thoiGianTao || order.ThoiGianTao,
                        thoiGianCapNhat: order.thoiGianCapNhat || order.ThoiGianCapNhat,
                        codSubmitted: false, // Will be updated from GiaoDichCOD
                        codSubmittedDate: null
                    };
                });
                
                // Filter orders with COD > 0 and status = 'Đã giao'
                $scope.codOrders = normalizedOrders.filter(function(order) {
                    return order.tienThuHo > 0 && order.trangThai === 'Đã giao';
                });
                
                console.log('[DriverCOD] COD orders:', $scope.codOrders.length);
                
                // Load COD transaction status for each order
                loadCODStatus();
            })
            .catch(function(error) {
                console.error('[DriverCOD] Error loading orders:', error);
                $scope.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
                $scope.loading = false;
                $scope.$apply();
            });
    };
    
    // Load COD transaction status
    function loadCODStatus() {
        console.log('[DriverCOD] Loading COD status...');
        
        // Load all COD transactions
        apiService.getAllGiaoDichCOD()
            .then(function(codTransactions) {
                console.log('[DriverCOD] COD transactions loaded:', codTransactions.length);
                
                // Map COD status to orders
                $scope.codOrders.forEach(function(order) {
                    var codTrans = codTransactions.find(function(t) {
                        var tId = t.idDonVanChuyen || t.IdDonVanChuyen;
                        return tId === order.id;
                    });
                    
                    if (codTrans) {
                        var status = (codTrans.trangThai || codTrans.TrangThai || '').toLowerCase();
                        order.codSubmitted = (status === 'đã nộp');
                        order.codSubmittedDate = codTrans.thoiGianNop || codTrans.ThoiGianNop;
                    }
                });
                
                // Calculate stats
                calculateStats();
                
                // Apply filter
                applyFilter();
                
                $scope.loading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverCOD] Error loading COD status:', error);
                // Continue without COD status
                calculateStats();
                applyFilter();
                $scope.loading = false;
                $scope.$apply();
            });
    }
    
    // Calculate statistics
    function calculateStats() {
        $scope.stats = {
            totalCollected: 0,
            totalSubmitted: 0,
            totalPending: 0,
            pendingCount: 0,
            submittedCount: 0
        };
        
        $scope.codOrders.forEach(function(order) {
            $scope.stats.totalCollected += order.tienThuHo;
            
            if (order.codSubmitted) {
                $scope.stats.totalSubmitted += order.tienThuHo;
                $scope.stats.submittedCount++;
            } else {
                $scope.stats.totalPending += order.tienThuHo;
                $scope.stats.pendingCount++;
            }
        });
    }
    
    // Apply filter
    function applyFilter() {
        if ($scope.filterStatus === 'all') {
            $scope.filteredOrders = $scope.codOrders;
        } else if ($scope.filterStatus === 'collected') {
            $scope.filteredOrders = $scope.codOrders.filter(function(o) {
                return !o.codSubmitted;
            });
        } else if ($scope.filterStatus === 'submitted') {
            $scope.filteredOrders = $scope.codOrders.filter(function(o) {
                return o.codSubmitted;
            });
        }
        
        $scope.totalPages = Math.ceil($scope.filteredOrders.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    }
    
    // Filter change
    $scope.onFilterChange = function() {
        applyFilter();
    };
    
    // Get paginated orders
    $scope.getPaginatedOrders = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredOrders.slice(start, end);
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
    
    // Submit COD for a single order
    $scope.submitSingleCOD = function(order) {
        if (!order || order.codSubmitted) {
            return;
        }
        
        if (!confirm('Xác nhận đã nộp COD cho đơn hàng ' + order.maVanDon + '?')) {
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[DriverCOD] Submitting COD for order:', order.id);
        
        // Call API to submit COD
        apiService.submitCOD(order.id)
            .then(function(response) {
                console.log('[DriverCOD] COD submitted successfully:', response);
                
                // Update order in local array
                order.codSubmitted = true;
                order.codSubmittedDate = new Date().toISOString();
                
                // Recalculate stats
                calculateStats();
                
                // Reapply filter
                applyFilter();
                
                $scope.loading = false;
                alert('Đã nộp COD thành công!');
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverCOD] Error submitting COD:', error);
                $scope.error = 'Không thể nộp COD. Vui lòng thử lại.';
                $scope.loading = false;
                $scope.$apply();
            });
    };
    
    // Submit all pending COD
    $scope.submitCOD = function() {
        if ($scope.stats.pendingCount === 0) {
            alert('Không có COD nào cần nộp!');
            return;
        }
        
        if (!confirm('Bạn có chắc muốn nộp ' + $scope.stats.pendingCount + ' đơn COD với tổng số tiền ' + 
                     $scope.formatCurrency($scope.stats.totalPending) + '?')) {
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        // Get all pending orders
        var pendingOrders = $scope.codOrders.filter(function(o) { return !o.codSubmitted; });
        var submittedCount = 0;
        var errorCount = 0;
        
        console.log('[DriverCOD] Submitting ' + pendingOrders.length + ' COD orders');
        
        // Submit each order
        pendingOrders.forEach(function(order) {
            apiService.submitCOD(order.id)
                .then(function(response) {
                    console.log('[DriverCOD] COD submitted for order:', order.maVanDon);
                    order.codSubmitted = true;
                    order.codSubmittedDate = new Date().toISOString();
                    submittedCount++;
                    
                    // If all done, update UI
                    if (submittedCount + errorCount === pendingOrders.length) {
                        calculateStats();
                        applyFilter();
                        $scope.loading = false;
                        alert('Đã nộp ' + submittedCount + ' đơn COD thành công!' + 
                              (errorCount > 0 ? '\n' + errorCount + ' đơn lỗi.' : ''));
                        $scope.$apply();
                    }
                })
                .catch(function(error) {
                    console.error('[DriverCOD] Error submitting COD for order:', order.maVanDon, error);
                    errorCount++;
                    
                    // If all done, update UI
                    if (submittedCount + errorCount === pendingOrders.length) {
                        calculateStats();
                        applyFilter();
                        $scope.loading = false;
                        $scope.error = 'Có ' + errorCount + ' đơn không thể nộp COD.';
                        alert('Đã nộp ' + submittedCount + ' đơn COD thành công!' + 
                              (errorCount > 0 ? '\n' + errorCount + ' đơn lỗi.' : ''));
                        $scope.$apply();
                    }
                });
        });
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
    $scope.getStatusBadgeClass = function(submitted) {
        return submitted ? 'badge-success' : 'badge-warning';
    };
    
    // Get filtered orders (for HTML compatibility)
    $scope.getFilteredOrders = function() {
        return $scope.getPaginatedOrders();
    };
    
    // Get status label
    $scope.getStatusLabel = function(submitted) {
        return submitted ? 'Đã nộp' : 'Chưa nộp';
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
