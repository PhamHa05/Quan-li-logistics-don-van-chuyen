// ==================== GLOBAL VARIABLES ====================
let currentDriver = null;
let myOrders = [];
let allOrders = [];
let allDrivers = [];
let allRoutes = [];
let myRoutes = [];
let routeStops = [];
let map = null;
let markers = [];
let routePolyline = null;
let userLocationMarker = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentDriver();
    initMap();
    setTimeout(() => {
        loadAllData();
        trackUserLocation();
    }, 300);
});

// ==================== AUTHENTICATION ====================
function loadCurrentDriver() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
    if (!userStr) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'login.html';
        return;
    }
    
    currentDriver = JSON.parse(userStr);
    
    // Check role - support Vietnamese and English
    const userRole = String(currentDriver.role || currentDriver.vaiTro || currentDriver.VaiTro || '').toLowerCase().trim();
    const isDriver = (userRole === 'driver' || userRole === 'taixe' || userRole === 'tai xe' || userRole === 'tài xế');
    const isAdmin = (userRole === 'admin' || userRole === 'quantri' || userRole === 'quản trị' || userRole === 'quan tri');
    
    if (!isDriver && !isAdmin) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    const initials = currentDriver.username ? currentDriver.username.substring(0, 2).toUpperCase() : 'TX';
    document.getElementById('driver-avatar').textContent = initials;
    document.getElementById('driver-name').textContent = currentDriver.fullname || currentDriver.username || 'Tài xế';
    
    console.log('[Driver Routes] Logged in as:', currentDriver);
}

// ==================== MAP INITIALIZATION ====================
function initMap() {
    // Initialize map centered on Vietnam
    map = L.map('map').setView([21.0285, 105.8542], 13); // Hanoi coordinates
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('[Map] Initialized');
}

// ==================== USER LOCATION TRACKING ====================
function trackUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log('[Location] User position:', lat, lng);
                
                // Remove old marker
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                // Add new marker for user location
                const icon = L.divIcon({
                    className: 'user-location-marker',
                    html: `<div style="
                        width: 20px; 
                        height: 20px; 
                        background: #3498db; 
                        border: 4px solid white;
                        border-radius: 50%; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        animation: pulse-location 2s infinite;
                    "></div>
                    <style>
                        @keyframes pulse-location {
                            0%, 100% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.3); opacity: 0.7; }
                        }
                    </style>`,
                    iconSize: [20, 20]
                });
                
                userLocationMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
                userLocationMarker.bindPopup('<strong>📍 Vị trí của bạn</strong>');
            },
            function(error) {
                console.warn('[Location] Error:', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

function centerMapOnCurrentLocation() {
    if (userLocationMarker) {
        map.setView(userLocationMarker.getLatLng(), 15);
        userLocationMarker.openPopup();
    } else {
        showNotification('Không thể xác định vị trí của bạn', 'warning');
    }
}

// ==================== DATA LOADING ====================
function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allDrivers = DataSync.get('drivers') || [];
        allRoutes = DataSync.get('routes') || [];
        console.log('[Driver Routes] Loaded via DataSync:', allOrders.length, 'orders,', allRoutes.length, 'routes');
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        allRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
        console.log('[Driver Routes] Loaded via localStorage:', allOrders.length, 'orders,', allRoutes.length, 'routes');
    }
    
    // Find driver info
    const driverInfo = allDrivers.find(d => 
        d.email === currentDriver.email || 
        d.name === currentDriver.username ||
        d.name === currentDriver.fullname ||
        d.email === currentDriver.username
    );
    
    console.log('[Driver Routes] Driver info:', driverInfo);
    
    // Filter routes for current driver - today's active routes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // First try to find routes assigned to this driver
    myRoutes = allRoutes.filter(route => {
        const routeDate = route.routeDate ? route.routeDate.split('T')[0] : '';
        const isToday = routeDate === todayStr;
        const isAssigned = route.driverId === currentDriver.id || 
                          route.driverId === (driverInfo?.id);
        const isActive = ['planning', 'active'].includes(route.status);
        
        return isToday && isActive;
    });
    
    console.log('[Driver Routes] My routes for today:', myRoutes.length);
    
    // If no routes assigned, try to get orders directly
    if (myRoutes.length === 0) {
        myOrders = allOrders.filter(order => {
            const driverMatch = 
                order.driver === currentDriver.username || 
                order.driver === currentDriver.fullname ||
                order.driverEmail === currentDriver.email ||
                order.assignedDriver === currentDriver.username ||
                order.assignedDriver === currentDriver.fullname ||
                order.assignedDriverEmail === currentDriver.email ||
                order.driverId === currentDriver.id ||
                (driverInfo && (
                    order.driver === driverInfo.name ||
                    order.driverEmail === driverInfo.email ||
                    order.assignedDriver === driverInfo.name ||
                    order.driverId === driverInfo.id
                ));
            
            // Only get orders that need action today (assigned, picking, delivering)
            const needsAction = ['assigned', 'picking', 'delivering'].includes(order.status);
            
            // Check if order is for today
            const orderDate = new Date(order.createdAt || order.createdDate);
            const isToday = orderDate >= today;
            
            return driverMatch && needsAction && isToday;
        });
        
        console.log('[Driver Routes] Building route from orders:', myOrders.length);
        buildRouteFromOrders();
    } else {
        console.log('[Driver Routes] Using route data');
        buildRouteFromRouteData();
    }
}

