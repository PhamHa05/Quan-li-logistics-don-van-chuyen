// Customer Create Order Controller - AngularJS
app.controller('CustomerCreateOrderController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerCreateOrder] Controller loaded - v2.0 with Database Integration');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerCreateOrder] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerCreateOrder] Error loading user:', e);
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
    
    // Initialize
    $scope.currentUser = currentUser;
    $scope.isLoading = false;
    $scope.calculatedFee = 25000; // Default fee
    
    // Initialize order form with proper backend property names
    $scope.orderForm = {
        // Thông tin người gửi - Match backend model
        TenNguoiGui: '',
        SdtNguoiGui: '',
        DiaChiLayHang: '',
        
        // Thông tin người nhận
        TenNguoiNhan: '',
        SdtNguoiNhan: '',
        DiaChiGiaoHang: '',
        
        // Thông tin hàng hóa
        LoaiHang: '',
        KhoiLuong: null,
        TienThuHo: 0,
        MoTa: '',
        
        // Dịch vụ bổ sung
        Insurance: false,
        Fragile: false,
        Express: false,
        
        // Ghi chú
        GhiChu: '',
        
        // Service type for fee calculation
        LoaiDichVu: 'standard'
    };
    
    // Load customer info from database
    $scope.loadCustomerInfo = function() {
        var userId = currentUser.userId || currentUser.maNguoiDung || currentUser.Id;
        if (!userId) {
            console.warn('[CustomerCreateOrder] No userId found, skipping customer info load');
            return;
        }
        
        console.log('[CustomerCreateOrder] Loading customer info for userId:', userId);
        
        apiService.getNguoiDungById(userId)
            .then(function(response) {
                console.log('[CustomerCreateOrder] Customer info loaded:', response);
                var userData = response.data || response;
                
                // Backend returns camelCase (maNguoiDung, hoTen, soDienThoai, etc.)
                // Update current user with fresh data
                $scope.currentUser = {
                    userId: userData.maNguoiDung || userData.Id || userData.id,
                    username: userData.tenDangNhap || userData.TenDangNhap,
                    fullName: userData.hoTen || userData.HoTen,
                    hoTen: userData.hoTen || userData.HoTen,
                    phone: userData.soDienThoai || userData.SoDienThoai,
                    email: userData.email || userData.Email,
                    address: userData.diaChi || userData.DiaChi,
                    role: userData.vaiTro || userData.VaiTro
                };
                
                // Pre-fill sender info
                $scope.orderForm.TenNguoiGui = $scope.currentUser.fullName || '';
                $scope.orderForm.SdtNguoiGui = $scope.currentUser.phone || '';
                $scope.orderForm.DiaChiLayHang = $scope.currentUser.address || '';
                
                console.log('[CustomerCreateOrder] Pre-filled sender info:', {
                    TenNguoiGui: $scope.orderForm.TenNguoiGui,
                    SdtNguoiGui: $scope.orderForm.SdtNguoiGui,
                    DiaChiLayHang: $scope.orderForm.DiaChiLayHang
                });
                
                // Apply scope changes
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            })
            .catch(function(error) {
                console.error('[CustomerCreateOrder] Error loading customer info:', error);
                // Fallback to currentUser data if API fails
                $scope.fillSenderInfo();
            });
    };
    
    // Fill sender info from current user
    $scope.fillSenderInfo = function() {
        $scope.orderForm.TenNguoiGui = $scope.currentUser.fullName || $scope.currentUser.hoTen || '';
        $scope.orderForm.SdtNguoiGui = $scope.currentUser.phone || $scope.currentUser.soDienThoai || '';
        $scope.orderForm.DiaChiLayHang = $scope.currentUser.address || $scope.currentUser.diaChi || '';
        
        console.log('[CustomerCreateOrder] Filled sender info:', {
            TenNguoiGui: $scope.orderForm.TenNguoiGui,
            SdtNguoiGui: $scope.orderForm.SdtNguoiGui,
            DiaChiLayHang: $scope.orderForm.DiaChiLayHang
        });
    };
    
    // Calculate shipping fee based on weight and service options
    $scope.calculateShippingFee = function() {
        var weight = parseFloat($scope.orderForm.KhoiLuong) || 0;
        
        if (weight === 0) {
            $scope.calculatedFee = 0;
            return;
        }
        
        // Base fee calculation based on weight
        var baseFee = 0;
        if (weight <= 1) {
            baseFee = 20000;
        } else if (weight <= 5) {
            baseFee = 20000 + (weight - 1) * 8000;
        } else if (weight <= 10) {
            baseFee = 52000 + (weight - 5) * 6000;
        } else {
            baseFee = 82000 + (weight - 10) * 5000;
        }
        
        // Add insurance fee
        if ($scope.orderForm.Insurance) {
            baseFee += 20000;
        }
        
        // Add express fee
        if ($scope.orderForm.Express) {
            baseFee += 30000;
        }
        
        $scope.calculatedFee = Math.round(baseFee);
        console.log('[CustomerCreateOrder] Calculated fee:', $scope.calculatedFee, 'for weight:', weight);
    };
    
    // Watch for changes in weight and services to recalculate fee
    $scope.$watch('orderForm.KhoiLuong', $scope.calculateShippingFee);
    $scope.$watch('orderForm.Insurance', $scope.calculateShippingFee);
    $scope.$watch('orderForm.Express', $scope.calculateShippingFee);
    
    // Validate form before submission
    $scope.validateForm = function() {
        // Validate người gửi
        if (!$scope.orderForm.TenNguoiGui || !$scope.orderForm.TenNguoiGui.trim()) {
            alert('Vui lòng nhập tên người gửi!');
            return false;
        }
        if (!$scope.orderForm.SdtNguoiGui || !$scope.orderForm.SdtNguoiGui.trim()) {
            alert('Vui lòng nhập số điện thoại người gửi!');
            return false;
        }
        if (!$scope.orderForm.DiaChiLayHang || !$scope.orderForm.DiaChiLayHang.trim()) {
            alert('Vui lòng nhập địa chỉ lấy hàng!');
            return false;
        }
        
        // Validate người nhận
        if (!$scope.orderForm.TenNguoiNhan || !$scope.orderForm.TenNguoiNhan.trim()) {
            alert('Vui lòng nhập tên người nhận!');
            return false;
        }
        if (!$scope.orderForm.SdtNguoiNhan || !$scope.orderForm.SdtNguoiNhan.trim()) {
            alert('Vui lòng nhập số điện thoại người nhận!');
            return false;
        }
        if (!$scope.orderForm.DiaChiGiaoHang || !$scope.orderForm.DiaChiGiaoHang.trim()) {
            alert('Vui lòng nhập địa chỉ giao hàng!');
            return false;
        }
        
        // Validate hàng hóa
        if (!$scope.orderForm.LoaiHang) {
            alert('Vui lòng chọn loại hàng hóa!');
            return false;
        }
        if (!$scope.orderForm.KhoiLuong || $scope.orderForm.KhoiLuong <= 0) {
            alert('Vui lòng nhập khối lượng hợp lệ (> 0 kg)!');
            return false;
        }
        
        return true;
    };
    
    // Submit order to backend API
    $scope.submitOrder = function() {
        console.log('[CustomerCreateOrder] Submit order called');
        
        if (!$scope.validateForm()) {
            return;
        }
        
        if (!confirm('Bạn có chắc chắn muốn tạo đơn hàng này?')) {
            return;
        }
        
        $scope.isLoading = true;
        
        // Prepare order data matching backend DonVanChuyenModel
        var orderData = {
            // Backend expects these exact property names
            TenNguoiGui: $scope.orderForm.TenNguoiGui.trim(),
            SdtNguoiGui: $scope.orderForm.SdtNguoiGui.trim(),
            DiaChiLayHang: $scope.orderForm.DiaChiLayHang.trim(),
            TenNguoiNhan: $scope.orderForm.TenNguoiNhan.trim(),
            SdtNguoiNhan: $scope.orderForm.SdtNguoiNhan.trim(),
            DiaChiGiaoHang: $scope.orderForm.DiaChiGiaoHang.trim(),
            LoaiHang: $scope.orderForm.LoaiHang,
            KhoiLuong: parseFloat($scope.orderForm.KhoiLuong),
            TienThuHo: parseFloat($scope.orderForm.TienThuHo) || 0,
            LoaiDichVu: $scope.orderForm.Express ? 'Express' : 'Standard',
            TrangThai: 'CHO_LAY_HANG',
            MaVanDon: null // Will be generated by backend
        };
        
        // Add notes with service info
        var notes = [];
        if ($scope.orderForm.GhiChu && $scope.orderForm.GhiChu.trim()) {
            notes.push($scope.orderForm.GhiChu.trim());
        }
        if ($scope.orderForm.Insurance) {
            notes.push('[Bảo hiểm hàng hóa]');
        }
        if ($scope.orderForm.Fragile) {
            notes.push('[Hàng dễ vỡ - Cẩn thận]');
        }
        if ($scope.orderForm.MoTa && $scope.orderForm.MoTa.trim()) {
            notes.push('Mô tả: ' + $scope.orderForm.MoTa.trim());
        }
        
        // Note: Backend model doesn't have GhiChu field, will store in MoTa if needed
        
        console.log('[CustomerCreateOrder] Sending order data:', orderData);
        
        apiService.createDonVanChuyen(orderData)
            .then(function(response) {
                console.log('[CustomerCreateOrder] Order created successfully:', response);
                alert('✅ Tạo đơn hàng thành công!\n\nĐơn hàng của bạn đã được tạo. Tài xế sẽ đến lấy hàng trong vòng 2-4 giờ.');
                
                // Redirect to my orders page
                $timeout(function() {
                    $window.location.href = 'customer-my-orders.html';
                }, 500);
            })
            .catch(function(error) {
                console.error('[CustomerCreateOrder] Error creating order:', error);
                var errorMsg = 'Không thể tạo đơn hàng. Vui lòng thử lại!';
                
                if (error && error.data && error.data.message) {
                    errorMsg = 'Lỗi: ' + error.data.message;
                } else if (error && error.message) {
                    errorMsg = 'Lỗi: ' + error.message;
                }
                
                alert('❌ ' + errorMsg);
            })
            .finally(function() {
                $scope.isLoading = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
    };
    
    // Preview order
    $scope.previewOrder = function() {
        if (!$scope.validateForm()) {
            return;
        }
        
        var preview = '━━━━━━━━━━━━━━━━━━━━━━━\n';
        preview += '📦 XEM TRƯỚC ĐỞN HÀNG\n';
        preview += '━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        preview += '👤 NGƯỜI GỬI:\n';
        preview += '   • Tên: ' + $scope.orderForm.TenNguoiGui + '\n';
        preview += '   • SĐT: ' + $scope.orderForm.SdtNguoiGui + '\n';
        preview += '   • Địa chỉ: ' + $scope.orderForm.DiaChiLayHang + '\n\n';
        
        preview += '📍 NGƯỜI NHẬN:\n';
        preview += '   • Tên: ' + $scope.orderForm.TenNguoiNhan + '\n';
        preview += '   • SĐT: ' + $scope.orderForm.SdtNguoiNhan + '\n';
        preview += '   • Địa chỉ: ' + $scope.orderForm.DiaChiGiaoHang + '\n\n';
        
        preview += '📦 HÀNG HÓA:\n';
        preview += '   • Loại: ' + $scope.orderForm.LoaiHang + '\n';
        preview += '   • Khối lượng: ' + $scope.orderForm.KhoiLuong + ' kg\n';
        preview += '   • COD: ' + $scope.formatCurrency($scope.orderForm.TienThuHo) + '\n\n';
        
        preview += '⚙️ DỊCH VỤ:\n';
        if ($scope.orderForm.Insurance) preview += '   • Bảo hiểm hàng hóa\n';
        if ($scope.orderForm.Fragile) preview += '   • Hàng dễ vỡ\n';
        if ($scope.orderForm.Express) preview += '   • Giao hàng nhanh\n';
        if (!$scope.orderForm.Insurance && !$scope.orderForm.Fragile && !$scope.orderForm.Express) {
            preview += '   • Không có dịch vụ bổ sung\n';
        }
        
        preview += '\n💰 PHÍ VẬN CHUYỂN: ' + $scope.formatCurrency($scope.calculatedFee) + '\n';
        
        if ($scope.orderForm.GhiChu) {
            preview += '\n📝 GHI CHÚ:\n   ' + $scope.orderForm.GhiChu + '\n';
        }
        
        preview += '\n━━━━━━━━━━━━━━━━━━━━━━━';
        
        alert(preview);
    };
    
    // Reset form
    $scope.resetForm = function() {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ thông tin đã nhập?')) {
            return;
        }
        
        $scope.orderForm = {
            TenNguoiGui: '',
            SdtNguoiGui: '',
            DiaChiLayHang: '',
            TenNguoiNhan: '',
            SdtNguoiNhan: '',
            DiaChiGiaoHang: '',
            LoaiHang: '',
            KhoiLuong: null,
            TienThuHo: 0,
            MoTa: '',
            Insurance: false,
            Fragile: false,
            Express: false,
            GhiChu: '',
            LoaiDichVu: 'standard'
        };
        
        $scope.calculatedFee = 0;
        
        // Reload customer info
        $scope.loadCustomerInfo();
    };
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Get user initials
    $scope.getUserInitials = function() {
        var name = $scope.currentUser.fullName || $scope.currentUser.hoTen || $scope.currentUser.username || 'KH';
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
    
    // Initialize: Load customer info from database
    console.log('[CustomerCreateOrder] Initializing - loading customer info from database...');
    $scope.loadCustomerInfo();
}]);
