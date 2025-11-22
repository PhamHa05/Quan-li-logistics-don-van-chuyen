// Check admin access
checkAdminAccess();

// Routes data
let routes = JSON.parse(localStorage.getItem('routes')) || [];
let filteredRoutes = [];
let selectedOrdersForRoute = [];
let map = null;
let currentView = 'list';

// Initialize sample data
function initializeSampleRoutes() {
    const existingRoutes = localStorage.getItem('routes');
    if (!existingRoutes || JSON.parse(existingRoutes).length === 0) {
        console.log('Initializing sample routes data...');
        
        // Tạo dữ liệu mẫu cho tuyến đường
        const sampleRoutes = [
            {
                id: 'ROUTE' + Date.now(),
                routeName: 'Tuyến Quận 1 - Sáng',
                driverId: drivers.length > 0 ? drivers[0].id : '',
                routeDate: new Date().toISOString(),
                startTime: '08:00',
                orders: orders.filter(o => o.status === 'assigned').slice(0, 5).map(o => o.id),
                notes: 'Tuyến đường ưu tiên giao hàng trong khu vực trung tâm',
                status: 'active',
                estimatedDistance: 35,
                estimatedTime: 130,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                startedAt: new Date(Date.now() - 1800000).toISOString(),
                timeline: [
                    {
                        status: 'planning',
                        time: new Date(Date.now() - 3600000).toISOString(),
                        description: 'Tuyến đường đã được tạo'
                    },
                    {
                        status: 'active',
                        time: new Date(Date.now() - 1800000).toISOString(),
                        description: 'Tuyến đường bắt đầu thực hiện'
                    }
                ]
            },
            {
                id: 'ROUTE' + (Date.now() - 1000),
                routeName: 'Tuyến Quận 3 - Chiều',
                driverId: drivers.length > 1 ? drivers[1].id : (drivers.length > 0 ? drivers[0].id : ''),
                routeDate: new Date().toISOString(),
                startTime: '14:00',
                orders: orders.filter(o => o.status === 'pending').slice(0, 4).map(o => o.id),
                notes: 'Khu vực có nhiều tòa nhà cao tầng, cần liên hệ trước',
                status: 'planning',
                estimatedDistance: 28,
                estimatedTime: 110,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                timeline: [
                    {
                        status: 'planning',
                        time: new Date(Date.now() - 7200000).toISOString(),
                        description: 'Tuyến đường đã được tạo'
                    }
                ]
            },
            {
                id: 'ROUTE' + (Date.now() - 2000),
                routeName: 'Tuyến Bình Thạnh - Sáng',
                driverId: drivers.length > 2 ? drivers[2].id : (drivers.length > 0 ? drivers[0].id : ''),
                routeDate: new Date(Date.now() - 86400000).toISOString(),
                startTime: '09:00',
                orders: orders.filter(o => o.status === 'delivered').slice(0, 6).map(o => o.id),
                notes: 'Tuyến đã hoàn thành xuất sắc',
                status: 'completed',
                estimatedDistance: 42,
                estimatedTime: 150,
                actualDistance: 40,
                actualTime: 145,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                startedAt: new Date(Date.now() - 90000000).toISOString(),
                completedAt: new Date(Date.now() - 86400000).toISOString(),
                timeline: [
                    {
                        status: 'planning',
                        time: new Date(Date.now() - 172800000).toISOString(),
                        description: 'Tuyến đường đã được tạo'
                    },
                    {
                        status: 'active',
                        time: new Date(Date.now() - 90000000).toISOString(),
                        description: 'Tuyến đường bắt đầu thực hiện'
                    },
                    {
                        status: 'completed',
                        time: new Date(Date.now() - 86400000).toISOString(),
                        description: 'Tuyến đường đã hoàn thành'
                    }
                ]
            },
            {
                id: 'ROUTE' + (Date.now() - 3000),
                routeName: 'Tuyến Tân Bình - Trưa',
                driverId: drivers.length > 0 ? drivers[0].id : '',
                routeDate: new Date(Date.now() - 86400000).toISOString(),
                startTime: '12:00',
                orders: orders.filter(o => o.status === 'delivered').slice(0, 3).map(o => o.id),
                notes: 'Tuyến ngắn, giao nhanh trong giờ trưa',
                status: 'completed',
                estimatedDistance: 18,
                estimatedTime: 80,
                actualDistance: 17,
                actualTime: 75,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                startedAt: new Date(Date.now() - 100000000).toISOString(),
                completedAt: new Date(Date.now() - 95400000).toISOString(),
                timeline: [
                    {
                        status: 'planning',
                        time: new Date(Date.now() - 259200000).toISOString(),
                        description: 'Tuyến đường đã được tạo'
                    },
                    {
                        status: 'active',
                        time: new Date(Date.now() - 100000000).toISOString(),
                        description: 'Tuyến đường bắt đầu thực hiện'
                    },
                    {
                        status: 'completed',
                        time: new Date(Date.now() - 95400000).toISOString(),
                        description: 'Tuyến đường đã hoàn thành'
                    }
                ]
            },
            {
                id: 'ROUTE' + (Date.now() - 4000),
                routeName: 'Tuyến Quận 7 - Chiều',
                driverId: drivers.length > 1 ? drivers[1].id : (drivers.length > 0 ? drivers[0].id : ''),
                routeDate: new Date().toISOString(),
                startTime: '15:30',
                orders: [],
                notes: 'Tuyến dự phòng, chờ bổ sung đơn hàng',
                status: 'planning',
                estimatedDistance: 25,
                estimatedTime: 100,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                timeline: [
                    {
                        status: 'planning',
                        time: new Date(Date.now() - 3600000).toISOString(),
                        description: 'Tuyến đường đã được tạo'
                    }
                ]
            }
        ];
        
        // Cập nhật routeId cho các đơn hàng trong tuyến
        sampleRoutes.forEach(route => {
            if (route.orders && route.orders.length > 0) {
                route.orders.forEach(orderId => {
                    const order = orders.find(o => o.id === orderId);
                    if (order) {
                        order.routeId = route.id;
                    }
                });
            }
        });
        
        localStorage.setItem('routes', JSON.stringify(sampleRoutes));
        routes.length = 0;
        routes.push(...sampleRoutes);
        
        // Lưu lại orders đã cập nhật
        localStorage.setItem('orders', JSON.stringify(orders));
        
        console.log(`Created ${sampleRoutes.length} sample routes`);
        return true;
    }
    return false;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu mẫu nếu chưa có
    const initialized = initializeSampleRoutes();
    
    loadRoutes();
    loadDriversFilter();
    updateStatsCards();
    
    // KHÔNG set default date để hiển thị tất cả routes
    // const today = new Date().toISOString().split('T')[0];
    // const dateFilter = document.getElementById('dateFilter');
    // if (dateFilter) dateFilter.value = today;
    
    initMap();
    
    if (initialized) {
        console.log('Sample routes initialized successfully');
    }
});

