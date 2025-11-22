/**
 * Data Sync Service - Đồng bộ localStorage cho toàn hệ thống
 * File này được load ở tất cả trang admin để đảm bảo dữ liệu được sync
 */

// Global data store
window.DataSync = {
    // Data cache
    cache: {
        orders: [],
        drivers: [],
        routes: [],
        users: [],
        settlements: [],
        lastSync: null
    },
    
    // Sync interval (milliseconds)
    syncInterval: 2000, // 2 seconds
    
    // Sync timer
    syncTimer: null,
    
    // Initialize
    init: function() {
        console.log('[DataSync] Initializing...');
        this.loadAllData();
        this.startAutoSync();
        this.setupStorageListener();
        console.log('[DataSync] Initialized successfully');
    },
    
    // Load all data from localStorage
    loadAllData: function() {
        try {
            this.cache.orders = JSON.parse(localStorage.getItem('orders') || '[]');
            this.cache.drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
            this.cache.routes = JSON.parse(localStorage.getItem('routes') || '[]');
            this.cache.users = JSON.parse(localStorage.getItem('users') || '[]');
            this.cache.settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
            this.cache.lastSync = new Date().toISOString();
            
            console.log('[DataSync] Loaded data:', {
                orders: this.cache.orders.length,
                drivers: this.cache.drivers.length,
                routes: this.cache.routes.length,
                users: this.cache.users.length,
                settlements: this.cache.settlements.length
            });
        } catch (e) {
            console.error('[DataSync] Error loading data:', e);
        }
    },
    
    // Get data
    get: function(key) {
        return this.cache[key] || [];
    },
    
    // Set data
    set: function(key, data) {
        this.cache[key] = data;
        localStorage.setItem(key, JSON.stringify(data));
        this.triggerSync(key);
    },
    
    // Trigger sync event
    triggerSync: function(key) {
        const event = new CustomEvent('dataSync', {
            detail: { key: key, data: this.cache[key], timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    },
    
    // Start auto sync
    startAutoSync: function() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            this.loadAllData();
        }, this.syncInterval);
    },
    
    // Stop auto sync
    stopAutoSync: function() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    },
    
    // Setup storage event listener (for cross-tab sync)
    setupStorageListener: function() {
        window.addEventListener('storage', (e) => {
            if (e.key && ['orders', 'drivers', 'routes', 'users', 'settlements'].includes(e.key)) {
                console.log('[DataSync] Storage changed:', e.key);
                this.loadAllData();
                this.triggerSync(e.key);
            }
        });
    },
    
    // Export data
    exportData: function() {
        const data = {
            orders: this.cache.orders,
            drivers: this.cache.drivers,
            routes: this.cache.routes,
            users: this.cache.users,
            settlements: this.cache.settlements,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logistics-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        return data;
    },
    
    // Import data
    importData: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.orders) this.set('orders', data.orders);
                    if (data.drivers) this.set('drivers', data.drivers);
                    if (data.routes) this.set('routes', data.routes);
                    if (data.users) this.set('users', data.users);
                    if (data.settlements) this.set('settlements', data.settlements);
                    
                    this.loadAllData();
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    // Clear all data
    clearAllData: function() {
        if (confirm('Bạn có chắc muốn xóa TẤT CẢ dữ liệu?\n\nHành động này không thể hoàn tác!')) {
            localStorage.removeItem('orders');
            localStorage.removeItem('drivers');
            localStorage.removeItem('routes');
            localStorage.removeItem('users');
            localStorage.removeItem('settlements');
            this.loadAllData();
            alert('Đã xóa tất cả dữ liệu!');
            return true;
        }
        return false;
    },
    
    // Get statistics
    getStats: function() {
        return {
            orders: {
                total: this.cache.orders.length,
                pending: this.cache.orders.filter(o => o.status === 'pending').length,
                delivering: this.cache.orders.filter(o => o.status === 'delivering').length,
                delivered: this.cache.orders.filter(o => o.status === 'delivered').length,
                cancelled: this.cache.orders.filter(o => o.status === 'cancelled').length
            },
            drivers: {
                total: this.cache.drivers.length,
                active: this.cache.drivers.filter(d => d.status === 'active').length
            },
            routes: {
                total: this.cache.routes.length
            },
            users: {
                total: this.cache.users.length,
                admin: this.cache.users.filter(u => u.role === 'admin').length,
                driver: this.cache.users.filter(u => u.role === 'driver').length,
                customer: this.cache.users.filter(u => u.role === 'customer').length
            },
            settlements: {
                total: this.cache.settlements.length
            },
            storage: {
                used: new Blob([JSON.stringify(localStorage)]).size,
                limit: 5 * 1024 * 1024 // 5MB typical limit
            }
        };
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.DataSync.init());
} else {
    window.DataSync.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.DataSync.stopAutoSync();
});
