# Hệ thống Quản lý Logistics - Hướng dẫn sử dụng

## Giới thiệu
Hệ thống quản lý vận chuyển và logistics với phân quyền đầy đủ cho 3 vai trò: Admin, Tài xế và Khách hàng.

## Cấu trúc dự án
```
Frontend/
├── login.html              # Trang đăng nhập chung
├── login-style.css         # Style cho trang đăng nhập
├── login.js                # Logic xử lý đăng nhập và phân quyền
├── index.html              # Dashboard Admin
├── index-driver.html       # Dashboard Tài xế
├── index-customer.html     # Dashboard Khách hàng
├── style.css               # Style chung
├── driver-style.css        # Style riêng cho tài xế
├── customer-style.css      # Style riêng cho khách hàng
├── script.js               # Logic cho Admin
├── driver-script.js        # Logic cho Tài xế
├── customer-script.js      # Logic cho Khách hàng
└── README.md               # File hướng dẫn
```

## Tính năng theo vai trò

### 🔐 1. ADMIN (Quản trị viên)
**Tài khoản:** `admin` / `admin123`

**Quyền hạn:**
- ✅ Xem tổng quan toàn bộ hệ thống
- ✅ Quản lý tất cả đơn hàng
- ✅ Tạo và phân công đơn hàng cho tài xế
- ✅ Quản lý tuyến đường
- ✅ Quản lý tài xế và khách hàng
- ✅ Xem báo cáo và thống kê
- ✅ Cài đặt hệ thống

**Quy trình nghiệp vụ:**
1. Đăng nhập vào hệ thống
2. Xem dashboard với thống kê tổng quan
3. Tiếp nhận đơn hàng từ khách hàng
4. Phân công tài xế cho các đơn hàng
5. Tối ưu và quản lý tuyến đường
6. Theo dõi tiến độ giao hàng
7. Quản lý COD và thanh toán
8. Tạo báo cáo định kỳ

### 🚚 2. TÀI XẾ (Giao nhận viên)
**Tài khoản demo:**
- `driver1` / `driver123` (Trần Văn Tài - Xe 29A-12345)
- `driver2` / `driver123` (Lê Thị Hoa - Xe 30B-67890)

**Quyền hạn:**
- ✅ Xem đơn hàng được phân công
- ✅ Cập nhật trạng thái đơn hàng (Đã lấy hàng, Đang giao, Đã giao, Thất bại)
- ✅ Xem tuyến đường được giao
- ✅ Tối ưu tuyến đường của mình
- ✅ Quản lý COD đã thu
- ✅ Báo cáo vấn đề giao hàng

**Quy trình nghiệp vụ:**
1. Đăng nhập vào hệ thống tài xế
2. Xem danh sách đơn hàng được phân công
3. Xem tuyến đường tối ưu cho ngày hôm nay
4. Đến kho/điểm lấy hàng và cập nhật "Đã lấy hàng"
5. Di chuyển theo tuyến đường, cập nhật "Đang giao" cho từng đơn
6. Khi giao thành công:
   - Thu COD (nếu có)
   - Chụp ảnh bằng chứng
   - Cập nhật "Đã giao"
7. Nếu giao thất bại:
   - Cập nhật "Giao thất bại"
   - Ghi rõ lý do
8. Cuối ngày: Nộp COD đã thu
9. Xem lịch sử và thống kê cá nhân

### 👥 3. KHÁCH HÀNG
**Tài khoản demo:**
- `customer1` / `customer123` (Phạm Thị Lan)
- `customer2` / `customer123` (Hoàng Văn Nam)

**Quyền hạn:**
- ✅ Tạo đơn hàng mới
- ✅ Xem danh sách đơn hàng của mình
- ✅ Tra cứu và theo dõi vận đơn
- ✅ Hủy đơn hàng (trước khi lấy hàng)
- ✅ Đặt lại đơn hàng cũ
- ✅ Xem lịch sử thanh toán
- ✅ Liên hệ hỗ trợ

**Quy trình nghiệp vụ:**
1. Đăng nhập vào hệ thống khách hàng
2. Tạo đơn hàng mới:
   - Điền thông tin người gửi (tự động điền từ profile)
   - Điền thông tin người nhận
   - Nhập thông tin hàng hóa (loại, khối lượng)
   - Nhập số tiền COD (nếu có)
   - Chọn dịch vụ bổ sung (bảo hiểm, giao nhanh, hàng dễ vỡ)
   - Hệ thống tự động tính phí vận chuyển
   - Xác nhận tạo đơn
3. Nhận mã vận đơn qua email/SMS
4. Theo dõi đơn hàng:
   - Xem trạng thái real-time
   - Xem vị trí tài xế (nếu đang giao)
   - Xem timeline chi tiết
5. Khi nhận hàng thành công:
   - Xác nhận đã nhận
   - Đánh giá dịch vụ
6. Xem lịch sử và quản lý chi phí

## Tài khoản demo chi tiết

### Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Tên:** Nguyễn Văn Admin
- **Email:** admin@logistics.com
- **Quyền:** Quản trị viên toàn quyền

### Tài xế
**Tài xế 1:**
- **Username:** `driver1`
- **Password:** `driver123`
- **Tên:** Trần Văn Tài
- **SĐT:** 0912345678
- **Biển số xe:** 29A-12345
- **GPLX:** B2-123456