// ==================== ROUTE BUILDING ====================
function buildRouteFromRouteData() {
    if (myRoutes.length === 0) {
        routeStops = [];
        renderRouteStats();
        renderRouteStops();
        return;
    }
    
    // Use the first active route for today
    const activeRoute = myRoutes[0];
    console.log('[Driver Routes] Using route:', activeRoute.routeName);
    
    // Build stops from route navigation data
    if (activeRoute.navigation && activeRoute.navigation.length > 0) {
        routeStops = activeRoute.navigation.map((nav, index) => {
            // Find the corresponding order
            const order = allOrders.find(o => o.id === nav.orderId);
            
            return {
                id: nav.orderId,
                stopNumber: nav.step,
                address: nav.address,
                contactName: nav.contact ? nav.contact.split(' - ')[0] : 'N/A',
                contactPhone: nav.contact ? nav.contact.split(' - ')[1] : 'N/A',
                codAmount: nav.cod || 0,
                notes: order?.notes || '',
                status: order?.status || 'assigned',
                actionType: nav.action, // 'pickup' or 'delivery'
                order: order,
                routeName: activeRoute.routeName,
                routeArea: activeRoute.area,
                // Mock coordinates - in real app, use geocoding API
                lat: 21.0285 + (Math.random() - 0.5) * 0.1,
                lng: 105.8542 + (Math.random() - 0.5) * 0.1
            };
        });
    } else if (activeRoute.orderDetails && activeRoute.orderDetails.length > 0) {
        // Build from orderDetails if navigation not available
        routeStops = [];
        activeRoute.orderDetails.forEach((detail, index) => {
            // Pickup stop
            routeStops.push({
                id: detail.orderId,
                stopNumber: routeStops.length + 1,
                address: detail.pickupAddress,
                contactName: detail.senderName,
                contactPhone: detail.senderPhone,
                codAmount: 0,
                notes: detail.notes,
                status: 'assigned',
                actionType: 'pickup',
                order: allOrders.find(o => o.id === detail.orderId),
                routeName: activeRoute.routeName,
                routeArea: activeRoute.area,
                lat: 21.0285 + (Math.random() - 0.5) * 0.1,
                lng: 105.8542 + (Math.random() - 0.5) * 0.1
            });
            
            // Delivery stop
            routeStops.push({
                id: detail.orderId,
                stopNumber: routeStops.length + 1,
                address: detail.deliveryAddress,
                contactName: detail.receiverName,
                contactPhone: detail.receiverPhone,
                codAmount: detail.codAmount,
                notes: detail.notes,
                status: 'delivering',
                actionType: 'delivery',
                order: allOrders.find(o => o.id === detail.orderId),
                routeName: activeRoute.routeName,
                routeArea: activeRoute.area,
                lat: 21.0285 + (Math.random() - 0.5) * 0.1,
                lng: 105.8542 + (Math.random() - 0.5) * 0.1
            });
        });
    } else {
        // Fallback: build from order IDs in route
        const orderIds = activeRoute.orders || [];
        routeStops = [];
        
        orderIds.forEach((orderId, index) => {
            const order = allOrders.find(o => o.id === orderId);
            if (!order) return;
            
            // Pickup stop
            routeStops.push({
                id: order.id,
                stopNumber: routeStops.length + 1,
                address: order.pickupAddress || order.senderAddress,
                contactName: order.senderName || order.customerName,
                contactPhone: order.senderPhone || order.customerPhone,
                codAmount: 0,
                notes: order.notes || '',
                status: order.status,
                actionType: 'pickup',
                order: order,
                routeName: activeRoute.routeName,
                routeArea: activeRoute.area,
                lat: 21.0285 + (Math.random() - 0.5) * 0.1,
                lng: 105.8542 + (Math.random() - 0.5) * 0.1
            });
            
            // Delivery stop
            routeStops.push({
                id: order.id,
                stopNumber: routeStops.length + 1,
                address: order.deliveryAddress || order.receiverAddress,
                contactName: order.receiverName || order.customerName,
                contactPhone: order.receiverPhone || order.customerPhone,
                codAmount: order.codAmount || 0,
                notes: order.notes || '',
                status: order.status,
                actionType: 'delivery',
                order: order,
                routeName: activeRoute.routeName,
                routeArea: activeRoute.area,
                lat: 21.0285 + (Math.random() - 0.5) * 0.1,
                lng: 105.8542 + (Math.random() - 0.5) * 0.1
            });
        });
    }
    
    console.log('[Driver Routes] Built', routeStops.length, 'stops from route data');
    
    renderRouteStats();
    renderRouteStops();
    renderMapMarkers();
}