// Load routes
function loadRoutes() {
    const savedRoutes = localStorage.getItem('routes');
    if (savedRoutes) {
        try {
            const parsedRoutes = JSON.parse(savedRoutes);
            if (parsedRoutes && parsedRoutes.length > 0) {
                routes.length = 0;
                routes.push(...parsedRoutes);
            }
        } catch (e) {
            console.error('Error loading routes:', e);
        }
    }
    
    filteredRoutes = [...routes];
    filterRoutes();
}

// Load drivers filter
function loadDriversFilter() {
    const driverFilter = document.getElementById('driverFilter');
    const routeDriverSelect = document.getElementById('routeDriverSelect');
    
    if (!driverFilter || !routeDriverSelect) return;
    
    drivers.forEach(driver => {
        if (driver.status === 'active') {
            const option1 = document.createElement('option');
            option1.value = driver.id;
            option1.textContent = driver.name;
            driverFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = driver.id;
            option2.textContent = `${driver.name} - ${driver.vehicle}`;
            routeDriverSelect.appendChild(option2);
        }
    });
}

// Update stats cards
function updateStatsCards() {
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const completedRoutes = routes.filter(r => r.status === 'completed').length;
    
    const unassignedOrders = orders.filter(o => 
        !o.routeId && ['pending', 'assigned'].includes(o.status)
    ).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRoutes = routes.filter(r => r.routeDate && r.routeDate.startsWith(today));
    const todayDist = todayRoutes.reduce((sum, r) => sum + (r.estimatedDistance || 0), 0);
    
    const elem1 = document.getElementById('activeRoutesCount');
    const elem2 = document.getElementById('completedRoutesCount');
    const elem3 = document.getElementById('unassignedOrdersCount');
    const elem4 = document.getElementById('todayDistance');
    
    if (elem1) elem1.textContent = activeRoutes;
    if (elem2) elem2.textContent = completedRoutes;
    if (elem3) elem3.textContent = unassignedOrders;
    if (elem4) elem4.textContent = todayDist.toFixed(1);
}

