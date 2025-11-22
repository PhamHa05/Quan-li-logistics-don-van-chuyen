// Load users from localStorage or use default demo accounts
function loadUsers() {
    let loginUsers = [];
    
    // Load regular users from users storage
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        try {
            const parsedUsers = JSON.parse(savedUsers);
            // Convert to login format
            loginUsers = parsedUsers.map(user => ({
                username: user.username || user.email.split('@')[0],
                password: user.password,
                role: user.role,
                fullName: user.name || user.fullName,
                fullname: user.name || user.fullName,
                name: user.name || user.fullName,
                phone: user.phone || '',
                email: user.email,
                address: user.address || '',
                userId: user.id || user.userId,
                id: user.id || user.userId,
                linkedDriverId: user.linkedDriverId || null,
                // Customer specific fields
                birthday: user.birthday || '',
                gender: user.gender || '',
                idCard: user.idCard || '',
                addresses: user.addresses || [],
                createdAt: user.createdAt || new Date().toISOString(),
                status: user.status || 'active'
            }));
        } catch (e) {
            console.error('Error loading users from localStorage:', e);
        }
    }
    
    // Load drivers from drivers storage và merge vào users
    const savedDrivers = localStorage.getItem('drivers');
    if (savedDrivers) {
        try {
            const parsedDrivers = JSON.parse(savedDrivers);
            parsedDrivers.forEach(driver => {
                // Check if driver already exists in loginUsers
                const exists = loginUsers.find(u => 
                    u.username === driver.username || 
                    u.email === driver.email ||
                    u.userId === driver.id
                );
                
                if (!exists) {
                    loginUsers.push({
                        username: driver.username,
                        password: driver.password || hashPassword('123456'), // Default password
                        role: driver.role || 'driver',
                        fullName: driver.fullname || driver.name,
                        fullname: driver.fullname || driver.name,
                        name: driver.name,
                        phone: driver.phone || driver.phoneNumber,
                        phoneNumber: driver.phone || driver.phoneNumber,
                        email: driver.email,
                        address: driver.address || '',
                        userId: driver.id,
                        id: driver.id,
                        vehicleNumber: driver.vehiclePlate || driver.vehicle,
                        vehiclePlate: driver.vehiclePlate || driver.vehicle,
                        vehicle: driver.vehicle || driver.vehiclePlate,
                        vehicleType: driver.vehicleType,
                        licenseNumber: driver.driverLicense || driver.license,
                        driverLicense: driver.driverLicense || driver.license,
                        license: driver.license || driver.driverLicense,
                        dateOfBirth: driver.dateOfBirth || driver.birthday,
                        rating: driver.rating
                    });
                }
            });
            console.log('[Login] Loaded drivers into login users:', parsedDrivers.length);
        } catch (e) {
            console.error('Error loading drivers from localStorage:', e);
        }
    }
    
    // Return merged users or default demo accounts
    if (loginUsers.length > 0) {
        return loginUsers;
    }
    
    // Return default demo accounts if no users in localStorage
    return [
        {
            username: 'admin',
            password: hashPassword('admin123'),
            role: 'admin',
            fullName: 'Nguyễn Văn Admin',
            phone: '0901234567',
            email: 'admin@logistics.com'
        },
        {
            username: 'driver1',
            password: hashPassword('driver123'),
            role: 'driver',
            fullName: 'Trần Văn Tài',
            phone: '0912345678',
            email: 'driver1@logistics.com',
            vehicleNumber: '29A-12345',
            licenseNumber: 'B2-123456'
        },
        {
            username: 'driver2',
            password: hashPassword('driver123'),
            role: 'driver',
            fullName: 'Lê Thị Hoa',
            phone: '0923456789',
            email: 'driver2@logistics.com',
            vehicleNumber: '30B-67890',
            licenseNumber: 'B2-789012'
        },
        {
            username: 'customer1',
            password: hashPassword('customer123'),
            role: 'customer',
            fullName: 'Phạm Thị Lan',
            phone: '0934567890',
            email: 'customer1@gmail.com',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            userId: 'CUST001',
            birthday: '1995-05-15',
            gender: 'female',
            idCard: '079195012345',
            createdAt: '2024-01-15T08:30:00.000Z',
            addresses: [
                {
                    id: 1,
                    label: 'Nhà riêng',
                    name: 'Phạm Thị Lan',
                    phone: '0934567890',
                    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
                    isDefault: true,
                    createdAt: '2024-01-15T08:30:00.000Z'
                },
                {
                    id: 2,
                    label: 'Văn phòng',
                    name: 'Phạm Thị Lan',
                    phone: '0934567890',
                    address: '88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM',
                    isDefault: false,
                    createdAt: '2024-02-10T10:15:00.000Z'
                }
            ]
        },
        {
            username: 'customer2',
            password: hashPassword('customer123'),
            role: 'customer',
            fullName: 'Hoàng Văn Nam',
            phone: '0945678901',
            email: 'customer2@gmail.com',
            address: '456 Lê Lợi, Quận 1, TP.HCM',
            userId: 'CUST002',
            birthday: '1990-10-20',
            gender: 'male',
            idCard: '079190067890',
            createdAt: '2024-02-20T14:20:00.000Z',
            addresses: [
                {
                    id: 3,
                    label: 'Nhà riêng',
                    name: 'Hoàng Văn Nam',
                    phone: '0945678901',
                    address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
                    isDefault: true,
                    createdAt: '2024-02-20T14:20:00.000Z'
                }
            ]
        }
    ];
}

