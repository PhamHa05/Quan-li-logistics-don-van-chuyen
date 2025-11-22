// Admin Drivers Controller - AngularJS
app.controller('AdminDriversController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication
    if (!utilsService.checkRole(['admin'])) {
        return;
    }
    
    // Initialize
    $scope.drivers = [];
    $scope.filteredDrivers = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.showModal = false;
    $scope.isEditMode = false;
    
    // Search filters
    $scope.searchFilters = {
        name: '',
        phone: ''
    };
    
    // Form data
    $scope.driverForm = {};
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load drivers from API
    $scope.loadDrivers = function() {
        $scope.isLoading = true;
        console.log('[Drivers] Loading drivers...');
        
        apiService.getAllTaiXe()
            .then(function(response) {
                console.log('[Drivers] Drivers loaded:', response);
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
                $scope.applyFilters();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('[Drivers] Error loading drivers:', error);
                alert('Không thể tải danh sách tài xế. Vui lòng thử lại!');
                $scope.drivers = [];
                $scope.isLoading = false;
            });
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredDrivers = $scope.drivers.filter(function(driver) {
            var matchName = !$scope.searchFilters.name || 
                           (driver.hoTen || driver.HoTen || '').toLowerCase().includes($scope.searchFilters.name.toLowerCase());
            var matchPhone = !$scope.searchFilters.phone || 
                            (driver.soDienThoai || driver.SoDienThoai || '').includes($scope.searchFilters.phone);
            
            return matchName && matchPhone;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredDrivers.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Get paginated drivers
    $scope.getPaginatedDrivers = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredDrivers.slice(start, end);
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
    
    // Show add modal
    $scope.showAddModal = function() {
        $scope.isEditMode = false;
        $scope.driverForm = {
            hoTen: '',
            soDienThoai: '',
            loaiPhuongTien: '',
            bienSoXe: '',
            bangLai: '',
            trangThai: 'available'
        };
        $scope.showModal = true;
    };
    
    // Show edit modal
    $scope.showEditModal = function(driver) {
        $scope.isEditMode = true;
        $scope.driverForm = {
            maTaiXe: driver.maTaiXe || driver.MaTaiXe || driver.id,
            hoTen: driver.hoTen || driver.HoTen,
            soDienThoai: driver.soDienThoai || driver.SoDienThoai,
            loaiPhuongTien: driver.loaiPhuongTien || driver.LoaiPhuongTien,
            bienSoXe: driver.bienSoXe || driver.BienSoXe,
            bangLai: driver.bangLai || driver.BangLai || '',
            trangThai: driver.trangThai || driver.TrangThai || 'available'
        };
        $scope.showModal = true;
    };
    
    // View driver details
    $scope.viewDriverDetails = function(driver) {
        var driverInfo = 'Thông tin tài xế:\n\n';
        driverInfo += 'Họ tên: ' + (driver.hoTen || driver.HoTen) + '\n';
        driverInfo += 'SĐT: ' + (driver.soDienThoai || driver.SoDienThoai) + '\n';
        driverInfo += 'Loại xe: ' + (driver.loaiPhuongTien || driver.LoaiPhuongTien) + '\n';
        driverInfo += 'Biển số: ' + (driver.bienSoXe || driver.BienSoXe) + '\n';
        if (driver.bangLai || driver.BangLai) {
            driverInfo += 'Bằng lái: ' + (driver.bangLai || driver.BangLai) + '\n';
        }
        alert(driverInfo);
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.driverForm = {};
    };
    
    // Save driver (create or update)
    $scope.saveDriver = function() {
        if (!$scope.validateForm()) {
            return;
        }
        
        $scope.isLoading = true;
        
        // Chuẩn bị dữ liệu theo format C# (PascalCase)
        var driverData = {
            HoTen: $scope.driverForm.hoTen,
            SoDienThoai: $scope.driverForm.soDienThoai,
            LoaiPhuongTien: $scope.driverForm.loaiPhuongTien,
            BienSoXe: $scope.driverForm.bienSoXe,
            BangLai: $scope.driverForm.bangLai,
            TrangThai: $scope.driverForm.trangThai
        };
        
        if ($scope.isEditMode) {
            // Update driver
            driverData.MaTaiXe = $scope.driverForm.maTaiXe;
            
            apiService.updateTaiXe(driverData)
                .then(function(response) {
                    console.log('[Drivers] Driver updated:', response);
                    alert('Cập nhật tài xế thành công!');
                    $scope.loadDrivers();
                    $scope.closeModal();
                })
                .catch(function(error) {
                    console.error('[Drivers] Error updating driver:', error);
                    alert('Không thể cập nhật tài xế. Vui lòng thử lại!');
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        } else {
            // Create new driver
            apiService.createTaiXe(driverData)
                .then(function(response) {
                    console.log('[Drivers] Driver created:', response);
                    alert('Thêm tài xế thành công!');
                    $scope.loadDrivers();
                    $scope.closeModal();
                })
                .catch(function(error) {
                    console.error('[Drivers] Error creating driver:', error);
                    alert('Không thể thêm tài xế. Vui lòng thử lại!');
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        }
    };
    
    // Delete driver
    $scope.deleteDriver = function(driver) {
        var driverName = driver.hoTen || driver.HoTen;
        if (!confirm('Bạn có chắc chắn muốn xóa tài xế "' + driverName + '" không?')) {
            return;
        }
        
        $scope.isLoading = true;
        var driverId = driver.maTaiXe || driver.MaTaiXe;
        
        apiService.deleteTaiXe(driverId)
            .then(function(response) {
                console.log('[Drivers] Driver deleted:', response);
                alert('Xóa tài xế thành công!');
                $scope.loadDrivers();
            })
            .catch(function(error) {
                console.error('[Drivers] Error deleting driver:', error);
                alert('Không thể xóa tài xế. Vui lòng thử lại!');
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Validate form
    $scope.validateForm = function() {
        if (!$scope.driverForm.hoTen) {
            alert('Vui lòng nhập họ tên!');
            return false;
        }
        
        if (!$scope.driverForm.soDienThoai) {
            alert('Vui lòng nhập số điện thoại!');
            return false;
        }
        
        if (!$scope.driverForm.loaiPhuongTien) {
            alert('Vui lòng nhập loại phương tiện!');
            return false;
        }
        
        if (!$scope.driverForm.bienSoXe) {
            alert('Vui lòng nhập biển số xe!');
            return false;
        }
        
        return true;
    };
    
    // Format date
    $scope.formatDate = utilsService.formatDate;
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load drivers on init
    $scope.loadDrivers();
}]);