// Filter routes
function filterRoutes() {
    const statusFilter = document.getElementById('statusFilter');
    const driverFilter = document.getElementById('driverFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    const statusValue = statusFilter ? statusFilter.value : '';
    const driverValue = driverFilter ? driverFilter.value : '';
    const dateValue = dateFilter ? dateFilter.value : '';
    
    console.log('Filtering routes:', { statusValue, driverValue, dateValue });
    console.log('Total routes:', routes.length);
    
    filteredRoutes = routes.filter(route => {
        const matchStatus = !statusValue || route.status === statusValue;
        const matchDriver = !driverValue || route.driverId === driverValue;
        
        let matchDate = true;
        if (dateValue && route.routeDate) {
            const routeDate = route.routeDate.split('T')[0];
            matchDate = routeDate === dateValue;
        }
        
        return matchStatus && matchDriver && matchDate;
    });
    
    console.log('Filtered routes:', filteredRoutes.length);
    
    renderRoutes();
}

// Render routes
function renderRoutes() {
    const tbody = document.getElementById('routesTableBody');
    if (!tbody) return;
    
    if (filteredRoutes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-route" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không có tuyến đường nào
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredRoutes.map(route => {
        const driver = drivers.find(d => d.id === route.driverId);
        const statusClass = getRouteStatusClass(route.status);
        const statusText = getRouteStatusText(route.status);
        
        let actions = '';
        
        // QUY TRÌNH NGHIỆP VỤ TUYẾN ĐƯỜNG
        if (route.status === 'planning') {
            // Tuyến đang lên kế hoạch
            actions += `<button class="btn btn-sm btn-primary" onclick="startRoute('${route.id}')" title="Bắt đầu tuyến đường">
                <i class="fas fa-play"></i> Bắt đầu
            </button>`;
            actions += `<button class="btn btn-sm btn-secondary" onclick="editRoute('${route.id}')" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
            </button>`;
            actions += `<button class="btn btn-sm btn-danger" onclick="deleteRoute('${route.id}')" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>`;
        } else if (route.status === 'active') {
            // Tuyến đang thực hiện
            actions += `<button class="btn btn-sm btn-success" onclick="completeRoute('${route.id}')" title="Hoàn thành tuyến đường">
                <i class="fas fa-check-circle"></i> Hoàn thành
            </button>`;
            actions += `<button class="btn btn-sm btn-warning" onclick="viewRouteOnMap('${route.id}')" title="Xem trên bản đồ">
                <i class="fas fa-map-marked-alt"></i> Bản đồ
            </button>`;
        } else {
            // Completed hoặc Cancelled
            actions += `<button class="btn btn-sm btn-info" onclick="viewRouteDetail('${route.id}')" title="Xem chi tiết">
                <i class="fas fa-eye"></i> Chi tiết
            </button>`;
        }
        
        return `
            <tr>
                <td><strong>${route.id}</strong></td>
                <td>${route.routeName || 'N/A'}</td>
                <td>
                    ${driver ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">
                                ${driver.name.substring(0, 2)}
                            </div>
                            <div style="font-weight: 500;">${driver.name}</div>
                        </div>
                    ` : '<span class="badge badge-warning">Chưa phân</span>'}
                </td>
                <td>${formatDate(route.routeDate)}</td>
                <td><span class="badge badge-info">${route.orders ? route.orders.length : 0} đơn</span></td>
                <td>${route.estimatedDistance || 0} km</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Reset filters
function resetFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const driverFilter = document.getElementById('driverFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (driverFilter) driverFilter.value = '';
    if (dateFilter) dateFilter.value = ''; // Không set ngày mặc định khi reset
    
    filterRoutes();
}

// Switch view
function switchView(view) {
    currentView = view;
    const listView = document.getElementById('listView');
    const mapView = document.getElementById('mapView');
    const listBtn = document.getElementById('listViewBtn');
    const mapBtn = document.getElementById('mapViewBtn');
    
    if (!listView || !mapView) return;
    
    if (view === 'list') {
        listView.style.display = 'block';
        mapView.style.display = 'none';
        if (listBtn) {
            listBtn.classList.add('btn-info');
            listBtn.classList.remove('btn-secondary');
        }
        if (mapBtn) {
            mapBtn.classList.remove('btn-info');
            mapBtn.classList.add('btn-secondary');
        }
    } else {
        listView.style.display = 'none';
        mapView.style.display = 'block';
        if (listBtn) {
            listBtn.classList.remove('btn-info');
            listBtn.classList.add('btn-secondary');
        }
        if (mapBtn) {
            mapBtn.classList.add('btn-info');
            mapBtn.classList.remove('btn-secondary');
        }
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                displayRoutesOnMap();
            }
        }, 100);
    }
}

// Initialize map
function initMap() {
    try {
        const mapDiv = document.getElementById('map');
        if (!mapDiv) return;
        
        map = L.map('map').setView([10.8231, 106.6297], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } catch (e) {
        console.error('Error initializing map:', e);
    }
}

// Display routes on map
function displayRoutesOnMap() {
    if (!map) return;
    
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    filteredRoutes.forEach(route => {
        if (route.orders && route.orders.length > 0) {
            route.orders.forEach((orderId, index) => {
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    const lat = 10.8231 + (Math.random() - 0.5) * 0.1;
                    const lng = 106.6297 + (Math.random() - 0.5) * 0.1;
                    
                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup(`
                        <strong>${order.id}</strong><br>
                        ${order.customerName}<br>
                        ${order.deliveryAddress}
                    `);
                }
            });
        }
    });
}

// ========== MODAL FUNCTIONS ==========

function openCreateRouteModal() {
    const modal = document.getElementById('createRouteModal');
    if (modal) modal.style.display = 'flex';
    loadAvailableOrders();
    selectedOrdersForRoute = [];
    updateRouteSummary();
}

function closeCreateRouteModal() {
    const modal = document.getElementById('createRouteModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('createRouteForm');
    if (form) form.reset();
    selectedOrdersForRoute = [];
}

function loadAvailableOrders() {
    const ordersSelection = document.getElementById('ordersSelection');
    if (!ordersSelection) return;
    
    const availableOrders = orders.filter(o => 
        ['pending', 'assigned'].includes(o.status) && !o.routeId
    );
    
    if (availableOrders.length === 0) {
        ordersSelection.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Không có đơn hàng nào có thể phân vào tuyến</p>';
        return;
    }
    
    ordersSelection.innerHTML = availableOrders.map(order => `
        <div class="order-checkbox-item" style="padding: 10px; border-bottom: 1px solid #eee;">
            <label style="display: flex; align-items: start; gap: 10px; cursor: pointer;">
                <input type="checkbox" class="route-order-checkbox" data-order-id="${order.id}" value="${order.id}" style="margin-top: 3px;" onchange="toggleOrderSelection('${order.id}')">
                <div style="flex: 1;">
                    <div><strong>${order.id}</strong> - ${order.customerName}</div>
                    <div style="font-size: 0.85rem; color: #666;">
                        <i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}
                    </div>
                    <div style="font-size: 0.85rem; color: #999;">
                        COD: ${formatMoney(order.codAmount || 0)}
                    </div>
                </div>
            </label>
        </div>
    `).join('');
}

function toggleOrderSelection(orderId) {
    if (selectedOrdersForRoute.includes(orderId)) {
        selectedOrdersForRoute = selectedOrdersForRoute.filter(id => id !== orderId);
    } else {
        selectedOrdersForRoute.push(orderId);
    }
    updateRouteSummary();
}

function updateRouteSummary() {
    const orderCount = selectedOrdersForRoute.length;
    let totalCOD = 0;
    
    selectedOrdersForRoute.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order) totalCOD += order.codAmount || 0;
    });
    
    const estimatedDistance = orderCount > 0 ? 10 + (orderCount * 5) : 0;
    const estimatedTime = orderCount > 0 ? 30 + (orderCount * 20) : 0;
    
    const elem1 = document.getElementById('summaryOrderCount');
    const elem2 = document.getElementById('summaryCOD');
    const elem3 = document.getElementById('summaryDistance');
    const elem4 = document.getElementById('summaryTime');
    
    if (elem1) elem1.textContent = orderCount;
    if (elem2) elem2.textContent = formatMoney(totalCOD);
    if (elem3) elem3.textContent = estimatedDistance + ' km';
    if (elem4) elem4.textContent = estimatedTime + ' phút';
}