**Tài xế 2:**
- **Username:** `driver2`
- **Password:** `driver123`
- **Tên:** Lê Thị Hoa
- **SĐT:** 0923456789
- **Biển số xe:** 30B-67890
- **GPLX:** B2-789012

### Khách hàng
**Khách hàng 1:**
- **Username:** `customer1`
- **Password:** `customer123`
- **Tên:** Phạm Thị Lan
- **SĐT:** 0934567890
- **Địa chỉ:** 123 Nguyễn Huệ, Q1, TP.HCM

**Khách hàng 2:**
- **Username:** `customer2`
- **Password:** `customer123`
- **Tên:** Hoàng Văn Nam
- **SĐT:** 0945678901
- **Địa chỉ:** 456 Lê Lợi, Q1, TP.HCM

## Hướng dẫn cài đặt

### Cách 1: Chạy trực tiếp
1. Mở file `login.html` bằng trình duyệt web
2. Đăng nhập bằng một trong các tài khoản demo ở trên
3. Hệ thống sẽ tự động chuyển đến trang tương ứng với vai trò

### Cách 2: Sử dụng Live Server (Khuyến nghị)
1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào file `login.html`
3. Chọn "Open with Live Server"
4. Trình duyệt sẽ tự động mở trang đăng nhập

## Luồng phân quyền

```
                    ┌─────────────┐
                    │  login.html │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Đăng nhập   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────▼─────┐  ┌────▼────┐  ┌──────▼──────┐
      │   Admin   │  │  Driver │  │  Customer   │
      │ index.html│  │  index- │  │  index-     │
      │           │  │ driver  │  │  customer   │
      └───────────┘  └─────────┘  └─────────────┘
```

### Bảo vệ routes
- Mỗi trang tự động kiểm tra role khi load
- Nếu role không khớp → chuyển về trang đúng role
- Nếu chưa đăng nhập → chuyển về login

## Tính năng nổi bật

### 🔒 Bảo mật
- ✅ Session management với sessionStorage/localStorage
- ✅ Role-based access control (RBAC)
- ✅ Auto redirect theo quyền
- ✅ Protected routes
- ✅ Logout an toàn

### 📱 Giao diện
- ✅ Responsive design
- ✅ Material design inspired
- ✅ Icon Font Awesome
- ✅ Smooth animations
- ✅ Gradient backgrounds
- ✅ Card-based layout

### 💼 Nghiệp vụ
- ✅ Quy trình rõ ràng cho từng vai trò
- ✅ Workflow logistics chuẩn
- ✅ Tối ưu tuyến đường
- ✅ Quản lý COD
- ✅ Tracking real-time
- ✅ Timeline chi tiết

## Kịch bản test

### Test case 1: Đăng nhập và phân quyền
1. Đăng nhập với `admin` → Vào trang admin
2. Đăng xuất
3. Đăng nhập với `driver1` → Vào trang tài xế
4. Đăng xuất
5. Đăng nhập với `customer1` → Vào trang khách hàng

### Test case 2: Quy trình đơn hàng (Khách hàng)
1. Đăng nhập `customer1`
2. Tạo đơn hàng mới
3. Điền đầy đủ thông tin
4. Xác nhận tạo đơn
5. Nhận mã vận đơn
6. Tra cứu đơn hàng
7. Xem timeline

### Test case 3: Giao hàng (Tài xế)
1. Đăng nhập `driver1`
2. Xem danh sách đơn hàng
3. Xem tuyến đường
4. Cập nhật "Đã lấy hàng"
5. Cập nhật "Đang giao"
6. Cập nhật "Đã giao"
7. Quản lý COD
8. Nộp COD

### Test case 4: Quản lý (Admin)
1. Đăng nhập `admin`
2. Xem dashboard tổng quan
3. Xem tất cả đơn hàng
4. Phân công tài xế
5. Quản lý tuyến đường
6. Xem báo cáo COD

## Mở rộng

### Kết nối Backend
Chỉnh sửa các file `*-script.js` để kết nối API:

```javascript
// Ví dụ trong customer-script.js
async function handleCreateOrder(formData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Thêm tính năng
- GPS tracking real-time
- Push notification
- Chat với tài xế
- Đánh giá và review
- Báo cáo thống kê nâng cao
- Export Excel/PDF
- In phiếu giao hàng
- QR code scanning

## Khắc phục sự cố

### Không đăng nhập được
- Kiểm tra username/password chính xác
- Xóa cache và cookies
- Mở Developer Tools (F12) xem lỗi

### Bị redirect sai trang
- Xóa sessionStorage/localStorage
- Hard refresh (Ctrl + F5)
- Đăng nhập lại

### Không hiển thị đúng
- Kiểm tra đã load đủ CSS files
- Kiểm tra đường dẫn file
- Sử dụng Live Server thay vì mở file trực tiếp

## Lưu ý quan trọng

⚠️ **Đây là phiên bản DEMO cho mục đích học tập**

Trước khi triển khai production cần:
1. ✅ Hash password (bcrypt)
2. ✅ Sử dụng JWT token
3. ✅ HTTPS bắt buộc
4. ✅ Rate limiting
5. ✅ CSRF protection
6. ✅ XSS prevention
7. ✅ SQL injection protection
8. ✅ Backend validation
9. ✅ Error handling
10. ✅ Logging và monitoring

## Support

- **Hotline:** 1900-xxxx
- **Email:** support@logistics.com
- **Website:** www.logistics.com

## License
MIT License - Free for learning and development

## Tác giả
Phát triển bởi AI Assistant - November 2025
