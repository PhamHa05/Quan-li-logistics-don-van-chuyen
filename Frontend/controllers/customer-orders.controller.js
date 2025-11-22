// Customer Orders Controller - AngularJS
app.controller('CustomerOrdersController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication
    if (!utilsService.checkRole(['customer'])) {
        return;
    }
    
    // Initialize
    $scope.orders = [];
    $scope.filteredOrders = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.selectedOrder = null;
    $scope.showModal = false;
    
    // Search filters
    $scope.searchFilters = {
        status: '',
        fromDate: '',
        toDate: ''
    };
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load orders from API
    $scope.loadOrders = function() {
        $scope.isLoading = true;
        
        // Search orders by customer ID
        var searchData = {
            maNguoiGui: $scope.currentUser.userId
        };
        
        apiService.searchDonVanChuyen(searchData)
            .then(function(response) {
                console.log('Customer orders loaded:', response);
                $scope.orders = response;
                $scope.applyFilters();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('Error loading orders:', error);
                alert('Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredOrders = $scope.orders.filter(function(order) {
            var matchStatus = !$scope.searchFilters.status || 
                             order.trangThai === $scope.searchFilters.status;
            
            return matchStatus;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredOrders.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Get paginated orders
    $scope.getPaginatedOrders = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredOrders.slice(start, end);
    };
    
    // View order details
    $scope.viewOrderDetails = function(order) {
        $scope.isLoading = true;
        
        apiService.getDonVanChuyenById(order.maDonVanChuyen)
            .then(function(response) {
                console.log('Order details:', response);
                $scope.selectedOrder = response;
                $scope.showModal = true;
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('Error loading order details:', error);
                alert('Không thể tải chi tiết đơn hàng. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.selectedOrder = null;
    };
    
    // Cancel order
    $scope.cancelOrder = function(order) {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
            return;
        }
        
        // Chỉ cho phép hủy đơn ở trạng thái pending hoặc confirmed
        if (order.trangThai !== 'pending' && order.trangThai !== 'confirmed') {
            alert('Không thể hủy đơn hàng ở trạng thái này!');
            return;
        }
        
        $scope.isLoading = true;
        var updateData = angular.copy(order);
        updateData.trangThai = 'cancelled';
        
        apiService.updateDonVanChuyen(updateData)
            .then(function(response) {
                console.log('Order cancelled:', response);
                alert('Hủy đơn hàng thành công!');
                $scope.loadOrders();
                $scope.closeModal();
            })
            .catch(function(error) {
                console.error('Error cancelling order:', error);
                alert('Không thể hủy đơn hàng. Vui lòng thử lại!');
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Get status text
    $scope.getStatusText = function(status) {
        var statusMap = {
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
    
    // Format currency
    $scope.formatCurrency = utilsService.formatCurrency;
    
    // Format date
    $scope.formatDateTime = utilsService.formatDateTime;
    
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
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load orders on init
    $scope.loadOrders();
}]);
