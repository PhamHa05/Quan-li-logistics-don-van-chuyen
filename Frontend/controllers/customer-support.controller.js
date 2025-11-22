// Customer Support Controller - AngularJS
app.controller('CustomerSupportController', ['$scope', '$window', '$timeout', 'apiService',
    function($scope, $window, $timeout, apiService) {
    
    console.log('='.repeat(50));
    console.log('[CustomerSupport] Controller loaded - v1.0 with Database Integration');
    console.log('='.repeat(50));
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            console.log('[CustomerSupport] Current user:', currentUser);
        }
    } catch (e) {
        console.error('[CustomerSupport] Error loading user:', e);
    }
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Initialize scope
    $scope.currentUser = currentUser;
    $scope.customerInfo = {};
    $scope.loading = false;
    $scope.submitting = false;
    $scope.error = null;
    $scope.success = null;
    
    // Contact form
    $scope.contactForm = {
        subject: '',
        category: 'general',
        message: '',
        priority: 'normal'
    };
    
    // Support tickets
    $scope.tickets = [];
    $scope.showTickets = false;
    
    // FAQ data
    $scope.faqs = [
        {
            id: 1,
            category: 'order',
            question: 'Làm thế nào để tạo đơn hàng mới?',
            answer: 'Bạn có thể tạo đơn hàng mới bằng cách vào menu "Tạo đơn hàng", điền đầy đủ thông tin người gửi và người nhận, sau đó nhấn "Tạo đơn hàng".',
            expanded: false
        },
        {
            id: 2,
            category: 'order',
            question: 'Làm sao để tra cứu đơn hàng?',
            answer: 'Vào menu "Đơn hàng của tôi" hoặc "Tra cứu đơn hàng", nhập mã vận đơn hoặc số điện thoại để tìm kiếm đơn hàng của bạn.',
            expanded: false
        },
        {
            id: 3,
            category: 'payment',
            question: 'Các hình thức thanh toán nào được hỗ trợ?',
            answer: 'Chúng tôi hỗ trợ thanh toán COD (thu hộ), chuyển khoản ngân hàng, và ví điện tử. Phí vận chuyển sẽ được tính tự động khi tạo đơn.',
            expanded: false
        },
        {
            id: 4,
            category: 'payment',
            question: 'Khi nào tôi nhận được tiền COD?',
            answer: 'Tiền COD sẽ được đối soát và chuyển về tài khoản của bạn trong vòng 3-5 ngày làm việc sau khi đơn hàng giao thành công.',
            expanded: false
        },
        {
            id: 5,
            category: 'shipping',
            question: 'Thời gian giao hàng dự kiến là bao lâu?',
            answer: 'Thời gian giao hàng phụ thuộc vào khoảng cách: Nội thành 1-2 ngày, Ngoại thành 2-3 ngày, Liên tỉnh 3-5 ngày.',
            expanded: false
        },
        {
            id: 6,
            category: 'shipping',
            question: 'Có thể thay đổi địa chỉ giao hàng sau khi đặt không?',
            answer: 'Có thể thay đổi địa chỉ khi đơn hàng chưa được shipper lấy. Vui lòng liên hệ hotline hoặc gửi yêu cầu qua form hỗ trợ.',
            expanded: false
        },
        {
            id: 7,
            category: 'account',
            question: 'Làm thế nào để đổi mật khẩu?',
            answer: 'Vào menu "Tài khoản", chọn "Đổi mật khẩu", nhập mật khẩu cũ và mật khẩu mới, sau đó xác nhận.',
            expanded: false
        },
        {
            id: 8,
            category: 'account',
            question: 'Tôi quên mật khẩu, phải làm sao?',
            answer: 'Nhấn "Quên mật khẩu" ở trang đăng nhập, nhập email đã đăng ký, chúng tôi sẽ gửi link reset mật khẩu về email của bạn.',
            expanded: false
        }
    ];
    
    $scope.filteredFaqs = $scope.faqs;
    $scope.faqFilter = 'all';
    
    // Contact info
    $scope.contactInfo = {
        hotline: '1900 1234',
        email: 'support@vanchuyendo.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        workingHours: 'Thứ 2 - Thứ 7: 8:00 - 18:00'
    };
    
    // Load customer info
    $scope.loadCustomerInfo = function() {
        var customerId = currentUser.id || currentUser.userId || currentUser.maNguoiDung || currentUser.MaNguoiDung;
        
        if (!customerId) {
            console.warn('[CustomerSupport] No customer ID found');
            return;
        }
        
        console.log('[CustomerSupport] Loading customer info for ID:', customerId);
        
        apiService.getNguoiDungById(customerId)
            .then(function(response) {
                var customer = response.data || response;
                console.log('[CustomerSupport] Customer info loaded:', customer);
                
                $scope.customerInfo = {
                    maNguoiDung: customer.maNguoiDung || customer.MaNguoiDung,
                    hoTen: customer.hoTen || customer.HoTen || '',
                    email: customer.email || customer.Email || '',
                    soDienThoai: customer.soDienThoai || customer.SoDienThoai || ''
                };
                
                // Pre-fill contact form with customer info
                if (!$scope.contactForm.email) {
                    $scope.contactForm.email = $scope.customerInfo.email;
                }
                if (!$scope.contactForm.phone) {
                    $scope.contactForm.phone = $scope.customerInfo.soDienThoai;
                }
                if (!$scope.contactForm.name) {
                    $scope.contactForm.name = $scope.customerInfo.hoTen;
                }
                
                if (!$scope.$$phase) $scope.$apply();
            })
            .catch(function(error) {
                console.error('[CustomerSupport] Error loading customer info:', error);
            });
    };
    
    // Toggle FAQ
    $scope.toggleFaq = function(faq) {
        faq.expanded = !faq.expanded;
    };
    
    // Filter FAQs
    $scope.filterFaqs = function(category) {
        $scope.faqFilter = category;
        if (category === 'all') {
            $scope.filteredFaqs = $scope.faqs;
        } else {
            $scope.filteredFaqs = $scope.faqs.filter(function(faq) {
                return faq.category === category;
            });
        }
    };
    
    // Submit contact form
    $scope.submitContactForm = function() {
        $scope.error = null;
        $scope.success = null;
        
        // Validation
        if (!$scope.contactForm.name || !$scope.contactForm.name.trim()) {
            $scope.error = 'Vui lòng nhập họ tên';
            return;
        }
        if (!$scope.contactForm.email || !$scope.contactForm.email.trim()) {
            $scope.error = 'Vui lòng nhập email';
            return;
        }
        if (!$scope.contactForm.phone || !$scope.contactForm.phone.trim()) {
            $scope.error = 'Vui lòng nhập số điện thoại';
            return;
        }
        if (!$scope.contactForm.subject || !$scope.contactForm.subject.trim()) {
            $scope.error = 'Vui lòng nhập tiêu đề';
            return;
        }
        if (!$scope.contactForm.message || !$scope.contactForm.message.trim()) {
            $scope.error = 'Vui lòng nhập nội dung';
            return;
        }
        
        $scope.submitting = true;
        
        // Create support ticket data
        var ticketData = {
            MaNguoiDung: $scope.customerInfo.maNguoiDung,
            HoTen: $scope.contactForm.name,
            Email: $scope.contactForm.email,
            SoDienThoai: $scope.contactForm.phone,
            TieuDe: $scope.contactForm.subject,
            DanhMuc: $scope.contactForm.category,
            NoiDung: $scope.contactForm.message,
            MucDo: $scope.contactForm.priority,
            ThoiGianTao: new Date().toISOString(),
            TrangThai: 'Chờ xử lý'
        };
        
        console.log('[CustomerSupport] Submitting support ticket:', ticketData);
        
        // Simulate API call (since we don't have support ticket endpoint yet)
        $timeout(function() {
            // Add to local tickets array
            var ticket = {
                id: Date.now(),
                maPhieu: 'SP' + Date.now(),
                ...ticketData,
                thoiGianTao: new Date()
            };
            
            $scope.tickets.unshift(ticket);
            
            $scope.success = 'Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi trong vòng 24h.';
            $scope.submitting = false;
            
            // Reset form
            $scope.contactForm = {
                name: $scope.customerInfo.hoTen,
                email: $scope.customerInfo.email,
                phone: $scope.customerInfo.soDienThoai,
                subject: '',
                category: 'general',
                message: '',
                priority: 'normal'
            };
            
            // Auto-hide success message
            $timeout(function() {
                $scope.success = null;
            }, 5000);
            
        }, 1000); // Simulate network delay
    };
    
    // Toggle tickets view
    $scope.toggleTickets = function() {
        $scope.showTickets = !$scope.showTickets;
    };
    
    // Get ticket status class
    $scope.getTicketStatusClass = function(status) {
        var statusMap = {
            'Chờ xử lý': 'badge-warning',
            'Đang xử lý': 'badge-info',
            'Đã hoàn thành': 'badge-success',
            'Đã hủy': 'badge-danger'
        };
        return statusMap[status] || 'badge-secondary';
    };
    
    // Get priority class
    $scope.getPriorityClass = function(priority) {
        var priorityMap = {
            'low': 'badge-secondary',
            'normal': 'badge-info',
            'high': 'badge-warning',
            'urgent': 'badge-danger'
        };
        return priorityMap[priority] || 'badge-secondary';
    };
    
    // Get priority text
    $scope.getPriorityText = function(priority) {
        var priorityMap = {
            'low': 'Thấp',
            'normal': 'Bình thường',
            'high': 'Cao',
            'urgent': 'Khẩn cấp'
        };
        return priorityMap[priority] || priority;
    };
    
    // Get category text
    $scope.getCategoryText = function(category) {
        var categoryMap = {
            'general': 'Câu hỏi chung',
            'order': 'Đơn hàng',
            'payment': 'Thanh toán',
            'shipping': 'Vận chuyển',
            'account': 'Tài khoản',
            'complaint': 'Khiếu nại',
            'other': 'Khác'
        };
        return categoryMap[category] || category;
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        if (!dateString) return '-';
        var date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + 
               date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
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
    
    // Initialize: Load customer info
    console.log('[CustomerSupport] Initializing - loading customer info...');
    $timeout(function() {
        $scope.loadCustomerInfo();
    }, 100);
}]);
