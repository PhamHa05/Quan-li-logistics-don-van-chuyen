# Kết nối Frontend với Backend qua API - AngularJS Integration

## 📋 Tổng quan

Dự án đã được tích hợp AngularJS để kết nối frontend với backend API. Hệ thống cho phép gọi các API endpoint từ backend ASP.NET Core Web API.

## 🎯 Các file đã tạo

### 1. Cấu hình & Services
- **`app.config.js`**: Cấu hình chính AngularJS app, API endpoints, interceptors
- **`services/api.service.js`**: Service chứa tất cả các API calls

### 2. Controllers
- **`controllers/login.controller.js`**: Xử lý đăng nhập
- **`controllers/admin-users.controller.js`**: Quản lý người dùng (Admin)
- **`controllers/admin-orders.controller.js`**: Quản lý đơn hàng (Admin)
- **`controllers/customer-orders.controller.js`**: Xem đơn hàng (Customer)
- **`controllers/customer-create-order.controller.js`**: Tạo đơn hàng (Customer)
- **`controllers/driver-orders.controller.js`**: Quản lý đơn hàng (Driver)

### 3. HTML Examples
- **`login.html`**: Đã cập nhật để sử dụng AngularJS
- **`admin-users-angular.html`**: Ví dụ hoàn chỉnh trang quản lý users

### 4. Documentation
- **`ANGULAR_INTEGRATION_GUIDE.md`**: Hướng dẫn chi tiết

## 🚀 Cách sử dụng

### Bước 1: Cấu hình Backend

1. **Bật CORS trong Backend API**

Mở file `Program.cs` trong project TestAPI hoặc Gateway và thêm:

```csharp
// Thêm vào phần ConfigureServices
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Thêm vào phần Configure (sau app.UseRouting())
app.UseCors("AllowAll");
```

2. **Chạy Backend**

```bash
cd QuanLyLogistics/TestAPI
dotnet run
```

Backend sẽ chạy trên `http://localhost:5257` (hoặc port khác)

### Bước 2: Cấu hình Frontend

1. **Cập nhật API URL trong `app.config.js`**

```javascript
app.constant('API_CONFIG', {
    BASE_URL: 'http://localhost:5257/api',  // Thay đổi port nếu cần
    // ...
});
```

2. **Mở file HTML trong browser**

Bạn có thể:
- Mở trực tiếp file HTML trong browser
- Hoặc dùng Live Server extension trong VS Code
- Hoặc host bằng http-server:

```bash
# Install http-server globally
npm install -g http-server

# Run in Frontend folder
cd Frontend
http-server -p 8080
```

### Bước 3: Test ứng dụng

1. Mở `login.html` trong browser
2. Đăng nhập với tài khoản:
   - **Admin**: `admin` / `admin123`
   - **Driver**: `driver1` / `driver123`
   - **Customer**: `customer1` / `customer123`

3. Kiểm tra Network tab trong DevTools (F12) để xem API calls

## 📦 API Endpoints có sẵn

### Người dùng (NguoiDung)
```
POST   /api/nguoidung/login              - Đăng nhập
GET    /api/nguoidung                    - Lấy tất cả người dùng
GET    /api/nguoidung/get-by-id/{id}     - Lấy người dùng theo ID
POST   /api/nguoidung/create             - Tạo người dùng mới
PUT    /api/nguoidung/update             - Cập nhật người dùng
DELETE /api/nguoidung/delete/{id}        - Xóa người dùng
```

### Đơn vận chuyển (DonVanChuyen)
```
GET    /api/donvanchuyen                 - Lấy tất cả đơn hàng
GET    /api/donvanchuyen/get-by-id/{id}  - Lấy đơn hàng theo ID
POST   /api/donvanchuyen/search          - Tìm kiếm đơn hàng
POST   /api/donvanchuyen/create          - Tạo đơn hàng mới
PUT    /api/donvanchuyen/update          - Cập nhật đơn hàng
DELETE /api/donvanchuyen/delete/{id}     - Xóa đơn hàng
```

### Tài xế (TaiXe)
```
GET    /api/taixe                        - Lấy tất cả tài xế
GET    /api/taixe/get-by-id/{id}         - Lấy tài xế theo ID
POST   /api/taixe/create                 - Tạo tài xế mới
PUT    /api/taixe/update                 - Cập nhật tài xế
DELETE /api/taixe/delete/{id}            - Xóa tài xế
```

### Tuyến đường (TuyenDuong)
```
GET    /api/tuyenduong                   - Lấy tất cả tuyến đường
GET    /api/tuyenduong/get-by-id/{id}    - Lấy tuyến đường theo ID
POST   /api/tuyenduong/create            - Tạo tuyến đường mới
PUT    /api/tuyenduong/update            - Cập nhật tuyến đường
DELETE /api/tuyenduong/delete/{id}       - Xóa tuyến đường
```

### Giao dịch COD (GiaoDichCOD)
```
GET    /api/giaodichcod                  - Lấy tất cả giao dịch COD
GET    /api/giaodichcod/get-by-id/{id}   - Lấy giao dịch COD theo ID
POST   /api/giaodichcod/create           - Tạo giao dịch COD mới
PUT    /api/giaodichcod/update           - Cập nhật giao dịch COD
DELETE /api/giaodichcod/delete/{id}      - Xóa giao dịch COD
```

## 💡 Ví dụ sử dụng API Service