function buildRouteFromOrders() {
    // Convert orders to route stops
    routeStops = myOrders.map((order, index) => {
        // Determine current address based on order status
        let address, contactName, contactPhone, actionType;
        
        if (order.status === 'assigned' || order.status === 'picking') {
            // Need to pickup
            address = order.pickupAddress || order.senderAddress || 'N/A';
            contactName = order.senderName || order.customerName || 'N/A';
            contactPhone = order.senderPhone || order.customerPhone || 'N/A';
            actionType = 'pickup';
        } else {
            // Need to deliver
            address = order.deliveryAddress || order.receiverAddress || 'N/A';
            contactName = order.receiverName || order.customerName || 'N/A';
            contactPhone = order.receiverPhone || order.customerPhone || 'N/A';
            actionType = 'delivery';
        }
        
        return {
            id: order.id || order.trackingNumber,
            stopNumber: index + 1,
            address: address,
            contactName: contactName,
            contactPhone: contactPhone,
            codAmount: order.codAmount || 0,
            notes: order.notes || '',
            status: order.status,
            actionType: actionType,
            order: order,
            // Mock coordinates - in real app, use geocoding API
            lat: 21.0285 + (Math.random() - 0.5) * 0.15,
            lng: 105.8542 + (Math.random() - 0.5) * 0.15
        };
    });
    
    // Sort by priority: delivering > picking > assigned
    const statusPriority = { 'delivering': 1, 'picking': 2, 'assigned': 3 };
    routeStops.sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same status, sort by COD amount (highest first)
        return (b.codAmount || 0) - (a.codAmount || 0);
    });
    
    // Update stop numbers after sorting
    routeStops.forEach((stop, index) => {
        stop.stopNumber = index + 1;
    });
    
    renderRouteStats();
    renderRouteStops();
    renderMapMarkers();
}

// ==================== ROUTE STATISTICS ====================
function renderRouteStats() {
    const total = routeStops.length;
    const completed = routeStops.filter(s => s.status === 'delivered').length;
    const inProgress = routeStops.filter(s => s.status === 'delivering').length;
    const remaining = total - completed;
    
    // Calculate progress
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate total COD
    const totalCOD = routeStops.reduce((sum, stop) => sum + (parseFloat(stop.codAmount) || 0), 0);
    
    // Estimate time (15 minutes per stop)
    const estimatedMinutes = remaining * 15;
    const estimatedHours = Math.floor(estimatedMinutes / 60);
    const estimatedMins = estimatedMinutes % 60;
    const estimatedTimeText = estimatedHours > 0 
        ? `~ ${estimatedHours}h ${estimatedMins}m` 
        : `~ ${estimatedMins} phút`;
    
    document.getElementById('total-stops').textContent = total;
    document.getElementById('completed-stops').textContent = completed;
    document.getElementById('remaining-stops').textContent = remaining;
    document.getElementById('total-cod').textContent = formatCurrency(totalCOD);
    document.getElementById('progress-text').textContent = `${progress}% hoàn thành`;
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('estimated-time').textContent = estimatedTimeText;
    
    // Find current stop
    const currentStop = routeStops.find(s => s.status === 'delivering' || s.status === 'picking');
    if (currentStop) {
        document.getElementById('current-stop').textContent = '#' + currentStop.stopNumber;
        document.getElementById('current-stop-address').textContent = truncateText(currentStop.address, 30);
    } else if (total > 0) {
        document.getElementById('current-stop').textContent = 'Chưa bắt đầu';
        document.getElementById('current-stop-address').textContent = 'Click "Bắt đầu tuyến đường"';
    } else {
        document.getElementById('current-stop').textContent = '-';
        document.getElementById('current-stop-address').textContent = 'Không có điểm nào';
    }
}

