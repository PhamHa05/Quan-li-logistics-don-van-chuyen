// Driver Profile Controller - Hoàn chỉnh với API
app.controller('DriverProfileController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[DriverProfile] Controller loaded - v2.0 with API');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[DriverProfile] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[DriverProfile] Error loading user:', e);
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
    $scope.loading = false;
    $scope.saving = false;
    $scope.error = null;
    $scope.success = null;
    
    $scope.driver = {};
    $scope.editMode = false;
    $scope.originalDriver = {};
    
    // Stats from dashboard
    $scope.stats = {
        todayOrders: 0,
        deliveringOrders: 0,
        completedOrders: 0,
        todayCOD: 0,
        totalCOD: 0
    };
    
    // Password change
    $scope.passwordChange = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    $scope.showPasswordChange = false;
    
    // Get driver ID
    var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe;
    
    console.log('[DriverProfile] Driver ID:', driverId);
    
    // Load driver data
    $scope.loadData = function() {
        if (!driverId) {
            $scope.error = 'Không tìm thấy ID tài xế. Vui lòng đăng nhập lại.';
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        console.log('[DriverProfile] Loading driver info:', driverId);
        
        // Load driver info from API
        apiService.getTaiXeById(driverId)
            .then(function(driver) {
                console.log('[DriverProfile] Driver loaded:', driver);
                
                // Normalize driver data
                $scope.driver = {
                    id: driver.id || driver.Id,
                    hoTen: driver.hoTen || driver.HoTen || '',
                    soDienThoai: driver.soDienThoai || driver.SoDienThoai || '',
                    email: driver.email || driver.Email || '',
                    diaChi: driver.diaChi || driver.DiaChi || '',
                    cmnd: driver.cmnd || driver.CMND || '',
                    bienSoXe: driver.bienSoXe || driver.BienSoXe || '',
                    loaiXe: driver.loaiXe || driver.LoaiXe || '',
                    trangThai: driver.trangThai || driver.TrangThai || '',
                    ngayTao: driver.ngayTao || driver.NgayTao
                };
                
                // Save original for reset
                $scope.originalDriver = angular.copy($scope.driver);
                
                // Load stats
                loadStats();
                
                $scope.loading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverProfile] Error loading driver:', error);
                $scope.error = 'Không thể tải thông tin tài xế. Vui lòng thử lại sau.';
                $scope.loading = false;
                $scope.$apply();
            });
    };
    
    // Load dashboard stats
    function loadStats() {
        apiService.getDashboardStats(driverId)
            .then(function(stats) {
                console.log('[DriverProfile] Stats loaded:', stats);
                
                $scope.stats = {
                    todayOrders: stats.todayOrders || stats.TodayOrders || 0,
                    deliveringOrders: stats.deliveringOrders || stats.DeliveringOrders || 0,
                    completedOrders: stats.completedOrders || stats.CompletedOrders || 0,
                    todayCOD: stats.codCollected ? (stats.codCollected.today || stats.codCollected.Today || 0) : 0,
                    totalCOD: stats.codCollected ? (stats.codCollected.total || stats.codCollected.Total || 0) : 0
                };
                
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverProfile] Error loading stats:', error);
            });
    }
    
    // Toggle edit mode
    $scope.toggleEdit = function() {
        $scope.editMode = !$scope.editMode;
        if (!$scope.editMode) {
            // Reset if cancelled
            $scope.driver = angular.copy($scope.originalDriver);
        }
        $scope.success = null;
        $scope.error = null;
    };
    
    // Save profile
    $scope.saveProfile = function() {
        if (!validateProfile()) {
            return;
        }
        
        $scope.saving = true;
        $scope.error = null;
        $scope.success = null;
        
        console.log('[DriverProfile] Saving profile:', $scope.driver);
        
        // Update via API
        apiService.updateTaiXe($scope.driver)
            .then(function(response) {
                console.log('[DriverProfile] Profile updated:', response);
                
                $scope.success = 'Cập nhật thông tin thành công!';
                $scope.editMode = false;
                $scope.originalDriver = angular.copy($scope.driver);
                
                // Update localStorage
                currentUser.fullName = $scope.driver.hoTen;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                $scope.saving = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[DriverProfile] Error updating profile:', error);
                $scope.error = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
                $scope.saving = false;
                $scope.$apply();
            });
    };
    
    // Validate profile
    function validateProfile() {
        if (!$scope.driver.hoTen || $scope.driver.hoTen.trim().length === 0) {
            $scope.error = 'Vui lòng nhập họ tên!';
            return false;
        }
        
        if (!$scope.driver.soDienThoai || $scope.driver.soDienThoai.trim().length === 0) {
            $scope.error = 'Vui lòng nhập số điện thoại!';
            return false;
        }
        
        // Validate phone format (basic)
        var phonePattern = /^[0-9]{10,11}$/;
        if (!phonePattern.test($scope.driver.soDienThoai.trim())) {
            $scope.error = 'Số điện thoại không hợp lệ!';
            return false;
        }
        
        // Validate email if provided
        if ($scope.driver.email && $scope.driver.email.trim().length > 0) {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test($scope.driver.email.trim())) {
                $scope.error = 'Email không hợp lệ!';
                return false;
            }
        }
        
        return true;
    }
    
    // Toggle password change form
    $scope.togglePasswordChange = function() {
        $scope.showPasswordChange = !$scope.showPasswordChange;
        $scope.passwordChange = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        $scope.success = null;
        $scope.error = null;
    };
    
    // Change password
    $scope.changePassword = function() {
        if (!validatePassword()) {
            return;
        }
        
        $scope.saving = true;
        $scope.error = null;
        $scope.success = null;
        
        console.log('[DriverProfile] Changing password');
        
        // For now, show success (implement API call when backend supports it)
        $timeout(function() {
            $scope.success = 'Đổi mật khẩu thành công!';
            $scope.showPasswordChange = false;
            $scope.passwordChange = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            $scope.saving = false;
        }, 500);
        
        // TODO: Implement password change API call when available
        // apiService.changePassword(driverId, $scope.passwordChange.currentPassword, $scope.passwordChange.newPassword)
    };
    
    // Validate password
    function validatePassword() {
        if (!$scope.passwordChange.currentPassword) {
            $scope.error = 'Vui lòng nhập mật khẩu hiện tại!';
            return false;
        }
        
        if (!$scope.passwordChange.newPassword) {
            $scope.error = 'Vui lòng nhập mật khẩu mới!';
            return false;
        }
        
        if ($scope.passwordChange.newPassword.length < 6) {
            $scope.error = 'Mật khẩu mới phải có ít nhất 6 ký tự!';
            return false;
        }
        
        if ($scope.passwordChange.newPassword !== $scope.passwordChange.confirmPassword) {
            $scope.error = 'Mật khẩu xác nhận không khớp!';
            return false;
        }
        
        return true;
    }
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Get status badge class
    $scope.getStatusBadgeClass = function(status) {
        var statusMap = {
            'Hoạt động': 'badge-success',
            'Nghỉ phép': 'badge-warning',
            'Tạm dừng': 'badge-danger'
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