function createRoute(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    if (selectedOrdersForRoute.length === 0) {
        showNotification('warning', 'Vui lòng chọn ít nhất 1 đơn hàng cho tuyến đường');
        return;
    }
    
    const routeDate = formData.get('routeDate');
    const startTime = formData.get('startTime');
    
    const newRoute = {
        id: 'ROUTE' + Date.now(),
        routeName: formData.get('routeName') || '',
        driverId: formData.get('driverId') || '',
        routeDate: routeDate + 'T' + startTime,
        startTime: startTime || '',
        orders: [...selectedOrdersForRoute],
        notes: formData.get('notes') || '',
        status: 'planning',
        estimatedDistance: parseInt(document.getElementById('summaryDistance').textContent),
        estimatedTime: parseInt(document.getElementById('summaryTime').textContent),
        createdAt: new Date().toISOString(),
        timeline: [
            {
                status: 'planning',
                time: new Date().toISOString(),
                description: 'Tuyến đường đã được tạo'
            }
        ]
    };
    
    selectedOrdersForRoute.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order) order.routeId = newRoute.id;
    });
    
    routes.unshift(newRoute);
    saveRoutesToStorage();
    saveOrdersToStorage();
    
    closeCreateRouteModal();
    loadRoutes();
    updateStatsCards();
    
    showNotification('success', `Tạo tuyến đường ${newRoute.id} thành công với ${selectedOrdersForRoute.length} đơn hàng`);
}

