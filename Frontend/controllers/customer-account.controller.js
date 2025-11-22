// Customer Account Controller
app.controller('CustomerAccountController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerAccount] Controller loaded - v1.0 with API');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerAccount] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerAccount] Error loading user:', e);
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
    $scope.loading = false;
    $scope.saving = false;
    $scope.error = null;
    $scope.success = null;
    $scope.editMode = false;
    
    $scope.customerInfo = {};
    $scope.originalInfo = {};
    
    // Password change
    $scope.showPasswordChange = false;
    $scope.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    
    // Load customer info
    $scope.loadCustomerInfo = function() {
        $scope.loading = true;
        $scope.error = null;
        
        var customerId = currentUser.id || currentUser.userId || currentUser.maNguoiDung || currentUser.MaNguoiDung;
        
        console.log('[CustomerAccount] Loading info for customer ID:', customerId);
        
        if (!customerId) {
            $scope.error = 'Không tìm thấy thông tin tài khoản.';
            $scope.loading = false;
            return;
        }
        
        apiService.getNguoiDungById(customerId)
            .then(function(customer) {
                console.log('[CustomerAccount] Customer info loaded:', customer);
                
                $scope.customerInfo = {
                    maNguoiDung: customer.maNguoiDung || customer.MaNguoiDung,
                    hoTen: customer.hoTen || customer.HoTen || '',
                    tenDangNhap: customer.tenDangNhap || customer.TenDangNhap || '',
                    email: customer.email || customer.Email || '',
                    soDienThoai: customer.soDienThoai || customer.SoDienThoai || '',
                    diaChi: customer.diaChi || customer.DiaChi || '',
                    vaiTro: customer.vaiTro || customer.VaiTro || '',
                    ngayTao: customer.ngayTao || customer.NgayTao
                };
                
                $scope.originalInfo = angular.copy($scope.customerInfo);
                $scope.loading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[CustomerAccount] Error loading customer info:', error);
                $scope.error = 'Không thể tải thông tin tài khoản. Vui lòng thử lại sau.';
                $scope.loading = false;
                $scope.$apply();
            });
    };
    
    // Toggle edit mode
    $scope.toggleEditMode = function() {
        if ($scope.editMode) {
            // Cancel edit
            $scope.customerInfo = angular.copy($scope.originalInfo);
            $scope.editMode = false;
            $scope.error = null;
            $scope.success = null;
        } else {
            $scope.editMode = true;
        }
    };
    
    // Save changes
    $scope.saveChanges = function() {
        $scope.error = null;
        $scope.success = null;
        
        // Validation
        if (!$scope.customerInfo.hoTen || !$scope.customerInfo.hoTen.trim()) {
            $scope.error = 'Vui lòng nhập họ tên';
            return;
        }
        if (!$scope.customerInfo.email || !$scope.customerInfo.email.trim()) {
            $scope.error = 'Vui lòng nhập email';
            return;
        }
        if (!$scope.customerInfo.soDienThoai || !$scope.customerInfo.soDienThoai.trim()) {
            $scope.error = 'Vui lòng nhập số điện thoại';
            return;
        }
        
        $scope.saving = true;
        
        var updateData = {
            MaNguoiDung: $scope.customerInfo.maNguoiDung,
            HoTen: $scope.customerInfo.hoTen,
            Email: $scope.customerInfo.email,
            SoDienThoai: $scope.customerInfo.soDienThoai,
            DiaChi: $scope.customerInfo.diaChi
        };
        
        console.log('[CustomerAccount] Updating customer info:', updateData);
        
        apiService.updateNguoiDung(updateData)
            .then(function(response) {
                console.log('[CustomerAccount] Customer info updated:', response);
                $scope.success = 'Cập nhật thông tin thành công!';
                $scope.originalInfo = angular.copy($scope.customerInfo);
                $scope.editMode = false;
                $scope.saving = false;
                
                // Update currentUser in localStorage
                currentUser.fullName = $scope.customerInfo.hoTen;
                currentUser.hoTen = $scope.customerInfo.hoTen;
                currentUser.email = $scope.customerInfo.email;
                currentUser.phone = $scope.customerInfo.soDienThoai;
                currentUser.soDienThoai = $scope.customerInfo.soDienThoai;
                currentUser.diaChi = $scope.customerInfo.diaChi;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                $timeout(function() {
                    $scope.success = null;
                }, 3000);
                
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[CustomerAccount] Error updating customer info:', error);
                $scope.error = 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';
                $scope.saving = false;
                $scope.$apply();
            });
    };
    
    // Toggle password change form
    $scope.togglePasswordChange = function() {
        $scope.showPasswordChange = !$scope.showPasswordChange;
        if (!$scope.showPasswordChange) {
            $scope.passwordData = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        }
    };
    
    // Change password
    $scope.changePassword = function() {
        $scope.error = null;
        $scope.success = null;
        
        // Validation
        if (!$scope.passwordData.currentPassword) {
            $scope.error = 'Vui lòng nhập mật khẩu hiện tại';
            return;
        }
        if (!$scope.passwordData.newPassword) {
            $scope.error = 'Vui lòng nhập mật khẩu mới';
            return;
        }
        if ($scope.passwordData.newPassword.length < 6) {
            $scope.error = 'Mật khẩu mới phải có ít nhất 6 ký tự';
            return;
        }
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            $scope.error = 'Mật khẩu xác nhận không khớp';
            return;
        }
        
        $scope.saving = true;
        
        var changePasswordData = {
            MaNguoiDung: $scope.customerInfo.maNguoiDung,
            MatKhauCu: $scope.passwordData.currentPassword,
            MatKhauMoi: $scope.passwordData.newPassword
        };
        
        console.log('[CustomerAccount] Changing password...');
        
        // Note: This assumes there's a changePassword endpoint in the API
        // If not available, this will need to be added to the backend
        apiService.changePassword(changePasswordData)
            .then(function(response) {
                console.log('[CustomerAccount] Password changed:', response);
                $scope.success = 'Đổi mật khẩu thành công!';
                $scope.saving = false;
                $scope.showPasswordChange = false;
                $scope.passwordData = {
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                };
                
                $timeout(function() {
                    $scope.success = null;
                }, 3000);
                
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('[CustomerAccount] Error changing password:', error);
                $scope.error = 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.';
                $scope.saving = false;
                $scope.$apply();
            });
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    // Get user initials
    $scope.getUserInitials = function() {
        var name = $scope.customerInfo.hoTen || currentUser.fullName || currentUser.username || 'KH';
        return name.substring(0, 2).toUpperCase();
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
    
    // Load customer info on init
    $timeout(function() {
        $scope.loadCustomerInfo();
    }, 100);
}]);
