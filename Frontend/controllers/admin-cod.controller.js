// Admin COD Controller - Quản lý Giao Dịch COD
app.controller('AdminCODController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication và quyền admin
    if (!utilsService.checkRole(['admin'])) {
        return;
    }
    
    console.log('[COD] Controller initialized');
    
    // Initialize
    $scope.codTransactions = [];
    $scope.filteredCOD = [];
    $scope.orders = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.searchText = '';
    
    // Modal states
    $scope.showDetailModal = false;
    $scope.selectedCOD = null;
    
    // Search filters
    $scope.searchFilters = {
        status: '',
        daDoiSoat: ''
    };
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Stats
    $scope.stats = {
        total: 0,
        pending: 0,
        completed: 0,
        totalAmount: 0,
        collectedAmount: 0
    };
    
    // Load COD transactions from API
    $scope.loadCOD = function() {
        $scope.isLoading = true;
        console.log('[COD] Loading COD transactions...');
        
        apiService.getAllGiaoDichCOD()
            .then(function(response) {
                console.log('[COD] COD transactions loaded:', response);
                $scope.codTransactions = response;
                $scope.calculateStats();
                $scope.applyFilters();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('[COD] Error loading COD:', error);
                alert('Không thể tải danh sách giao dịch COD. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Load orders for mapping
    $scope.loadOrders = function() {
        apiService.getAllDonVanChuyen()
            .then(function(response) {
                console.log('[COD] Orders loaded:', response);
                $scope.orders = response;
            })
            .catch(function(error) {
                console.error('[COD] Error loading orders:', error);
            });
    };
    
    // Calculate statistics
    $scope.calculateStats = function() {
        $scope.stats.total = $scope.codTransactions.length;
        $scope.stats.pending = $scope.codTransactions.filter(function(cod) {
            return cod.trangThaiThanhToan === 'CHO_THANH_TOAN';
        }).length;
        $scope.stats.completed = $scope.codTransactions.filter(function(cod) {
            return cod.trangThaiThanhToan === 'DA_THANH_TOAN';
        }).length;
        
        $scope.stats.totalAmount = $scope.codTransactions.reduce(function(sum, cod) {
            return sum + (cod.soTienDuKien || 0);
        }, 0);
        
        $scope.stats.collectedAmount = $scope.codTransactions.reduce(function(sum, cod) {
            return sum + (cod.soTienThucTe || 0);
        }, 0);
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredCOD = $scope.codTransactions.filter(function(cod) {
            // Search text filter
            var matchSearch = true;
            if ($scope.searchText) {
                var searchLower = $scope.searchText.toLowerCase();
                var orderCode = $scope.getOrderCode(cod.idDonVanChuyen).toLowerCase();
                matchSearch = orderCode.includes(searchLower) || 
                             String(cod.id).includes(searchLower);
            }
            
            // Status filter
            var matchStatus = !$scope.searchFilters.status || 
                             cod.trangThaiThanhToan === $scope.searchFilters.status;
            
            // Reconciliation filter
            var matchDoiSoat = $scope.searchFilters.daDoiSoat === '' || 
                              cod.daDoiSoat === ($scope.searchFilters.daDoiSoat === 'true');
            
            return matchSearch && matchStatus && matchDoiSoat;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredCOD.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Get paginated COD
    $scope.getPaginatedCOD = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredCOD.slice(start, end);
    };
    
    // Get order code by ID
    $scope.getOrderCode = function(idDonVanChuyen) {
        var order = $scope.orders.find(function(o) { return o.id == idDonVanChuyen; });
        return order ? order.maVanDon : 'N/A';
    };
    
    // Update COD status
    $scope.updateCODStatus = function(cod, newStatus) {
        if (!confirm('Bạn có chắc chắn muốn cập nhật trạng thái?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        var updateData = {
            Id: cod.id,
            IdDonVanChuyen: cod.idDonVanChuyen,
            SoTienDuKien: cod.soTienDuKien,
            SoTienThucTe: newStatus === 'DA_THANH_TOAN' ? cod.soTienDuKien : cod.soTienThucTe,
            ThoiGianThuTien: newStatus === 'DA_THANH_TOAN' ? new Date().toISOString() : cod.thoiGianThuTien,
            DaDoiSoat: cod.daDoiSoat,
            TrangThaiThanhToan: newStatus
        };
        
        apiService.updateGiaoDichCOD(updateData)
            .then(function(response) {
                console.log('[COD] Status updated:', response);
                alert('Cập nhật trạng thái thành công!');
                $scope.loadCOD();
            })
            .catch(function(error) {
                console.error('[COD] Error updating status:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Mark as reconciled
    $scope.markAsReconciled = function(cod) {
        if (!confirm('Xác nhận đã đối soát giao dịch này?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        var updateData = angular.copy(cod);
        updateData.DaDoiSoat = true;
        // Map to PascalCase
        updateData.Id = cod.id;
        updateData.IdDonVanChuyen = cod.idDonVanChuyen;
        updateData.SoTienDuKien = cod.soTienDuKien;
        updateData.SoTienThucTe = cod.soTienThucTe;
        updateData.ThoiGianThuTien = cod.thoiGianThuTien;
        updateData.TrangThaiThanhToan = cod.trangThaiThanhToan;
        
        apiService.updateGiaoDichCOD(updateData)
            .then(function(response) {
                console.log('[COD] Marked as reconciled:', response);
                alert('Đã đánh dấu đối soát!');
                $scope.loadCOD();
            })
            .catch(function(error) {
                console.error('[COD] Error marking reconciled:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // View COD detail - Updated with modal
    $scope.viewCODDetail = function(cod) {
        $scope.selectedCOD = cod;
        $scope.showDetailModal = true;
    };
    
    // Close detail modal
    $scope.closeDetailModal = function() {
        $scope.showDetailModal = false;
        $scope.selectedCOD = null;
    };
    
    // Export COD to Excel
    $scope.exportCOD = function() {
        alert('🚧 Tính năng xuất Excel đang được phát triển!\n\nSẽ sớm có trong phiên bản tiếp theo.');
    };
    
    // Pagination controls
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
    
    // Format currency
    $scope.formatCurrency = utilsService.formatCurrency;
    
    // Format date
    $scope.formatDateTime = utilsService.formatDateTime;
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load data on init
    $scope.loadCOD();
    $scope.loadOrders();
}]);
