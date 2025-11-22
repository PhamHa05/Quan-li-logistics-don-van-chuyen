// Admin Users Controller - AngularJS
app.controller('AdminUsersController', ['$scope', '$window', 'apiService', 'utilsService',
    function($scope, $window, apiService, utilsService) {
    
    // Check authentication và quyền admin
    if (!utilsService.checkRole(['admin'])) {
        return;
    }
    
    // Initialize
    $scope.users = [];
    $scope.filteredUsers = [];
    $scope.currentUser = utilsService.getUser();
    $scope.isLoading = false;
    $scope.showModal = false;
    $scope.isEditMode = false;
    
    // Search filters
    $scope.searchFilters = {
        name: '',
        username: '',
        role: ''
    };
    
    // Form data
    $scope.userForm = {};
    $scope.passwordForm = {};
    $scope.showPasswordModal = false;
    $scope.selectedUserId = null;
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    
    // Load users from API
    $scope.loadUsers = function() {
        $scope.isLoading = true;
        
        apiService.getAllNguoiDung($scope.searchFilters.name, $scope.searchFilters.username)
            .then(function(response) {
                console.log('Users loaded:', response);
                $scope.users = response;
                $scope.applyFilters();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.error('Error loading users:', error);
                alert('Không thể tải danh sách người dùng. Vui lòng thử lại!');
                $scope.isLoading = false;
            });
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        $scope.filteredUsers = $scope.users.filter(function(user) {
            var matchName = !$scope.searchFilters.name || 
                           user.hoTen?.toLowerCase().includes($scope.searchFilters.name.toLowerCase());
            var matchUsername = !$scope.searchFilters.username || 
                               user.tenDangNhap?.toLowerCase().includes($scope.searchFilters.username.toLowerCase());
            var matchRole = !$scope.searchFilters.role || 
                           user.vaiTro === $scope.searchFilters.role;
            
            return matchName && matchUsername && matchRole;
        });
        
        $scope.totalPages = Math.ceil($scope.filteredUsers.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
    };
    
    // Get paginated users
    $scope.getPaginatedUsers = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.filteredUsers.slice(start, end);
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
        console.log('[Users] Opening add modal');
        $scope.isEditMode = false;
        $scope.showModal = true;
        $scope.userForm = {
            TenDangNhap: '',
            MatKhau: '',
            HoTen: '',
            Email: '',
            SoDienThoai: '',
            DiaChi: '',
            VaiTro: 'KHACH',
            TrangThai: 'HOAT_DONG',
            confirmPassword: ''
        };
    };
    
    // Show edit modal
    $scope.showEditModal = function(user) {
        console.log('[Users] Opening edit modal for:', user);
        $scope.isEditMode = true;
        $scope.showModal = true;
        // Map camelCase từ API sang PascalCase cho form
        $scope.userForm = {
            MaNguoiDung: user.maNguoiDung,
            TenDangNhap: user.tenDangNhap,
            HoTen: user.hoTen,
            Email: user.email,
            SoDienThoai: user.soDienThoai,
            DiaChi: user.diaChi,
            VaiTro: user.vaiTro,
            MatKhau: user.matKhau, // Giữ mật khẩu cũ
            NgayTao: user.ngayTao
        };
    };
    
    // Close modal
    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.userForm = {};
    };
    
    // Save user (create or update)
    $scope.saveUser = function() {
        if (!$scope.validateForm()) {
            return;
        }
        
        $scope.isLoading = true;
        
        // Prepare data - remove confirmPassword
        var userData = {
            MaNguoiDung: $scope.userForm.MaNguoiDung || 0,
            TenDangNhap: $scope.userForm.TenDangNhap,
            MatKhau: $scope.userForm.MatKhau,
            HoTen: $scope.userForm.HoTen,
            Email: $scope.userForm.Email,
            SoDienThoai: $scope.userForm.SoDienThoai || '',
            DiaChi: $scope.userForm.DiaChi || '',
            VaiTro: $scope.userForm.VaiTro,
            NgayTao: $scope.isEditMode ? $scope.userForm.NgayTao : new Date().toISOString()
        };
        
        console.log('[Users] Saving user:', userData);
        
        if ($scope.isEditMode) {
            // Update user
            apiService.updateNguoiDung(userData)
                .then(function(response) {
                    console.log('[Users] User updated:', response);
                    alert('Cập nhật người dùng thành công!');
                    $scope.loadUsers();
                    $scope.closeModal();
                })
                .catch(function(error) {
                    console.error('[Users] Error updating user:', error);
                    alert('Không thể cập nhật người dùng: ' + (error.message || 'Lỗi không xác định'));
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        } else {
            // Create new user
            apiService.createNguoiDung(userData)
                .then(function(response) {
                    console.log('[Users] User created:', response);
                    alert('Thêm người dùng thành công!');
                    $scope.loadUsers();
                    $scope.closeModal();
                })
                .catch(function(error) {
                    console.error('[Users] Error creating user:', error);
                    alert('Không thể thêm người dùng: ' + (error.message || 'Lỗi không xác định'));
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        }
    };
    
    // Delete user
    $scope.deleteUser = function(user) {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng "' + user.hoTen + '" không?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        apiService.deleteNguoiDung(user.maNguoiDung)
            .then(function(response) {
                console.log('[Users] User deleted:', response);
                alert('Xóa người dùng thành công!');
                $scope.loadUsers();
            })
            .catch(function(error) {
                console.error('[Users] Error deleting user:', error);
                alert('Không thể xóa người dùng: ' + (error.message || 'Lỗi không xác định'));
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Validate form
    $scope.validateForm = function() {
        if (!$scope.userForm.TenDangNhap || $scope.userForm.TenDangNhap.trim() === '') {
            alert('Vui lòng nhập tên đăng nhập!');
            return false;
        }
        
        if (!$scope.isEditMode && (!$scope.userForm.MatKhau || $scope.userForm.MatKhau.trim() === '')) {
            alert('Vui lòng nhập mật khẩu!');
            return false;
        }
        
        if (!$scope.isEditMode && $scope.userForm.MatKhau && $scope.userForm.MatKhau.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return false;
        }
        
        if (!$scope.isEditMode && $scope.userForm.MatKhau !== $scope.userForm.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return false;
        }
        
        if (!$scope.userForm.HoTen || $scope.userForm.HoTen.trim() === '') {
            alert('Vui lòng nhập họ tên!');
            return false;
        }
        
        if (!$scope.userForm.Email || $scope.userForm.Email.trim() === '') {
            alert('Vui lòng nhập email!');
            return false;
        }
        
        // Validate email format
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test($scope.userForm.Email)) {
            alert('Email không hợp lệ!');
            return false;
        }
        
        if (!$scope.userForm.VaiTro) {
            alert('Vui lòng chọn vai trò!');
            return false;
        }
        
        return true;
    };
    
    // Get role text
    $scope.getRoleText = function(role) {
        switch(role) {
            case 'admin': return 'Quản trị viên';
            case 'driver': return 'Tài xế';
            case 'customer': return 'Khách hàng';
            default: return role;
        }
    };
    
    // Show change password modal
    $scope.showChangePasswordModal = function(user) {
        console.log('[Users] Opening change password modal for:', user);
        $scope.selectedUserId = user.maNguoiDung;
        $scope.selectedUserName = user.hoTen;
        $scope.passwordForm = {
            newPassword: '',
            confirmPassword: ''
        };
        $scope.showPasswordModal = true;
    };
    
    // Close password modal
    $scope.closePasswordModal = function() {
        $scope.showPasswordModal = false;
        $scope.passwordForm = {};
        $scope.selectedUserId = null;
    };
    
    // Change password
    $scope.changePassword = function() {
        if (!$scope.passwordForm.newPassword || $scope.passwordForm.newPassword.trim() === '') {
            alert('Vui lòng nhập mật khẩu mới!');
            return;
        }
        
        if ($scope.passwordForm.newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        if ($scope.passwordForm.newPassword !== $scope.passwordForm.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        $scope.isLoading = true;
        
        apiService.updatePassword($scope.selectedUserId, $scope.passwordForm.newPassword)
            .then(function(response) {
                console.log('[Users] Password updated:', response);
                alert('Đổi mật khẩu thành công!');
                $scope.closePasswordModal();
            })
            .catch(function(error) {
                console.error('[Users] Error updating password:', error);
                alert('Không thể đổi mật khẩu: ' + (error.message || 'Lỗi không xác định'));
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Toggle user status
    $scope.toggleUserStatus = function(user) {
        var newStatus = user.trangThai === 'HOAT_DONG' ? 'VO_HIEU_HOA' : 'HOAT_DONG';
        var statusText = newStatus === 'HOAT_DONG' ? 'kích hoạt' : 'vô hiệu hóa';
        
        if (!confirm('Bạn có chắc muốn ' + statusText + ' tài khoản "' + user.hoTen + '"?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        apiService.updateStatus(user.maNguoiDung, newStatus)
            .then(function(response) {
                console.log('[Users] Status updated:', response);
                alert('Đã ' + statusText + ' tài khoản thành công!');
                $scope.loadUsers();
            })
            .catch(function(error) {
                console.error('[Users] Error updating status:', error);
                alert('Không thể cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'));
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Format date
    $scope.formatDate = utilsService.formatDate;
    
    // Logout
    $scope.logout = function() {
        utilsService.logout();
    };
    
    // Load users on init
    $scope.loadUsers();
}]);