// Simple password hashing (same as admin-users.js)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Save user data and redirect
async function saveUserDataAndRedirect(user, taiXeId, rememberMe) {
    // Normalize data from API response
    const userData = {
        username: user.tenDangNhap || user.TenDangNhap || user.username,
        fullName: user.hoTen || user.HoTen || user.fullName,
        role: (user.vaiTro || user.VaiTro || user.role || '').toUpperCase(),
        email: user.email || user.Email || '',
        phone: user.soDienThoai || user.SoDienThoai || user.phone || '',
        address: user.diaChi || user.DiaChi || user.address || '',
        userId: user.maNguoiDung || user.MaNguoiDung || user.userId || user.id,
        id: user.maNguoiDung || user.MaNguoiDung || user.userId || user.id,
        loginTime: new Date().toISOString()
    };
    
    // Add TaiXe ID if driver
    if (userData.role === 'TAIXE' && taiXeId) {
        userData.maTaiXe = taiXeId;
        userData.MaTaiXe = taiXeId;
        userData.idTaiXe = taiXeId;
        userData.IdTaiXe = taiXeId;
        userData.driverId = taiXeId;
        console.log('[Login] Added TaiXe ID to user data:', taiXeId);
    }
    
    // Save to storage
    if (rememberMe) {
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('rememberMe', 'true');
    } else {
        sessionStorage.setItem('loggedInUser', JSON.stringify(userData));
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }
    
    console.log('[Login] User data saved:', userData);
    
    // Show loading
    const loginBtn = document.getElementById('login-btn');
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.innerHTML = '<i class="fas fa-spinner"></i> Đang đăng nhập...';
    
    // Redirect based on role
    const roleMap = {
        'TAIXE': 'driver',
        'KHACH': 'customer',
        'ADMIN': 'admin'
    };
    
    const redirectRole = roleMap[userData.role] || 'admin';
    
    console.log('[Login] User role from API:', userData.role);
    console.log('[Login] Mapped to:', redirectRole);
    console.log('[Login] Will redirect to:', 
        redirectRole === 'customer' ? 'index-customer.html' :
        redirectRole === 'driver' ? 'index-driver.html' : 'index.html'
    );
    
    setTimeout(() => {
        switch(redirectRole) {
            case 'admin':
                console.log('[Login] Redirecting to admin page...');
                window.location.href = 'index.html';
                break;
            case 'driver':
                console.log('[Login] Redirecting to driver page...');
                window.location.href = 'index-driver.html';
                break;
            case 'customer':
                console.log('[Login] Redirecting to CUSTOMER page...');
                window.location.href = 'index-customer.html';
                break;
            default:
                console.warn('[Login] Unknown role, redirecting to admin...');
                window.location.href = 'index.html';
        }
    }, 500);
}

// Danh sách tài khoản - load from localStorage
let users = loadUsers();

// Kiểm tra xem đã đăng nhập chưa và chuyển hướng theo role
function checkAuth() {
    // Ngăn chặn loop - chỉ redirect nếu đang ở trang login
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== '') {
        console.log('[Login] Not on login page, skipping checkAuth redirect');
        return;
    }
    
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    if (user) {
        const userData = JSON.parse(user);
        
        // Normalize role to handle Vietnamese and English
        let userRole = String(userData.role || userData.vaiTro || '').toLowerCase().trim();
        
        // Map Vietnamese roles to English
        const roleMap = {
            'taixe': 'driver',
            'tai xe': 'driver',
            'driver': 'driver',
            'khach': 'customer',
            'khachhang': 'customer',
            'khach hang': 'customer',
            'customer': 'customer',
            'admin': 'admin',
            'quantri': 'admin',
            'quan tri': 'admin'
        };
        
        userRole = roleMap[userRole] || userRole;
        console.log('[Login] User role:', userData.role, '→ normalized:', userRole);
        
        // Chuyển hướng dựa theo role
        switch(userRole) {
            case 'admin':
                console.log('[Login] Redirecting to admin dashboard...');
                window.location.href = 'index.html';
                break;
            case 'driver':
                console.log('[Login] Redirecting to driver dashboard...');
                window.location.href = 'index-driver.html';
                break;
            case 'customer':
                console.log('[Login] Redirecting to customer dashboard...');
                window.location.href = 'index-customer.html';
                break;
            default:
                console.warn('[Login] Unknown role:', userRole, '- redirecting to admin');
                window.location.href = 'index.html';
        }
    }
}