// ========== WORKFLOW FUNCTIONS ==========

function startRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    if (confirm(`Bắt đầu thực hiện tuyến đường ${route.routeName}?`)) {
        route.status = 'active';
        route.startedAt = new Date().toISOString();
        route.timeline.push({
            status: 'active',
            time: new Date().toISOString(),
            description: 'Tuyến đường bắt đầu thực hiện'
        });
        
        const driver = drivers.find(d => d.id === route.driverId);
        if (driver) {
            driver.currentOrders += route.orders.length;
            saveDriversToStorage();
        }
        
        saveRoutesToStorage();
        loadRoutes();
        updateStatsCards();
        showNotification('success', `Tuyến đường ${route.id} đã bắt đầu`);
    }
}

function completeRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    const allDelivered = route.orders.every(orderId => {
        const order = orders.find(o => o.id === orderId);
        return order && order.status === 'delivered';
    });
    
    if (!allDelivered) {
        if (!confirm('Một số đơn hàng chưa hoàn thành. Bạn có chắc muốn hoàn thành tuyến đường này?')) {
            return;
        }
    }
    
    route.status = 'completed';
    route.completedAt = new Date().toISOString();
    route.timeline.push({
        status: 'completed',
        time: new Date().toISOString(),
        description: 'Tuyến đường đã hoàn thành'
    });
    
    saveRoutesToStorage();
    loadRoutes();
    updateStatsCards();
    showNotification('success', `Hoàn thành tuyến đường ${route.id}`);
}

function deleteRoute(routeId) {
    if (!confirm('Bạn có chắc muốn xóa tuyến đường này?')) return;
    
    const route = routes.find(r => r.id === routeId);
    if (route && route.orders) {
        route.orders.forEach(orderId => {
            const order = orders.find(o => o.id === orderId);
            if (order) delete order.routeId;
        });
        saveOrdersToStorage();
    }
    
    routes = routes.filter(r => r.id !== routeId);
    saveRoutesToStorage();
    loadRoutes();
    updateStatsCards();
    showNotification('success', 'Đã xóa tuyến đường');
}

