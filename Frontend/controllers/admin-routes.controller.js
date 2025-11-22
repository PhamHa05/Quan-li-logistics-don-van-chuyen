// Admin Routes Controller - Quản lý Tuyến Đường
app.controller('AdminRoutesController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication và quyền admin
    if (!utilsService.checkRole(['admin'])) {
        return;
    }
    
    console.log('[Routes] Controller initialized');
    
    // Initialize
    $scope.routes = [];
    $scope.filteredRoutes = [];
    $scope.drivers = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.showModal = false;
    $scope.isEditMode = false;
    
    // Search filters
    $scope.searchFilters = {
        maTuyen: '',
        status: '',
        idTaiXe: ''
    };
    
    // Form data
    $scope.routeForm = {};
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load routes from API
    $scope.loadRoutes = function() {
        $scope.isLoading = true;
        console.log('[Routes] Loading routes...');
        
        apiService.getAllTuyenDuong()
            .then(function(response) {
                console.log('[Routes] Routes loaded:', response);
                // Handle both array response and object with Data property
                if (Array.isArray(response)) {
                    $scope.routes = response;
                } else if (response && response.data) {
                    $scope.routes = response.data;
                } else if (response && response.Data) {
                    $scope.routes = response.Data;
                } else {
                    $scope.routes = [];
                }
                $scope.applyFilters();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('[Routes] Error loading routes:', error);
                alert('Không thể tải danh sách tuyến đường. Vui lòng thử lại!');
                $scope.routes = [];
                $scope.isLoading = false;
            });
    };
    
    // Load drivers for dropdown
    $scope.loadDrivers = function() {
        apiService.getAllTaiXe()
            .then(function(response) {
                console.log('[Routes] Drivers loaded:', response);
                // Handle both array response and object with Data property
                if (Array.isArray(response)) {
                    $scope.drivers = response;
                } else if (response && response.data) {
                    $scope.drivers = response.data;
                } else if (response && response.Data) {
                    $scope.drivers = response.Data;
                } else {
                    $scope.drivers = [];
                }
            })
            .catch(function(error) {
                console.error('[Routes] Error loading drivers:', error);
                $scope.drivers = [];
            });
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredRoutes = $scope.routes.filter(function(route) {
            var matchMaTuyen = !$scope.searchFilters.maTuyen || 
                              route.maTuyen?.toLowerCase().includes($scope.searchFilters.maTuyen.toLowerCase());
            var matchStatus = !$scope.searchFilters.status || 
                             route.trangThai === $scope.searchFilters.status;
            var matchDriver = !$scope.searchFilters.idTaiXe || 
                             route.idTaiXe == $scope.searchFilters.idTaiXe;
            
            return matchMaTuyen && matchStatus && matchDriver;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredRoutes.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Get paginated routes
    $scope.getPaginatedRoutes = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredRoutes.slice(start, end);
    };
    
    // Get driver name by ID
    $scope.getDriverName = function(idTaiXe) {
        var driver = $scope.drivers.find(function(d) { return d.id == idTaiXe; });
        return driver ? driver.hoTen : 'N/A';
    };
    
    // Get status text
    $scope.getStatusText = function(status) {
        var statusMap = {
            'DA_LAP_KE_HOACH': 'Đã lập kế hoạch',
            'DANG_GIAO': 'Đang giao',
            'HOAN_THANH': 'Hoàn thành'
        };
        return statusMap[status] || status;
    };
    
    // Show add modal
    $scope.showAddModal = function() {
        $scope.isEditMode = false;
        $scope.routeForm = {
            maTuyen: '',
            idTaiXe: null,
            ngayGiaoHang: new Date().toISOString().split('T')[0],
            trangThai: 'DA_LAP_KE_HOACH',
            tongSoDon: 0,
            soDonHoanThanh: 0
        };
        $scope.showModal = true;
    };
    
    // Show edit modal
    $scope.showEditModal = function(route) {
        $scope.isEditMode = true;
        $scope.routeForm = angular.copy(route);
        // Convert date to yyyy-MM-dd format
        if ($scope.routeForm.ngayGiaoHang) {
            var date = new Date($scope.routeForm.ngayGiaoHang);
            $scope.routeForm.ngayGiaoHang = date.toISOString().split('T')[0];
        }
        $scope.showModal = true;
    };
    
    // Save route (create or update)
    $scope.saveRoute = function() {
        if (!$scope.validateForm()) {
            return;
        }
        
        $scope.isLoading = true;
        
        // Map to backend format (PascalCase)
        var routeData = {
            Id: $scope.routeForm.id || 0,
            MaTuyen: $scope.routeForm.maTuyen,
            IdTaiXe: parseInt($scope.routeForm.idTaiXe),
            NgayGiaoHang: $scope.routeForm.ngayGiaoHang,
            TrangThai: $scope.routeForm.trangThai,
            TongSoDon: parseInt($scope.routeForm.tongSoDon) || 0,
            SoDonHoanThanh: parseInt($scope.routeForm.soDonHoanThanh) || 0
        };
        
        var promise = $scope.isEditMode ? 
            apiService.updateTuyenDuong(routeData) : 
            apiService.createTuyenDuong(routeData);
        
        promise.then(function(response) {
                console.log('[Routes] Route saved:', response);
                alert($scope.isEditMode ? 'Cập nhật tuyến đường thành công!' : 'Thêm tuyến đường thành công!');
                $scope.showModal = false;
                $scope.loadRoutes();
            })
            .catch(function(error) {
                console.error('[Routes] Error saving route:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Delete route
    $scope.deleteRoute = function(route) {
        if (!confirm('Bạn có chắc chắn muốn xóa tuyến đường ' + route.maTuyen + '?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        apiService.deleteTuyenDuong(route.id)
            .then(function(response) {
                console.log('[Routes] Route deleted:', response);
                alert('Xóa tuyến đường thành công!');
                $scope.loadRoutes();
            })
            .catch(function(error) {
                console.error('[Routes] Error deleting route:', error);
                alert('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showModal = false;
    };
    
    // Validate form
    $scope.validateForm = function() {
        if (!$scope.routeForm.maTuyen) {
            alert('Vui lòng nhập mã tuyến!');
            return false;
        }
        
        if (!$scope.routeForm.idTaiXe) {
            alert('Vui lòng chọn tài xế!');
            return false;
        }
        
        if (!$scope.routeForm.ngayGiaoHang) {
            alert('Vui lòng chọn ngày giao hàng!');
            return false;
        }
        
        return true;
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
    
    // Format date
    $scope.formatDate = utilsService.formatDate;
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load data on init
    $scope.loadRoutes();
    $scope.loadDrivers();
}]);