### 1. Load danh sách đơn hàng
```javascript
$scope.loadOrders = function() {
    $scope.isLoading = true;
    
    apiService.getAllDonVanChuyen()
        .then(function(response) {
            $scope.orders = response;
            $scope.isLoading = false;
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Không thể tải danh sách đơn hàng!');
            $scope.isLoading = false;
        });
};
```

### 2. Tạo đơn hàng mới
```javascript
$scope.createOrder = function() {
    var orderData = {
        maNguoiGui: $scope.currentUser.userId,
        nguoiGuiHoTen: $scope.form.senderName,
        nguoiNhanHoTen: $scope.form.receiverName,
        tenHangHoa: $scope.form.productName,
        khoiLuong: parseFloat($scope.form.weight),
        phiVanChuyen: parseFloat($scope.form.fee),
        trangThai: 'pending'
    };
    
    apiService.createDonVanChuyen(orderData)
        .then(function(response) {
            alert('Tạo đơn hàng thành công!');
            $scope.loadOrders();
        })
        .catch(function(error) {
            alert('Lỗi: ' + error.data?.message);
        });
};
```

### 3. Cập nhật trạng thái đơn hàng
```javascript
$scope.updateStatus = function(order, newStatus) {
    var updateData = angular.copy(order);
    updateData.trangThai = newStatus;
    
    apiService.updateDonVanChuyen(updateData)
        .then(function(response) {
            alert('Cập nhật thành công!');
            $scope.loadOrders();
        })
        .catch(function(error) {
            alert('Lỗi: ' + error.data?.message);
        });
};
```

## 🔧 Cập nhật các trang HTML khác

Để chuyển đổi các trang HTML khác sang AngularJS:

### 1. Thêm vào `<html>` tag
```html
<html lang="vi" ng-app="logisticsApp">
```

### 2. Thêm vào `<body>` tag
```html
<body ng-controller="TenController">
```

### 3. Thêm scripts trước `</body>`
```html
<!-- AngularJS -->
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>

<!-- App Config and Services -->
<script src="app.config.js"></script>
<script src="services/api.service.js"></script>

<!-- Controllers -->
<script src="controllers/ten-controller.js"></script>
```

### 4. Sử dụng AngularJS directives trong HTML

#### Hiển thị dữ liệu
```html
<p>Xin chào, {{currentUser.fullName}}</p>
```

#### Lặp qua danh sách
```html
<tr ng-repeat="order in orders">
    <td>{{order.maDonVanChuyen}}</td>
    <td>{{order.nguoiGuiHoTen}}</td>
</tr>
```

#### Binding form
```html
<input type="text" ng-model="form.name" placeholder="Nhập tên">
```

#### Xử lý sự kiện
```html
<button ng-click="saveOrder()">Lưu</button>
```

#### Hiển thị/ẩn
```html
<div ng-show="isLoading">Đang tải...</div>
<div ng-if="orders.length > 0">Có {{orders.length}} đơn hàng</div>
```

## 🐛 Troubleshooting

### Lỗi CORS
**Triệu chứng**: Console hiển thị lỗi "CORS policy blocked"

**Giải pháp**: Thêm CORS policy vào backend (xem Bước 1)

### Lỗi kết nối API
**Triệu chứng**: Lỗi "Failed to fetch" hoặc "Network Error"

**Giải pháp**:
1. Kiểm tra backend có đang chạy không
2. Kiểm tra URL trong `app.config.js` có đúng không
3. Kiểm tra port có khớp không

### Lỗi 401 Unauthorized
**Triệu chứng**: API trả về 401 Unauthorized

**Giải pháp**:
1. Kiểm tra login có thành công không
2. Kiểm tra token có được lưu đúng không
3. Kiểm tra backend có yêu cầu authentication không

### AngularJS không hoạt động
**Triệu chứng**: `{{}}` hiển thị thay vì giá trị thực

**Giải pháp**:
1. Kiểm tra đã thêm `ng-app="logisticsApp"` chưa
2. Kiểm tra đã load AngularJS library chưa
3. Mở Console xem có lỗi JavaScript không

## 📚 Tài liệu tham khảo

- [ANGULAR_INTEGRATION_GUIDE.md](./ANGULAR_INTEGRATION_GUIDE.md) - Hướng dẫn chi tiết
- [AngularJS Documentation](https://docs.angularjs.org/)
- [ASP.NET Core Web API](https://docs.microsoft.com/en-us/aspnet/core/web-api/)

## ✅ Checklist triển khai

- [x] Tạo app.config.js
- [x] Tạo api.service.js
- [x] Tạo login.controller.js
- [x] Tạo admin controllers
- [x] Tạo customer controllers
- [x] Tạo driver controllers
- [x] Cập nhật login.html
- [x] Tạo example HTML (admin-users-angular.html)
- [ ] Cập nhật tất cả HTML files còn lại
- [ ] Test tất cả API endpoints
- [ ] Thêm error handling
- [ ] Thêm loading states
- [ ] Implement JWT authentication

## 🎓 Next Steps

1. **Cập nhật các trang HTML còn lại** theo pattern trong `admin-users-angular.html`
2. **Implement JWT authentication** trên backend
3. **Thêm validation** cho forms
4. **Implement pagination** cho danh sách lớn
5. **Thêm search và filter** nâng cao
6. **Tối ưu performance** với caching

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra Console trong DevTools (F12)
2. Kiểm tra Network tab để xem API calls
3. Đọc kỹ hướng dẫn trong ANGULAR_INTEGRATION_GUIDE.md
4. Tham khảo ví dụ trong admin-users-angular.html

---

**Tác giả**: GitHub Copilot
**Ngày tạo**: 21/11/2025
**Phiên bản**: 1.0.0