// Validate form
function validateForm(username, password) {
    let isValid = true;
    
    // Reset errors
    document.getElementById('username-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('username').classList.remove('error');
    document.getElementById('password').classList.remove('error');
    
    // Validate username
    if (!username.trim()) {
        document.getElementById('username-error').textContent = 'Vui lòng nhập tên đăng nhập';
        document.getElementById('username').classList.add('error');
        isValid = false;
    } else if (username.length < 3) {
        document.getElementById('username-error').textContent = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        document.getElementById('username').classList.add('error');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        document.getElementById('password-error').textContent = 'Vui lòng nhập mật khẩu';
        document.getElementById('password').classList.add('error');
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('password-error').textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        document.getElementById('password').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Hiển thị thông báo lỗi
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Xử lý đăng nhập
async function handleLogin(username, password, rememberMe) {
    // Ưu tiên login qua API
    try {
        const API_BASE = 'http://localhost:5257/api';
        const response = await fetch(`${API_BASE}/NguoiDung/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                TenDangNhap: username,
                MatKhau: password
            })
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('[Login] API login successful:', user);
            
            // Check if user role is driver/TAIXE
            const userRole = String(user.vaiTro || user.VaiTro || '').toUpperCase();
            
            // If driver, find TaiXe record by phone number
            let taiXeId = null;
            if (userRole === 'TAIXE') {
                try {
                    const searchResponse = await fetch(`${API_BASE}/TaiXe/search`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            PageIndex: 1,
                            PageSize: 100,
                            HoTen: '',
                            SoDienThoai: user.soDienThoai || user.SoDienThoai || ''
                        })
                    });
                    
                    if (searchResponse.ok) {
                        const searchResult = await searchResponse.json();
                        const drivers = searchResult.Data || searchResult.data || [];
                        
                        if (drivers.length > 0) {
                            // Find driver by phone number
                            const driver = drivers.find(d => 
                                (d.soDienThoai || d.SoDienThoai) === (user.soDienThoai || user.SoDienThoai)
                            );
                            
                            if (driver) {
                                taiXeId = driver.id || driver.Id;
                                console.log('[Login] Found TaiXe ID:', taiXeId, 'for phone:', user.soDienThoai || user.SoDienThoai);
                            }
                        }
                    }
                } catch (e) {
                    console.error('[Login] Error finding TaiXe:', e);
                }
            }
            
            // Save user data with linked TaiXe ID
            await saveUserDataAndRedirect(user, taiXeId, rememberMe);
            return true;
        } else {
            console.log('[Login] API login failed, trying localStorage...');
        }
    } catch (error) {
        console.error('[Login] API login error:', error);
        console.log('[Login] Falling back to localStorage login...');
    }
    
    // Fallback: Login với localStorage
    const hashedPassword = hashPassword(password);
    
    // Tìm user trong danh sách - check both username and email
    const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === hashedPassword
    );
    
    if (user) {
        // Check if user is active (if status field exists)
        if (user.status && user.status === 'inactive') {
            showError('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin!');
            return false;
        }
        
        // Update last login time in localStorage if user has userId
        if (user.userId) {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                const allUsers = JSON.parse(savedUsers);
                const userIndex = allUsers.findIndex(u => u.id === user.userId);
                if (userIndex !== -1) {
                    allUsers[userIndex].lastLogin = new Date().toISOString();
                    localStorage.setItem('users', JSON.stringify(allUsers));
                }
            }
        }
        
        // Lưu thông tin user với đầy đủ trường
        const userData = {
            username: user.username,
            fullName: user.fullName,
            fullname: user.fullName,
            name: user.fullName,
            role: user.role,
            email: user.email,
            phone: user.phone,
            phoneNumber: user.phone,
            address: user.address,
            userId: user.userId || null,
            id: user.userId || user.id,
            loginTime: new Date().toISOString(),
            password: user.password // Cần thiết cho đổi mật khẩu
        };
        
        // Thêm thông tin driver nếu là driver
        const normalizedRole = String(user.role || '').toLowerCase().trim();
        const isDriver = normalizedRole === 'driver' || normalizedRole === 'taixe' || normalizedRole === 'tai xe';
        
        if (isDriver) {
            userData.vehicleNumber = user.vehicleNumber || user.vehiclePlate || user.vehicle;
            userData.vehiclePlate = user.vehiclePlate || user.vehicleNumber || user.vehicle;
            userData.vehicle = user.vehicle || user.vehiclePlate || user.vehicleNumber;
            userData.vehicleType = user.vehicleType;
            userData.licenseNumber = user.licenseNumber || user.driverLicense || user.license;
            userData.driverLicense = user.driverLicense || user.licenseNumber || user.license;
            userData.license = user.license || user.licenseNumber || user.driverLicense;
            userData.dateOfBirth = user.dateOfBirth;
            userData.rating = user.rating;
        }
        
        // Thêm thông tin customer nếu là customer
        if (user.role === 'customer') {
            userData.birthday = user.birthday;
            userData.gender = user.gender;
            userData.idCard = user.idCard;
            userData.addresses = user.addresses || [];
            userData.createdAt = user.createdAt || new Date().toISOString();
        }
        
        // Save and redirect using common function
        await saveUserDataAndRedirect(userData, null, rememberMe);
        return true;
    } else {
        showError('Tên đăng nhập hoặc mật khẩu không đúng!');
        return false;
    }
}

// Toggle hiển thị mật khẩu
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Khởi tạo dữ liệu users trong localStorage
function initializeUsers() {
    const existingUsers = localStorage.getItem('users');
    
    // Nếu chưa có users trong localStorage, tạo dữ liệu mẫu
    if (!existingUsers || existingUsers === '[]') {
        const demoUsers = [
            {
                id: 'CUST001',
                userId: 'CUST001',
                username: 'customer1',
                password: hashPassword('customer123'),
                role: 'customer',
                name: 'Phạm Thị Lan',
                fullName: 'Phạm Thị Lan',
                email: 'customer1@gmail.com',
                phone: '0934567890',
                address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
                birthday: '1995-05-15',
                gender: 'female',
                idCard: '079195012345',
                createdAt: '2024-01-15T08:30:00.000Z',
                status: 'active',
                addresses: [
                    {
                        id: 1,
                        label: 'Nhà riêng',
                        name: 'Phạm Thị Lan',
                        phone: '0934567890',
                        address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
                        isDefault: true,
                        createdAt: '2024-01-15T08:30:00.000Z'
                    },
                    {
                        id: 2,
                        label: 'Văn phòng',
                        name: 'Phạm Thị Lan',
                        phone: '0934567890',
                        address: '88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM',
                        isDefault: false,
                        createdAt: '2024-02-10T10:15:00.000Z'
                    }
                ]
            },
            {
                id: 'CUST002',
                userId: 'CUST002',
                username: 'customer2',
                password: hashPassword('customer123'),
                role: 'customer',
                name: 'Hoàng Văn Nam',
                fullName: 'Hoàng Văn Nam',
                email: 'customer2@gmail.com',
                phone: '0945678901',
                address: '456 Lê Lợi, Quận 1, TP.HCM',
                birthday: '1990-10-20',
                gender: 'male',
                idCard: '079190067890',
                createdAt: '2024-02-20T14:20:00.000Z',
                status: 'active',
                addresses: [
                    {
                        id: 3,
                        label: 'Nhà riêng',
                        name: 'Hoàng Văn Nam',
                        phone: '0945678901',
                        address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
                        isDefault: true,
                        createdAt: '2024-02-20T14:20:00.000Z'
                    }
                ]
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(demoUsers));
        console.log('[Login] Initialized demo users in localStorage');
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu users trong localStorage nếu chưa có
    initializeUsers();
    
    // Kiểm tra xem đã đăng nhập chưa
    checkAuth();
    
    // Kiểm tra remember me
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUser = localStorage.getItem('loggedInUser');
        if (savedUser) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Xử lý form submit
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validate
        if (validateForm(username, password)) {
            // Login
            handleLogin(username, password, rememberMe);
        }
    });
    
    // Toggle password visibility
    document.getElementById('toggle-password').addEventListener('click', togglePasswordVisibility);
    
    // Xóa lỗi khi người dùng nhập
    document.getElementById('username').addEventListener('input', function() {
        this.classList.remove('error');
        document.getElementById('username-error').textContent = '';
        document.getElementById('error-message').style.display = 'none';
    });
    
    document.getElementById('password').addEventListener('input', function() {
        this.classList.remove('error');
        document.getElementById('password-error').textContent = '';
        document.getElementById('error-message').style.display = 'none';
    });
    
    // Xử lý quên mật khẩu
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Chức năng khôi phục mật khẩu sẽ được cập nhật sau.\n\nVui lòng liên hệ admin để được hỗ trợ.');
    });
});
