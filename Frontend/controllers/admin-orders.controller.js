// Admin Orders Controller - AngularJS
app.controller('AdminOrdersController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication
    if (!utilsService.checkRole(['admin'])) {
        return;
    }
    
    // Initialize
    $scope.orders = [];
    $scope.filteredOrders = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.showModal = false;
    $scope.isEditMode = false;
    
    // Search filters
    $scope.searchFilters = {
        orderId: '',
        status: '',
        fromDate: '',
        toDate: ''
    };
    
    // Form data
    $scope.orderForm = {};
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load orders from API
    $scope.loadOrders = function() {
        $scope.isLoading = true;
        
        apiService.getAllDonVanChuyen()
            .then(function(response) {
                console.log('Orders loaded:', response);
                
                // Check if response is array or object with data property
                if (Array.isArray(response)) {
                    $scope.orders = response;
                } else {
                    console.warn('Orders response is not array, extracting data property');
                    $scope.orders = [];
                }
                
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
            var matchId = !$scope.searchFilters.orderId || 
                         order.maDonVanChuyen?.toString().includes($scope.searchFilters.orderId);
            var matchStatus = !$scope.searchFilters.status || 
                             order.trangThai === $scope.searchFilters.status;
            
            return matchId && matchStatus;
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
    
    // Show order details
    $scope.viewOrderDetails = function(order) {
        $scope.selectedOrder = angular.copy(order);
        $scope.showDetailModal = true;
    };
    
    // Close detail modal
    $scope.closeModal = function() {
        $scope.showDetailModal = false;
        $scope.selectedOrder = null;
    };
    
    // Show add order modal
    $scope.showAddModal = function() {
        $scope.isEditMode = false;
        $scope.orderForm = {
            maVanDon: 'VD' + Date.now(),
            tenNguoiGui: '',
            sdtNguoiGui: '',
            diaChiLayHang: '',
            tenNguoiNhan: '',
            sdtNguoiNhan: '',
            diaChiGiaoHang: '',
            loaiHang: '',
            khoiLuong: 0,
            loaiDichVu: 'THONG_THUONG',
            tienThuHo: 0,
            phiVanChuyen: 0,
            trangThai: 'CHO_LAY_HANG',
            ghiChu: ''
        };
        $scope.showModal = true;
    };
    
    // Show edit order modal
    $scope.showEditModal = function(order) {
        $scope.isEditMode = true;
        $scope.orderForm = angular.copy(order);
        $scope.showModal = true;
    };
    
    // Close form modal
    $scope.closeFormModal = function() {
        $scope.showModal = false;
        $scope.orderForm = {};
    };
    
    // Save order (create or update)
    $scope.saveOrder = function() {
        if (!$scope.orderForm.tenNguoiGui || !$scope.orderForm.sdtNguoiGui || 
            !$scope.orderForm.diaChiLayHang || !$scope.orderForm.tenNguoiNhan || 
            !$scope.orderForm.sdtNguoiNhan || !$scope.orderForm.diaChiGiaoHang) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        
        $scope.isLoading = true;
        
        if ($scope.isEditMode) {
            // Update existing order
            apiService.updateDonVanChuyen($scope.orderForm)
                .then(function(response) {
                    console.log('Order updated:', response);
                    alert('Cập nhật đơn hàng thành công!');
                    $scope.closeFormModal();
                    $scope.loadOrders();
                })
                .catch(function(error) {
                    console.error('Error updating order:', error);
                    alert('Không thể cập nhật đơn hàng. Vui lòng thử lại!');
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        } else {
            // Create new order
            apiService.createDonVanChuyen($scope.orderForm)
                .then(function(response) {
                    console.log('Order created:', response);
                    alert('Tạo đơn hàng thành công!');
                    $scope.closeFormModal();
                    $scope.loadOrders();
                })
                .catch(function(error) {
                    console.error('Error creating order:', error);
                    alert('Không thể tạo đơn hàng. Vui lòng thử lại!');
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        }
    };
    
    // Update order status
    $scope.updateOrderStatus = function(order, newStatus) {
        if (!confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?')) {
            return;
        }
        
        $scope.isLoading = true;
        var updateData = angular.copy(order);
        updateData.trangThai = newStatus;
        
        apiService.updateDonVanChuyen(updateData)
            .then(function(response) {
                console.log('Order status updated:', response);
                alert('Cập nhật trạng thái thành công!');
                $scope.loadOrders();
            })
            .catch(function(error) {
                console.error('Error updating order:', error);
                alert('Không thể cập nhật trạng thái. Vui lòng thử lại!');
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Delete order
    $scope.deleteOrder = function(order) {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        apiService.deleteDonVanChuyen(order.maDonVanChuyen)
            .then(function(response) {
                console.log('Order deleted:', response);
                alert('Xóa đơn hàng thành công!');
                $scope.loadOrders();
            })
            .catch(function(error) {
                console.error('Error deleting order:', error);
                alert('Không thể xóa đơn hàng. Vui lòng thử lại!');
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
