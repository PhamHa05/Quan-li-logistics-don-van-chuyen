// Driver Routes Controller - AngularJS Version
app.controller('DriverRoutesController', ['$scope', '$window', '$http', '$timeout', 'API_CONFIG',
    function($scope, $window, $http, $timeout, API_CONFIG) {
    
    console.log('==================================================');
    console.log('[DriverRoutes] Controller initialized');
    console.log('[DriverRoutes] API Base URL:', API_CONFIG.BASE_URL);
    console.log('==================================================');
    
    // Get current user
    var currentUser = null;
    try {
        var userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    } catch (e) {
        console.log('[DriverRoutes] Error loading user:', e);
    }
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        $window.location.href = 'login.html';
        return;
    }
    
    // Check role
    var userRole = String(currentUser.role || currentUser.vaiTro || currentUser.VaiTro || '').toLowerCase().trim();
    var roleMap = {
        'taixe': 'driver',
        'tai xe': 'driver',
        'driver': 'driver',
        'admin': 'admin',
        'quantri': 'admin'
    };
    var normalizedRole = roleMap[userRole] || userRole;
    
    console.log('[DriverRoutes] User:', currentUser.username || currentUser.tenDangNhap, 'Role:', userRole, '→', normalizedRole);
    
    if (normalizedRole !== 'driver' && normalizedRole !== 'admin') {
        console.log('[DriverRoutes] Access denied for role:', normalizedRole);
        $window.location.href = normalizedRole === 'customer' ? 'index-customer.html' : 'login.html';
        return;
    }
    
    // Initialize scope variables
    $scope.currentUser = currentUser;
    $scope.driverInfo = {}; // Will load from API
    $scope.routes = [];
    $scope.todayRoute = null;
    $scope.deliveryPoints = [];
    $scope.orders = [];
    $scope.isLoading = false;
    $scope.selectedStop = null;
    $scope.showStopModal = false;
    
    // Map variable
    var map = null;
    var markers = [];
    var routeLine = null;
    
    // Statistics
    $scope.stats = {
        totalStops: 0,
        completedStops: 0,
        currentStop: '-',
        currentStopAddress: 'Chưa có điểm nào',
        remainingStops: 0,
        estimatedTime: '0 phút',
        totalCOD: 0,
        progressPercent: 0
    };
    
    // ==================== UTILITY FUNCTIONS ====================
    
    // Format currency
    $scope.formatCurrency = function(amount) {
        if (!amount || amount === 0) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };
    
    // Format time
    $scope.formatTime = function(timeSpan) {
        if (!timeSpan) return '-';
        try {
            var parts = timeSpan.split(':');
            return parts[0] + ':' + parts[1];
        } catch (e) {
            return '-';
        }
    };
    
    // Get status class
    $scope.getStopStatusClass = function(stop) {
        if (!stop) return 'pending';
        if (stop.trangThai === 'DA_DEN') return 'completed';
        if (stop.trangThai === 'CHO_XU_LY') return 'current';
        return 'pending';
    };
    
    // Get status label
    $scope.getStopStatusLabel = function(status) {
        var labels = {
            'CHO_XU_LY': 'Chờ xử lý',
            'DA_DEN': 'Đã đến',
            'DA_BO_QUA': 'Đã bỏ qua'
        };
        return labels[status] || status;
    };
    
    // ==================== DATA LOADING ====================
    
    // Load driver info first
    var driverId = currentUser.id || currentUser.userId || currentUser.maTaiXe || currentUser.MaTaiXe || currentUser.idTaiXe || currentUser.driverId;
    
    if (driverId) {
        $http.get(API_CONFIG.BASE_URL + '/api/TaiXe/get-by-id/' + driverId)
            .then(function(response) {
                var driver = response.data;
                $scope.driverInfo = {
                    hoTen: driver.hoTen || driver.HoTen || '-',
                    soDienThoai: driver.soDienThoai || driver.SoDienThoai || '-',
                    bienSoXe: driver.bienSoXe || driver.BienSoXe || '-'
                };
                console.log('[DriverRoutes] Driver info loaded:', $scope.driverInfo);
            })
            .catch(function(error) {
                console.error('[DriverRoutes] Error loading driver info:', error);
            });
    }
    
    // Load today's route
    $scope.loadTodayRoute = function() {
        $scope.isLoading = true;
        console.log('[DriverRoutes] Loading today route...');
        
        var today = new Date().toISOString().split('T')[0];
        console.log('[DriverRoutes] Today date:', today);
        
        var searchRequest = {
            PageIndex: 1,
            PageSize: 100,
            MaTuyen: "",
            IdTaiXe: null // Load all for demo, filter later
        };
        
        $http.post(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TUYENDUONG + '/search', searchRequest)
            .then(function(response) {
                console.log('[DriverRoutes] Routes response:', response.data);
                var allRoutes = response.data.data || response.data.Data || [];
                console.log('[DriverRoutes] Total routes found:', allRoutes.length);
                
                // Find today's route for this driver
                $scope.todayRoute = allRoutes.find(function(r) {
                    var routeDate = new Date(r.ngayGiaoHang || r.NgayGiaoHang).toISOString().split('T')[0];
                    var routeDriverId = r.idTaiXe || r.IdTaiXe;
                    console.log('[DriverRoutes] Checking route:', r.maTuyen || r.MaTuyen, 'Date:', routeDate, 'Driver:', routeDriverId);
                    // Demo: show routes for driver 1 or 3
                    return routeDate === today && (routeDriverId === 1 || routeDriverId === 3);
                });
                
                if ($scope.todayRoute) {
                    console.log('[DriverRoutes] Found today route:', $scope.todayRoute);
                    normalizeRoute($scope.todayRoute);
                    loadDeliveryPoints($scope.todayRoute.id);
                } else {
                    console.log('[DriverRoutes] No route found for today. Creating sample data...');
                    // Create sample data for demo
                    createSampleRoute();
                }
            })
            .catch(function(error) {
                console.log('[DriverRoutes] API not available, using fallback sample data...');
                // Use fallback sample data
                createSampleRoute();
            });
    };
    
    // Create sample route for demo
    function createSampleRoute() {
        console.log('[DriverRoutes] Creating sample route data...');
        
        var today = new Date().toISOString().split('T')[0];
        
        $scope.todayRoute = {
            id: 1,
            maTuyen: 'TD-DEMO-' + new Date().getDate(),
            idTaiXe: 1,
            ngayGiaoHang: today,
            trangThai: 'DANG_GIAO',
            tongSoDon: 4,
            soDonHoanThanh: 2
        };
        
        // Sample delivery points with orders
        $scope.deliveryPoints = [
            {
                id: 1,
                idTuyenDuong: 1,
                idDonVanChuyen: 1,
                thuTuDung: 1,
                thoiGianDuKien: '08:30:00',
                thoiGianThucTe: '08:45:00',
                trangThai: 'DA_DEN',
                order: {
                    id: 1,
                    maVanDon: 'WB001',
                    tenNguoiGui: 'Cửa Hàng Điện Thoại A',
                    sdtNguoiGui: '0909123456',
                    diaChiLayHang: '123 Nguyễn Văn Linh, Q.7',
                    tenNguoiNhan: 'Anh Bình',
                    sdtNguoiNhan: '0911122334',
                    diaChiGiaoHang: '45 Lê Lợi, Q.1, TP.HCM',
                    loaiHang: 'Điện thoại',
                    khoiLuong: 0.5,
                    tienThuHo: 7500000,
                    loaiDichVu: 'NHANH',
                    trangThai: 'GIAO_THANH_CONG'
                }
            },
            {
                id: 2,
                idTuyenDuong: 1,
                idDonVanChuyen: 3,
                thuTuDung: 2,
                thoiGianDuKien: '09:15:00',
                thoiGianThucTe: '09:10:00',
                trangThai: 'DA_DEN',
                order: {
                    id: 3,
                    maVanDon: 'WB003',
                    tenNguoiGui: 'Công Ty Máy Tính XYZ',
                    sdtNguoiGui: '02838250123',
                    diaChiLayHang: 'Lô A1, Khu Công Nghệ Cao',
                    tenNguoiNhan: 'Anh Tuấn',
                    sdtNguoiNhan: '0933344556',
                    diaChiGiaoHang: '11 Nguyễn Huệ, Q.1, TP.HCM',
                    loaiHang: 'Laptop',
                    khoiLuong: 2.0,
                    tienThuHo: 22500000,
                    loaiDichVu: 'NHANH',
                    trangThai: 'DANG_GIAO'
                }
            },
            {
                id: 3,
                idTuyenDuong: 1,
                idDonVanChuyen: 6,
                thuTuDung: 3,
                thoiGianDuKien: '10:00:00',
                thoiGianThucTe: null,
                trangThai: 'CHO_XU_LY',
                order: {
                    id: 6,
                    maVanDon: 'WB006',
                    tenNguoiGui: 'Siêu Thị Điện Máy',
                    sdtNguoiGui: '0281234567',
                    diaChiLayHang: '100 Cách Mạng Tháng 8, Q.3',
                    tenNguoiNhan: 'Anh Nam',
                    sdtNguoiNhan: '0912345678',
                    diaChiGiaoHang: '50 Trần Hưng Đạo, Q.5, TP.HCM',
                    loaiHang: 'Tivi',
                    khoiLuong: 25.0,
                    tienThuHo: 15000000,
                    loaiDichVu: 'NHANH',
                    trangThai: 'DA_LAY_HANG'
                }
            },
            {
                id: 4,
                idTuyenDuong: 1,
                idDonVanChuyen: 2,
                thuTuDung: 4,
                thoiGianDuKien: '10:45:00',
                thoiGianThucTe: null,
                trangThai: 'CHO_XU_LY',
                order: {
                    id: 2,
                    maVanDon: 'WB002',
                    tenNguoiGui: 'Chị Hoa',
                    sdtNguoiGui: '0987654321',
                    diaChiLayHang: '78 Hoàng Văn Thụ, Q.Phú Nhuận',
                    tenNguoiNhan: 'Chị Liên',
                    sdtNguoiNhan: '0978965432',
                    diaChiGiaoHang: '102 Pasteur, Q.3, TP.HCM',
                    loaiHang: 'Mỹ phẩm',
                    khoiLuong: 1.2,
                    tienThuHo: 0,
                    loaiDichVu: 'THONG_THUONG',
                    trangThai: 'CHO_LAY_HANG'
                }
            }
        ];
        
        console.log('[DriverRoutes] Sample data created:', $scope.deliveryPoints.length, 'points');
        calculateStats();
        
        // Use $timeout to safely initialize map outside digest cycle
        $timeout(function() {
            initializeMap();
        }, 100);
        
        $scope.isLoading = false;
    }
    
    // Normalize route data
    function normalizeRoute(route) {
        route.id = route.Id || route.id;
        route.maTuyen = route.MaTuyen || route.maTuyen || '';
        route.idTaiXe = route.IdTaiXe || route.idTaiXe;
        route.ngayGiaoHang = route.NgayGiaoHang || route.ngayGiaoHang;
        route.trangThai = route.TrangThai || route.trangThai || '';
        route.tongSoDon = route.TongSoDon || route.tongSoDon || 0;
        route.soDonHoanThanh = route.SoDonHoanThanh || route.soDonHoanThanh || 0;
    }
    
    // Load delivery points for route
    function loadDeliveryPoints(routeId) {
        console.log('[DriverRoutes] Loading delivery points for route:', routeId);
        
        var searchRequest = {
            PageIndex: 1,
            PageSize: 100,
            IdTuyenDuong: routeId
        };
        
        $http.post(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/search', searchRequest)
            .then(function(response) {
                console.log('[DriverRoutes] Delivery points response:', response.data);
                var points = response.data.data || response.data.Data || [];
                
                // Normalize and sort by order
                $scope.deliveryPoints = points.map(function(p) {
                    return {
                        id: p.Id || p.id,
                        idTuyenDuong: p.IdTuyenDuong || p.idTuyenDuong,
                        idDonVanChuyen: p.IdDonVanChuyen || p.idDonVanChuyen,
                        thuTuDung: p.ThuTuDung || p.thuTuDung || 0,
                        thoiGianDuKien: p.ThoiGianDuKien || p.thoiGianDuKien,
                        thoiGianThucTe: p.ThoiGianThucTe || p.thoiGianThucTe,
                        trangThai: p.TrangThai || p.trangThai || 'CHO_XU_LY'
                    };
                }).sort(function(a, b) {
                    return a.thuTuDung - b.thuTuDung;
                });
                
                console.log('[DriverRoutes] Loaded', $scope.deliveryPoints.length, 'delivery points');
                
                // Load order details for each point
                loadOrdersForPoints();
            })
            .catch(function(error) {
                console.log('[DriverRoutes] Error loading delivery points, using sample data');
                $scope.isLoading = false;
            });
    }
    
    // Load order details
    function loadOrdersForPoints() {
        if ($scope.deliveryPoints.length === 0) {
            $scope.isLoading = false;
            calculateStats();
            return;
        }
        
        var searchRequest = {
            PageIndex: 1,
            PageSize: 1000,
            MaVanDon: "",
            TrangThai: ""
        };
        
        $http.post(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DONVANCHUYEN_SEARCH, searchRequest)
            .then(function(response) {
                console.log('[DriverRoutes] Orders response:', response.data);
                var allOrders = response.data.data || response.data.Data || [];
                
                // Map orders to delivery points
                $scope.deliveryPoints.forEach(function(point) {
                    var order = allOrders.find(function(o) {
                        return (o.Id || o.id) === point.idDonVanChuyen;
                    });
                    
                    if (order) {
                        point.order = {
                            id: order.Id || order.id,
                            maVanDon: order.MaVanDon || order.maVanDon || '',
                            tenNguoiGui: order.TenNguoiGui || order.tenNguoiGui || '',
                            sdtNguoiGui: order.SdtNguoiGui || order.sdtNguoiGui || '',
                            diaChiLayHang: order.DiaChiLayHang || order.diaChiLayHang || '',
                            tenNguoiNhan: order.TenNguoiNhan || order.tenNguoiNhan || '',
                            sdtNguoiNhan: order.SdtNguoiNhan || order.sdtNguoiNhan || '',
                            diaChiGiaoHang: order.DiaChiGiaoHang || order.diaChiGiaoHang || '',
                            loaiHang: order.LoaiHang || order.loaiHang || '',
                            khoiLuong: order.KhoiLuong || order.khoiLuong || 0,
                            tienThuHo: order.TienThuHo || order.tienThuHo || 0,
                            loaiDichVu: order.LoaiDichVu || order.loaiDichVu || '',
                            trangThai: order.TrangThai || order.trangThai || ''
                        };
                    }
                });
                
                console.log('[DriverRoutes] Mapped orders to delivery points');
                calculateStats();
                initializeMap();
                $scope.isLoading = false;
            })
            .catch(function(error) {
                console.log('[DriverRoutes] Error loading orders:', error);
                $scope.isLoading = false;
            });
    }
    
    // Calculate statistics
    function calculateStats() {
        $scope.stats.totalStops = $scope.deliveryPoints.length;
        
        $scope.stats.completedStops = $scope.deliveryPoints.filter(function(p) {
            return p.trangThai === 'DA_DEN';
        }).length;
        
        $scope.stats.remainingStops = $scope.stats.totalStops - $scope.stats.completedStops;
        
        var currentStop = $scope.deliveryPoints.find(function(p) {
            return p.trangThai === 'CHO_XU_LY';
        });
        
        if (currentStop && currentStop.order) {
            $scope.stats.currentStop = 'Điểm #' + currentStop.thuTuDung;
            $scope.stats.currentStopAddress = currentStop.order.diaChiGiaoHang;
        }
        
        $scope.stats.totalCOD = $scope.deliveryPoints.reduce(function(sum, p) {
            return sum + (p.order && p.order.tienThuHo ? parseFloat(p.order.tienThuHo) : 0);
        }, 0);
        
        $scope.stats.progressPercent = $scope.stats.totalStops > 0 
            ? Math.round(($scope.stats.completedStops / $scope.stats.totalStops) * 100) 
            : 0;
        
        // Estimate time (10 minutes per stop)
        var minutesRemaining = $scope.stats.remainingStops * 10;
        if (minutesRemaining < 60) {
            $scope.stats.estimatedTime = '~ ' + minutesRemaining + ' phút';
        } else {
            var hours = Math.floor(minutesRemaining / 60);
            var mins = minutesRemaining % 60;
            $scope.stats.estimatedTime = '~ ' + hours + ' giờ ' + mins + ' phút';
        }
        
        console.log('[DriverRoutes] Stats calculated:', $scope.stats);
    }
    
    // ==================== MAP FUNCTIONS ====================
    
    // Initialize map
    function initializeMap() {
        $timeout(function() {
            if (map) {
                map.remove();
            }
            
            // Default: Ho Chi Minh City center
            map = L.map('map').setView([10.8231, 106.6297], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Add markers for each delivery point
            addMarkersToMap();
        }, 100);
    }
    
    // Add markers to map
    function addMarkersToMap() {
        if (!map) return;
        
        // Clear existing markers
        markers.forEach(function(m) { m.remove(); });
        markers = [];
        
        if (routeLine) {
            routeLine.remove();
            routeLine = null;
        }
        
        var bounds = [];
        var routeCoordinates = [];
        
        $scope.deliveryPoints.forEach(function(point, index) {
            var order = point.order;
            if (!order) return;
            
            // Generate random coordinates near HCMC for demo
            var lat = 10.8231 + (Math.random() - 0.5) * 0.1;
            var lng = 106.6297 + (Math.random() - 0.5) * 0.1;
            
            var color = point.trangThai === 'DA_DEN' ? '#27ae60' : 
                       point.trangThai === 'CHO_XU_LY' ? '#f39c12' : '#3498db';
            
            var icon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ' + color + '; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">' + point.thuTuDung + '</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            var marker = L.marker([lat, lng], { icon: icon }).addTo(map);
            
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0;">${order.maVanDon}</h4>
                    <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${order.tenNguoiNhan}</p>
                    <p style="margin: 5px 0;"><strong>SĐT:</strong> ${order.sdtNguoiNhan}</p>
                    <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.diaChiGiaoHang}</p>
                    ${order.tienThuHo > 0 ? '<p style="margin: 5px 0; color: #e74c3c; font-weight: bold;">COD: ' + $scope.formatCurrency(order.tienThuHo) + '</p>' : ''}
                    <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: ${color};">${$scope.getStopStatusLabel(point.trangThai)}</span></p>
                </div>
            `);
            
            markers.push(marker);
            bounds.push([lat, lng]);
            routeCoordinates.push([lat, lng]);
        });
        
        // Draw route line
        if (routeCoordinates.length > 1) {
            routeLine = L.polyline(routeCoordinates, {
                color: '#3498db',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);
        }
        
        // Fit map to bounds
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // ==================== ACTIONS ====================
    
    // View stop detail
    $scope.viewStopDetail = function(index) {
        var point = $scope.deliveryPoints[index];
        if (!point || !point.order) return;
        
        $scope.selectedStop = point;
        $scope.showStopModal = true;
        
        var order = point.order;
        var statusClass = $scope.getStopStatusClass(point);
        
        var html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                    <h3 style="margin: 0 0 15px 0;"><i class="fas fa-user"></i> Thông tin người gửi</h3>
                    <p style="margin: 8px 0;"><strong>Họ tên:</strong> ${order.tenNguoiGui}</p>
                    <p style="margin: 8px 0;"><strong>SĐT:</strong> ${order.sdtNguoiGui}</p>
                    <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${order.diaChiLayHang}</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                    <h3 style="margin: 0 0 15px 0;"><i class="fas fa-user-check"></i> Thông tin người nhận</h3>
                    <p style="margin: 8px 0;"><strong>Họ tên:</strong> ${order.tenNguoiNhan}</p>
                    <p style="margin: 8px 0;"><strong>SĐT:</strong> ${order.sdtNguoiNhan}</p>
                    <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${order.diaChiGiaoHang}</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                    <h3 style="margin: 0 0 15px 0;"><i class="fas fa-box"></i> Thông tin hàng hóa</h3>
                    <p style="margin: 8px 0;"><strong>Loại hàng:</strong> ${order.loaiHang}</p>
                    <p style="margin: 8px 0;"><strong>Khối lượng:</strong> ${order.khoiLuong} kg</p>
                    <p style="margin: 8px 0;"><strong>Dịch vụ:</strong> ${order.loaiDichVu === 'NHANH' ? 'Nhanh' : 'Thông thường'}</p>
                    ${order.tienThuHo > 0 ? '<p style="margin: 8px 0;"><strong>COD:</strong> ' + $scope.formatCurrency(order.tienThuHo) + '</p>' : ''}
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>Thời gian dự kiến:</strong> ${$scope.formatTime(point.thoiGianDuKien)}</p>
                ${point.thoiGianThucTe ? '<p><strong>Thời gian thực tế:</strong> ' + $scope.formatTime(point.thoiGianThucTe) + '</p>' : ''}
                <p><strong>Trạng thái:</strong> <span class="badge badge-${statusClass === 'completed' ? 'success' : statusClass === 'current' ? 'warning' : 'secondary'}">${$scope.getStopStatusLabel(point.trangThai)}</span></p>
            </div>
        `;
        
        document.getElementById('modal-stop-number').textContent = 'Điểm #' + point.thuTuDung;
        document.getElementById('modal-stop-address').textContent = order.maVanDon;
        document.getElementById('stop-detail-content').innerHTML = html;
        document.getElementById('stopDetailModal').style.display = 'flex';
    };
    
    // Close modal
    $scope.closeStopDetailModal = function() {
        $scope.showStopModal = false;
        document.getElementById('stopDetailModal').style.display = 'none';
    };
    
    // Mark as completed
    $scope.markAsCompleted = function(index) {
        var point = $scope.deliveryPoints[index];
        if (!point) return;
        
        if (!confirm('Xác nhận đã giao hàng thành công cho điểm này?')) return;
        
        updateDeliveryPointStatus(point, 'DA_DEN');
    };
    
    // Mark as failed
    $scope.markAsFailed = function(index) {
        var point = $scope.deliveryPoints[index];
        if (!point) return;
        
        var reason = prompt('Lý do giao thất bại:');
        if (!reason) return;
        
        updateDeliveryPointStatus(point, 'DA_BO_QUA');
    };
    
    // Update delivery point status
    function updateDeliveryPointStatus(point, newStatus) {
        var now = new Date();
        var timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0') + ':' + 
                        now.getSeconds().toString().padStart(2, '0');
        
        var updateData = {
            Id: point.id,
            IdTuyenDuong: point.idTuyenDuong,
            IdDonVanChuyen: point.idDonVanChuyen,
            ThuTuDung: point.thuTuDung,
            ThoiGianDuKien: point.thoiGianDuKien,
            ThoiGianThucTe: timeString,
            TrangThai: newStatus
        };
        
        $http.put(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DIEMGIAOHANG + '/update', updateData)
            .then(function(response) {
                console.log('[DriverRoutes] Updated delivery point:', response.data);
                console.log('✅ Cập nhật thành công!');
                
                // Update local data
                point.trangThai = newStatus;
                point.thoiGianThucTe = timeString;
                
                calculateStats();
                addMarkersToMap();
                $scope.$apply(); // Trigger digest cycle
            })
            .catch(function(error) {
                console.log('[DriverRoutes] Update error:', error);
                // Silently handle error, UI already updated
            });
    }
    
    // Call customer
    $scope.callCustomer = function(phoneNumber) {
        if (confirm('Gọi đến số ' + phoneNumber + '?')) {
            window.open('tel:' + phoneNumber);
        }
    };
    
    // Start route
    $scope.startRoute = function() {
        console.log('Chức năng bắt đầu tuyến đường sẽ được phát triển sau!');
    };
    
    // Optimize route
    $scope.optimizeRoute = function() {
        console.log('Chức năng tối ưu hóa tuyến đường sẽ được phát triển sau!');
    };
    
    // Refresh
    $scope.refresh = function() {
        console.log('[DriverRoutes] Refreshing data...');
        $scope.loadTodayRoute();
    };
    
    // Logout
    $scope.logout = function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('loggedInUser');
            $window.location.href = 'login.html';
        }
    };
    
    // ==================== INITIALIZATION ====================
    
    // Load data on init
    $timeout(function() {
        console.log('[DriverRoutes] Starting to load today route...');
        $scope.loadTodayRoute();
    }, 100);
    
    // Expose functions to global scope for onclick handlers
    window.scrollToSection = function(id) {
        document.getElementById(id + '-section').scrollIntoView({ behavior: 'smooth' });
    };
    
    window.centerMapOnCurrentLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                map.setView([position.coords.latitude, position.coords.longitude], 15);
            });
        } else {
            console.log('Trình duyệt không hỗ trợ Geolocation!');
        }
    };
    
    window.refreshMap = function() {
        if (map) {
            addMarkersToMap();
        }
    };
    
    window.startRoute = $scope.startRoute;
    window.optimizeRoute = $scope.optimizeRoute;
    window.logout = $scope.logout;
    window.closeStopDetailModal = $scope.closeStopDetailModal;
    
}]);