// ==================== ROUTE STOPS RENDERING ====================
function renderRouteStops() {
    const container = document.getElementById('route-stops');
    
    if (routeStops.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-route" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 10px;">Không có tuyến đường nào cho hôm nay</p>
                <small>Bạn có thể kiểm tra lại <a href="driver-orders.html" style="color: #3498db;">danh sách đơn hàng</a></small>
            </div>
        `;
        return;
    }
    
    // Get route info from first stop
    const routeInfo = routeStops[0];
    const routeHeader = routeInfo.routeName || routeInfo.routeArea ? `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0 0 10px 0; font-size: 1.8rem; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-route"></i>
                        ${routeInfo.routeName || 'Tuyến giao hàng'}
                    </h2>
                    ${routeInfo.routeArea ? `
                        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 8px; font-size: 1rem;">
                            <i class="fas fa-map-marked-alt"></i> Khu vực: <strong>${routeInfo.routeArea}</strong>
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 5px;">${routeStops.length}</div>
                    <div style="opacity: 0.9; font-size: 1rem;">điểm dừng</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); display: flex; gap: 30px; flex-wrap: wrap; font-size: 0.95rem;">
                <div>
                    <i class="fas fa-clock"></i> 
                    <strong>Bắt đầu:</strong> ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                    <i class="fas fa-hourglass-half"></i> 
                    <strong>Dự kiến hoàn thành:</strong> <span id="route-eta">Đang tính...</span>
                </div>
                <div>
                    <i class="fas fa-road"></i> 
                    <strong>Khoảng cách:</strong> <span id="route-distance">~ ${Math.round(routeStops.length * 3.5)} km</span>
                </div>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = routeHeader + routeStops.map(stop => {
        const statusClass = stop.status === 'delivered' ? 'completed' : 
                           (stop.status === 'delivering' || stop.status === 'picking') ? 'current' : 'pending';
        
        const statusIcon = stop.status === 'delivered' ? 'fa-check-circle' : 
                          stop.status === 'delivering' ? 'fa-shipping-fast' :
                          stop.status === 'picking' ? 'fa-box-open' : 'fa-clock';
        
        const statusText = stop.status === 'delivered' ? 'Đã giao' : 
                          stop.status === 'delivering' ? 'Đang giao hàng' : 
                          stop.status === 'picking' ? 'Đang lấy hàng' : 'Mới nhận';
        
        const statusColor = stop.status === 'delivered' ? 'badge-success' : 
                           (stop.status === 'delivering' || stop.status === 'picking') ? 'badge-warning' : 'badge-secondary';
        
        const actionLabel = stop.actionType === 'pickup' ? 
            '<i class="fas fa-box-open" style="color: #3498db;"></i> Lấy hàng' : 
            '<i class="fas fa-shipping-fast" style="color: #27ae60;"></i> Giao hàng';
        
        return `
            <div class="route-stop ${statusClass}" onclick="showStopDetail('${stop.id}')">
                <div style="display: flex; gap: 20px; align-items: start;">
                    <div class="stop-number">${stop.stopNumber}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                    <strong style="font-size: 1.2rem; color: #2c3e50;">${stop.contactName}</strong>
                                    <span class="badge ${statusColor}">
                                        <i class="fas ${statusIcon}"></i> ${statusText}
                                    </span>
                                </div>
                                <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">
                                    ${actionLabel}
                                </div>
                            </div>
                            ${stop.codAmount > 0 ? `
                                <div style="text-align: right; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);">
                                    <div style="font-weight: 700; font-size: 1.3rem;">
                                        ${formatCurrency(stop.codAmount)}
                                    </div>
                                    <small style="opacity: 0.9;">COD</small>
                                </div>
                            ` : ''}
                        </div>
                        <div style="color: #555; margin-bottom: 8px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #3498db;">
                            <i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i> ${stop.address}
                        </div>
                        <div style="color: #7f8c8d; margin-bottom: 12px;">
                            <i class="fas fa-phone"></i> ${stop.contactPhone}
                        </div>
                        ${stop.notes ? `
                            <div style="margin-bottom: 12px; padding: 10px; background: #fff3cd; border-radius: 6px; font-size: 0.9rem; border-left: 3px solid #ffc107;">
                                <i class="fas fa-sticky-note" style="color: #f39c12;"></i> <strong>Ghi chú:</strong> ${stop.notes}
                            </div>
                        ` : ''}
                        <div class="action-buttons" onclick="event.stopPropagation()">
                            ${getStopActions(stop)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStopActions(stop) {
    const orderId = stop.id;
    let actions = [];
    
    // Navigation button (always available)
    actions.push(`
        <button class="btn btn-info btn-sm" onclick="openNavigation(${stop.lat}, ${stop.lng}, '${encodeURIComponent(stop.address)}')" title="Chỉ đường đến địa chỉ">
            <i class="fas fa-directions"></i> Chỉ đường
        </button>
    `);
    
    // Call button
    actions.push(`
        <a href="tel:${stop.contactPhone}" class="btn btn-primary btn-sm" title="Gọi điện thoại">
            <i class="fas fa-phone"></i> Gọi
        </a>
    `);
    
    // Status update buttons based on current status and action type
    switch (stop.status) {
        case 'assigned':
            // Start picking up
            actions.push(`
                <button class="btn btn-warning btn-sm" onclick="updateStopStatus('${orderId}', 'picking')" title="Bắt đầu đi lấy hàng">
                    <i class="fas fa-motorcycle"></i> Đi lấy hàng
                </button>
            `);
            break;
        case 'picking':
            // Confirm picked up, start delivering
            actions.push(`
                <button class="btn btn-success btn-sm" onclick="confirmPickup('${orderId}')" title="Xác nhận đã lấy hàng">
                    <i class="fas fa-box"></i> Đã lấy hàng
                </button>
                <button class="btn btn-danger btn-sm" onclick="failPickup('${orderId}')" title="Không lấy được hàng">
                    <i class="fas fa-times"></i> Không lấy được
                </button>
            `);
            break;
        case 'delivering':
            // Complete delivery or fail
            actions.push(`
                <button class="btn btn-success btn-sm" onclick="confirmDelivery('${orderId}')" title="Giao hàng thành công">
                    <i class="fas fa-check-circle"></i> Hoàn thành
                </button>
                <button class="btn btn-danger btn-sm" onclick="failDelivery('${orderId}')" title="Giao hàng thất bại">
                    <i class="fas fa-times-circle"></i> Thất bại
                </button>
            `);
            break;
    }
    
    return actions.join('');
}

// ==================== MAP MARKERS ====================
function renderMapMarkers() {
    // Clear existing markers and polyline
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    
    if (routeStops.length === 0) return;
    
    // Add markers for each stop
    routeStops.forEach((stop, index) => {
        const color = stop.status === 'delivered' ? '#27ae60' : 
                     (stop.status === 'delivering' || stop.status === 'picking') ? '#f39c12' : '#3498db';
        
        // Create circle marker
        const marker = L.circleMarker([stop.lat, stop.lng], {
            radius: 12,
            fillColor: color,
            color: 'white',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);
        
        // Add popup
        const actionText = stop.actionType === 'pickup' ? 'Lấy hàng' : 'Giao hàng';
        marker.bindPopup(`
            <div style="min-width: 200px;">
                <strong style="font-size: 1.1rem; color: #2c3e50;">Điểm ${stop.stopNumber}: ${stop.contactName}</strong><br>
                <div style="margin: 8px 0; padding: 5px; background: #f8f9fa; border-radius: 4px;">
                    <small style="color: #7f8c8d;">${actionText}</small><br>
                    <span style="font-size: 0.9rem;">${stop.address}</span>
                </div>
                <div style="margin: 5px 0;">
                    <i class="fas fa-phone"></i> <a href="tel:${stop.contactPhone}" style="color: #3498db;">${stop.contactPhone}</a>
                </div>
                ${stop.codAmount > 0 ? `
                    <div style="margin-top: 8px; padding: 5px; background: #ffe6e6; border-radius: 4px;">
                        <strong style="color: #e74c3c;">COD: ${formatCurrency(stop.codAmount)}</strong>
                    </div>
                ` : ''}
                <button onclick="showStopDetail('${stop.id}')" class="btn btn-primary btn-sm" style="margin-top: 10px; width: 100%;">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
            </div>
        `, { maxWidth: 300 });
        
        // Add number label
        const icon = L.divIcon({
            className: 'marker-number',
            html: `<div style="
                width: 30px; 
                height: 30px; 
                background: ${color}; 
                color: white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold;
                font-size: 0.9rem;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${stop.stopNumber}</div>`,
            iconSize: [30, 30]
        });
        
        const numberMarker = L.marker([stop.lat, stop.lng], { icon: icon }).addTo(map);
        
        markers.push(marker, numberMarker);
    });
    
    // Draw route line
    if (routeStops.length > 1) {
        const coordinates = routeStops.map(stop => [stop.lat, stop.lng]);
        routePolyline = L.polyline(coordinates, {
            color: '#3498db',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10',
            lineJoin: 'round'
        }).addTo(map);
    }
    
    // Fit map to show all markers
    const bounds = L.latLngBounds(routeStops.map(stop => [stop.lat, stop.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
}

function refreshMap() {
    showNotification('Đang làm mới bản đồ...', 'info');
    renderMapMarkers();
    setTimeout(() => {
        showNotification('Đã làm mới bản đồ', 'success');
    }, 500);
}

// ==================== STOP DETAIL MODAL ====================
function showStopDetail(stopId) {
    const stop = routeStops.find(s => s.id === stopId);
    if (!stop) {
        showNotification('Không tìm thấy điểm dừng!', 'error');
        return;
    }
    
    document.getElementById('modal-stop-number').textContent = 'Điểm ' + stop.stopNumber;
    document.getElementById('modal-stop-address').textContent = stop.address;
    
    const order = stop.order;
    const actionText = stop.actionType === 'pickup' ? 'Lấy hàng' : 'Giao hàng';
    const actionIcon = stop.actionType === 'pickup' ? 'fa-box-open' : 'fa-shipping-fast';
    const actionColor = stop.actionType === 'pickup' ? '#3498db' : '#27ae60';
    
    const content = `
        <div style="background: linear-gradient(135deg, ${actionColor}, ${actionColor}dd); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${actionIcon}" style="font-size: 2rem;"></i>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 1.5rem;">${actionText}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Điểm ${stop.stopNumber} - ${stop.contactName}</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Mã đơn hàng</div>
                    <div style="font-weight: 700; font-size: 1.1rem;">${order.id || order.trackingNumber}</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Trạng thái</div>
                    <div style="font-weight: 600;">${getStatusText(stop.status)}</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-circle"></i> Thông tin liên hệ
                </h4>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Tên người liên hệ</div>
                    <div style="font-weight: 600; font-size: 1.1rem; color: #2c3e50;">${stop.contactName}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Số điện thoại</div>
                    <div style="font-weight: 500;">
                        <a href="tel:${stop.contactPhone}" class="btn btn-primary btn-sm" style="text-decoration: none;">
                            <i class="fas fa-phone"></i> ${stop.contactPhone}
                        </a>
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Địa chỉ</div>
                    <div style="font-weight: 500; line-height: 1.6; color: #2c3e50; background: white; padding: 10px; border-radius: 6px;">
                        <i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i> ${stop.address}
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #e74c3c;">
                <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-money-bill-wave"></i> Thông tin thanh toán
                </h4>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Số tiền COD</div>
                    <div style="font-weight: 700; font-size: 1.5rem; color: #e74c3c;">
                        ${formatCurrency(stop.codAmount)}
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Phí vận chuyển</div>
                    <div style="font-weight: 600; font-size: 1.1rem; color: #2c3e50;">
                        ${formatCurrency(order.shippingFee || 0)}
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Trạng thái COD</div>
                    <div style="font-weight: 600;">
                        ${order.codCollected ? 
                            '<span style="color: #27ae60;"><i class="fas fa-check-circle"></i> Đã thu</span>' : 
                            stop.codAmount > 0 ? '<span style="color: #f39c12;"><i class="fas fa-clock"></i> Chưa thu</span>' : 
                            '<span style="color: #95a5a6;"><i class="fas fa-minus"></i> Không có COD</span>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        ${stop.notes ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <div style="color: #856404; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-sticky-note"></i> Ghi chú quan trọng
            </div>
            <div style="color: #856404; line-height: 1.6; font-size: 1rem;">
                ${stop.notes}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #ecf0f1; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
            <button class="btn btn-info" onclick="openNavigation(${stop.lat}, ${stop.lng}, '${encodeURIComponent(stop.address)}')">
                <i class="fas fa-directions"></i> Chỉ đường
            </button>
            <a href="tel:${stop.contactPhone}" class="btn btn-primary">
                <i class="fas fa-phone"></i> Gọi ${stop.actionType === 'pickup' ? 'người gửi' : 'người nhận'}
            </a>
            ${getStopDetailActions(stop)}
            <button class="btn btn-secondary" onclick="closeStopDetailModal()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;
    
    document.getElementById('stop-detail-content').innerHTML = content;
    document.getElementById('stopDetailModal').style.display = 'flex';
    
    // Highlight marker on map
    map.setView([stop.lat, stop.lng], 16);
}

function getStopDetailActions(stop) {
    const orderId = stop.id;
    let actions = '';
    
    switch (stop.status) {
        case 'assigned':
            actions = `
                <button class="btn btn-warning" onclick="updateStopStatus('${orderId}', 'picking'); closeStopDetailModal();">
                    <i class="fas fa-motorcycle"></i> Bắt đầu lấy hàng
                </button>
            `;
            break;
        case 'picking':
            actions = `
                <button class="btn btn-success" onclick="confirmPickup('${orderId}'); closeStopDetailModal();">
                    <i class="fas fa-box"></i> Đã lấy hàng
                </button>
            `;
            break;
        case 'delivering':
            actions = `
                <button class="btn btn-success" onclick="confirmDelivery('${orderId}');">
                    <i class="fas fa-check-circle"></i> Giao thành công
                </button>
            `;
            break;
    }
    
    return actions;
}

function closeStopDetailModal() {
    document.getElementById('stopDetailModal').style.display = 'none';
}

// ==================== NAVIGATION ====================
function openNavigation(lat, lng, address) {
    // Check if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try to open in Google Maps app
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(googleMapsUrl, '_blank');
    } else {
        // Open in browser
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(url, '_blank');
    }
}

// ==================== STATUS UPDATE ====================
function getStatusText(status) {
    const texts = {
        'assigned': 'Mới nhận',
        'picking': 'Đang lấy hàng',
        'delivering': 'Đang giao hàng',
        'delivered': 'Đã giao',
        'failed': 'Thất bại'
    };
    return texts[status] || status;
}

function updateStopStatus(orderId, newStatus) {
    const stop = routeStops.find(s => s.id === orderId);
    if (!stop) {
        showNotification('Không tìm thấy điểm dừng!', 'error');
        return;
    }
    
    const messages = {
        'picking': 'Bắt đầu đi lấy hàng cho đơn ' + orderId + '?',
        'delivering': 'Bắt đầu giao đơn hàng ' + orderId + '?'
    };
    
    if (messages[newStatus] && !confirm(messages[newStatus])) return;
    
    const order = stop.order;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: newStatus,
        time: new Date().toISOString(),
        description: `Tài xế cập nhật: ${getStatusText(newStatus)}`
    });
    
    saveOrderChanges(order, `Đã cập nhật trạng thái: ${getStatusText(newStatus)}`);
}

function confirmPickup(orderId) {
    const stop = routeStops.find(s => s.id === orderId);
    if (!stop) return;
    
    if (!confirm(`Xác nhận bạn đã lấy hàng thành công cho đơn ${orderId}?`)) return;
    
    const order = stop.order;
    order.status = 'delivering';
    order.pickedUpAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'delivering',
        time: new Date().toISOString(),
        description: 'Đã lấy hàng thành công, bắt đầu giao cho người nhận'
    });
    
    saveOrderChanges(order, 'Đã lấy hàng thành công');
}

function confirmDelivery(orderId) {
    const stop = routeStops.find(s => s.id === orderId);
    if (!stop) return;
    
    const receiverName = prompt('Nhập tên người nhận hàng để xác nhận:', stop.order.receiverName || stop.order.customerName || '');
    if (!receiverName) return;
    
    const order = stop.order;
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    order.receivedBy = receiverName;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'delivered',
        time: new Date().toISOString(),
        description: `Giao hàng thành công. Người nhận: ${receiverName}`
    });
    
    saveOrderChanges(order, `Giao hàng thành công cho đơn ${orderId}`);
    closeStopDetailModal();
    
    // Check COD
    if (order.codAmount && parseFloat(order.codAmount) > 0) {
        setTimeout(() => {
            if (confirm(`Đơn hàng có COD ${formatCurrency(order.codAmount)}. Bạn đã thu tiền COD chưa?`)) {
                order.codCollected = true;
                order.codCollectedDate = new Date().toISOString();
                saveOrderChanges(order, `Đã xác nhận thu COD ${formatCurrency(order.codAmount)}`);
            }
        }, 500);
    }
}

function failPickup(orderId) {
    const stop = routeStops.find(s => s.id === orderId);
    if (!stop) return;
    
    const reason = prompt('Lý do không lấy được hàng:', 'Người gửi không có mặt');
    if (!reason) return;
    
    const order = stop.order;
    order.status = 'failed';
    order.failedAt = new Date().toISOString();
    order.failureNote = 'Lấy hàng thất bại: ' + reason;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: order.failureNote
    });
    
    saveOrderChanges(order, 'Không lấy được hàng');
}

function failDelivery(orderId) {
    const stop = routeStops.find(s => s.id === orderId);
    if (!stop) return;
    
    const reason = prompt('Lý do giao hàng thất bại:', 'Người nhận không có mặt');
    if (!reason) return;
    
    const order = stop.order;
    order.status = 'failed';
    order.failedAt = new Date().toISOString();
    order.failureNote = 'Giao hàng thất bại: ' + reason;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: order.failureNote
    });
    
    saveOrderChanges(order, 'Giao hàng thất bại');
}

function saveOrderChanges(order, message) {
    const orderIndex = allOrders.findIndex(o => (o.id || o.trackingNumber) === (order.id || order.trackingNumber));
    if (orderIndex !== -1) {
        allOrders[orderIndex] = order;
        
        if (typeof DataSync !== 'undefined') {
            DataSync.set('orders', allOrders);
            DataSync.triggerSync('orders');
        } else {
            localStorage.setItem('orders', JSON.stringify(allOrders));
        }
        
        showNotification(message, 'success');
        
        // Reload to refresh route
        setTimeout(() => {
            loadAllData();
        }, 500);
    }
}

// ==================== ROUTE MANAGEMENT ====================
function startRoute() {
    if (routeStops.length === 0) {
        showNotification('Không có điểm dừng nào để bắt đầu', 'warning');
        return;
    }
    
    // Find first pending stop
    const firstStop = routeStops.find(s => s.status === 'assigned');
    if (!firstStop) {
        showNotification('Tất cả các điểm đã được bắt đầu', 'info');
        return;
    }
    
    if (confirm(`Bắt đầu tuyến đường từ điểm ${firstStop.stopNumber}?`)) {
        updateStopStatus(firstStop.id, 'picking');
        
        // Scroll to first stop
        setTimeout(() => {
            document.querySelector('.route-stop.current')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 500);
    }
}

function optimizeRoute() {
    if (routeStops.length < 2) {
        showNotification('Cần ít nhất 2 điểm để tối ưu', 'warning');
        return;
    }
    
    showNotification('Đang tối ưu tuyến đường...', 'info');
    
    // Simple optimization: prioritize by status and COD amount
    // In real app, use routing API like Google Directions API
    setTimeout(() => {
        buildRouteFromOrders();
        showNotification('Đã tối ưu tuyến đường thành công!', 'success');
        
        // Scroll to top of route list
        document.getElementById('route-stops-section')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }, 1000);
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function truncateText(text, maxLength) {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function showNotification(message, type) {
    type = type || 'info';
    const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:15px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:500;display:flex;align-items:center;gap:10px;max-width:400px;animation:slideIn 0.3s ease-out;';
    notification.innerHTML = '<i class="fas fa-' + icons[type] + '"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(function() { notification.remove(); }, 300);
    }, 3000);
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        window.location.replace('login.html');
    }
}

// ==================== AUTO REFRESH & SYNC ====================
setInterval(function() {
    console.log('[Driver Routes] Auto-refreshing data...');
    const currentScroll = window.scrollY;
    loadAllData();
    window.scrollTo(0, currentScroll);
}, 60000); // Refresh every minute

if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Driver Routes] DataSync event received:', event.detail.key);
        if (event.detail.key === 'orders') {
            loadAllData();
        }
    });
}

window.addEventListener('storage', function(event) {
    if (event.key === 'orders') {
        console.log('[Driver Routes] Storage event detected');
        loadAllData();
    }
});

console.log('[Driver Routes] Script loaded successfully');
