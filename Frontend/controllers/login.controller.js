// Login Controller - AngularJS
app.controller('LoginController', ['$scope', '$window', 'apiService', 'utilsService', 
    function($scope, $window, apiService, utilsService) {
    
    // Initialize
    $scope.loginData = {
        username: '',
        password: '',
        rememberMe: false
    };
    
    $scope.errors = {
        username: '',
        password: '',
        general: ''
    };
    
    $scope.isLoading = false;
    $scope.showPassword = false;
    
    // Kiểm tra đã đăng nhập chưa
    function checkAuth() {
        var user = utilsService.getUser();
        if (user) {
            // Chuyển hướng theo role
            switch(user.role) {
                case 'admin':
                    $window.location.href = 'index.html';
                    break;
                case 'driver':
                    $window.location.href = 'index-driver.html';
                    break;
                case 'customer':
                    $window.location.href = 'index-customer.html';
                    break;
                default:
                    $window.location.href = 'index.html';
            }
        }
    }
    
    // Kiểm tra remember me
    if ($window.localStorage.getItem('rememberMe') === 'true') {
        var savedUser = $window.localStorage.getItem('loggedInUser');
        if (savedUser) {
            $window.location.href = 'index.html';
        }
    }
    
    // Validate form
    $scope.validateForm = function() {
        var isValid = true;
        $scope.errors = {
            username: '',
            password: '',
            general: ''
        };
        
        // Validate username
        if (!$scope.loginData.username || !$scope.loginData.username.trim()) {
            $scope.errors.username = 'Vui lòng nhập tên đăng nhập';
            isValid = false;
        } else if ($scope.loginData.username.length < 3) {
            $scope.errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
            isValid = false;
        }
        
        // Validate password
        if (!$scope.loginData.password) {
            $scope.errors.password = 'Vui lòng nhập mật khẩu';
            isValid = false;
        } else if ($scope.loginData.password.length < 6) {
            $scope.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }
        
        return isValid;
    };
    
    // Toggle password visibility
    $scope.togglePassword = function() {
        $scope.showPassword = !$scope.showPassword;
    };
    
    // Clear errors on input
    $scope.clearError = function(field) {
        if (field) {
            $scope.errors[field] = '';
        }
        $scope.errors.general = '';
    };
    
    // Handle login
    $scope.login = function() {
        // Validate
        if (!$scope.validateForm()) {
            return;
        }
        
        $scope.isLoading = true;
        $scope.errors.general = '';
        
        // Gọi API login
        apiService.login($scope.loginData.username, $scope.loginData.password)
            .then(function(response) {
                console.log('Login successful:', response);
                
                // Kiểm tra status của user
                if (response.status && response.status === 'inactive') {
                    $scope.errors.general = 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin!';
                    $scope.isLoading = false;
                    return;
                }
                
                // Backend trả về với chữ cái đầu viết HOA (C# convention)
                // Chuẩn bị user data - map từ C# naming sang JavaScript naming
                var userData = {
                    username: response.TenDangNhap || response.tenDangNhap || $scope.loginData.username,
                    fullName: response.HoTen || response.hoTen || '',
                    role: (response.VaiTro || response.vaiTro || response.role || 'customer').toLowerCase(), // Normalize to lowercase
                    email: response.Email || response.email || '',
                    phone: response.SoDienThoai || response.soDienThoai || response.phone || '',
                    address: response.DiaChi || response.diaChi || response.address || '',
                    userId: response.MaNguoiDung || response.maNguoiDung || response.id,
                    id: response.MaNguoiDung || response.maNguoiDung || response.id,
                    loginTime: new Date().toISOString()
                };
                
                // Thêm token nếu có
                if (response.token || response.Token) {
                    userData.token = response.token || response.Token;
                }
                
                console.log('User data prepared:', userData);
                
                // Lưu user data
                utilsService.saveUser(userData, $scope.loginData.rememberMe);
                
                // Chuyển hướng theo role
                setTimeout(function() {
                    switch(userData.role) {
                        case 'admin':
                            $window.location.href = 'index.html';
                            break;
                        case 'driver':
                            $window.location.href = 'index-driver.html';
                            break;
                        case 'customer':
                            $window.location.href = 'index-customer.html';
                            break;
                        default:
                            $window.location.href = 'index.html';
                    }
                }, 1000);
                
            })
            .catch(function(error) {
                console.error('Login error:', error);
                $scope.isLoading = false;
                
                if (error.status === 401) {
                    $scope.errors.general = 'Tên đăng nhập hoặc mật khẩu không đúng!';
                } else if (error.status === 0) {
                    $scope.errors.general = 'Không thể kết nối đến server. Vui lòng kiểm tra lại!';
                } else {
                    $scope.errors.general = error.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!';
                }
            });
    };
    
    // Handle forgot password
    $scope.forgotPassword = function() {
        alert('Chức năng khôi phục mật khẩu sẽ được cập nhật sau.\n\nVui lòng liên hệ admin để được hỗ trợ.');
    };
    
    // Check auth on load
    checkAuth();
}]);