function editRoute(routeId) {
    showNotification('info', 'Chức năng chỉnh sửa tuyến đường đang được phát triển');
}

function viewRouteOnMap(routeId) {
    switchView('map');
    filteredRoutes = routes.filter(r => r.id === routeId);
    displayRoutesOnMap();
}

function viewRouteDetail(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    const driver = drivers.find(d => d.id === route.driverId);
    
    let ordersList = '';
    if (route.orders && route.orders.length > 0) {
        ordersList = route.orders.map((orderId, index) => {
            const order = orders.find(o => o.id === orderId);
            if (!order) return '';
            
            return `
                <div style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${index + 1}. ${order.id}</strong> - ${order.customerName}
                            <div style="font-size: 0.85rem; color: #666;">
                                <i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}
                            </div>
                        </div>
                        <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const content = `
        <div class="route-detail-container">
            <div class="detail-section" style="margin-bottom: 20px;">
                <h4><i class="fas fa-info-circle"></i> Thông tin tuyến đường</h4>
                <div class="detail-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div class="detail-item">
                        <span class="detail-label">Mã tuyến:</span>
                        <span class="detail-value"><strong>${route.id}</strong></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tên tuyến:</span>
                        <span class="detail-value">${route.routeName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tài xế:</span>
                        <span class="detail-value">${driver ? driver.name : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ngày thực hiện:</span>
                        <span class="detail-value">${formatDateTime(route.routeDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Số đơn hàng:</span>
                        <span class="detail-value">${route.orders.length} đơn</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Quãng đường:</span>
                        <span class="detail-value">${route.estimatedDistance} km</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Trạng thái:</span>
                        <span class="badge ${getRouteStatusClass(route.status)}">${getRouteStatusText(route.status)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section" style="margin-bottom: 20px;">
                <h4><i class="fas fa-box"></i> Danh sách đơn hàng (${route.orders.length})</h4>
                ${ordersList}
            </div>
            
            ${route.timeline && route.timeline.length > 0 ? `
                <div class="detail-section">
                    <h4><i class="fas fa-history"></i> Lịch sử</h4>
                    <div class="timeline">
                        ${route.timeline.map(t => `
                            <div class="timeline-item">
                                <div class="timeline-icon ${getTimelineIconClass(t.status)}">
                                    <i class="${getTimelineIcon(t.status)}"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-time">${formatDateTime(t.time)}</div>
                                    <div class="timeline-desc">${t.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    const modalContent = document.getElementById('routeDetailContent');
    const modalId = document.getElementById('modalRouteId');
    const modal = document.getElementById('routeDetailModal');
    
    if (modalContent) modalContent.innerHTML = content;
    if (modalId) modalId.textContent = route.id;
    if (modal) modal.style.display = 'flex';
}

function closeRouteDetailModal() {
    const modal = document.getElementById('routeDetailModal');
    if (modal) modal.style.display = 'none';
}

// ========== HELPER FUNCTIONS ==========

function getRouteStatusText(status) {
    const texts = {
        'planning': 'Đang lên kế hoạch',
        'active': 'Đang thực hiện',
        'completed': 'Đã hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

function getRouteStatusClass(status) {
    const classes = {
        'planning': 'badge-warning',
        'active': 'badge-primary',
        'completed': 'badge-success',
        'cancelled': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimelineIcon(status) {
    const icons = {
        'planning': 'fas fa-clipboard-list',
        'active': 'fas fa-shipping-fast',
        'completed': 'fas fa-check-circle',
        'cancelled': 'fas fa-ban'
    };
    return icons[status] || 'fas fa-circle';
}

function getTimelineIconClass(status) {
    const classes = {
        'planning': 'warning',
        'active': 'primary',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'primary';
}

function saveRoutesToStorage() {
    localStorage.setItem('routes', JSON.stringify(routes));
}

function saveOrdersToStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function saveDriversToStorage() {
    localStorage.setItem('drivers', JSON.stringify(drivers));
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
