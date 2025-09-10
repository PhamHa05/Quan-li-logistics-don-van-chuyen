-- Tạo database (nếu cần)
IF DB_ID('LogisticsDB') IS NULL
BEGIN
    CREATE DATABASE LogisticsDB COLLATE Vietnamese_CI_AS;
END
GO

USE LogisticsDB;
GO

-- Tạo schema riêng
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'logistics') 
    EXEC('CREATE SCHEMA logistics');
GO

/**************
Core entities: customers, users, drivers, vehicles, hubs (depots)
Shipments + shipment_items, route, route_stops, assignments, status_events, cod_transactions, webhooks, waybills
**************/

-- Khách hàng (Customer)
CREATE TABLE logistics.Customers (
    CustomerId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NULL, -- mã khách hàng bên hệ thống khách
    Name NVARCHAR(200) NOT NULL, -- Tên khách hàng (cá nhân/công ty)
    Phone NVARCHAR(50) NULL,
    Email NVARCHAR(200) NULL,
    TaxCode NVARCHAR(100) NULL, -- nếu là doanh nghiệp
    DefaultAddress NVARCHAR(400) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIMEOFFSET NULL
);
GO

-- Người dùng hệ thống (Admin, Dispatcher, CustomerUser)
CREATE TABLE logistics.Users (
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL, -- lưu hash mật khẩu
    FullName NVARCHAR(200) NULL,
    Role NVARCHAR(50) NOT NULL, -- Admin, Dispatcher, Customer
    Email NVARCHAR(200) NULL,
    Phone NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Tài xế (Drivers)
CREATE TABLE logistics.Drivers (
    DriverId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NULL,
    FullName NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(50) NULL,
    LicenseNumber NVARCHAR(100) NULL,
    VehicleId BIGINT NULL, -- xe đang gán
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Xe (Vehicles)
CREATE TABLE logistics.Vehicles (
    VehicleId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PlateNumber NVARCHAR(50) NULL,
    Type NVARCHAR(100) NULL, -- ví dụ: xe máy, xe tải 1.5T
    CapacityKg DECIMAL(10,2) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Trung tâm / kho / hub
CREATE TABLE logistics.Hubs (
    HubId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NULL,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(400) NULL,
    Phone NVARCHAR(50) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Shipment: đơn vận chuyển/đơn hàng (một shipment có thể là 1 gói hoặc nhiều kiện tùy)
CREATE TABLE logistics.Shipments (
    ShipmentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TrackingNumber NVARCHAR(100) NOT NULL UNIQUE, -- mã vận đơn duy nhất
    CustomerId BIGINT NULL, -- người gửi
    SenderName NVARCHAR(200) NULL, -- nếu không liên kết customer
    SenderPhone NVARCHAR(50) NULL,
    SenderAddress NVARCHAR(400) NULL,
    RecipientName NVARCHAR(200) NOT NULL,
    RecipientPhone NVARCHAR(50) NOT NULL,
    RecipientAddress NVARCHAR(400) NOT NULL,
    OriginHubId BIGINT NULL, -- kho/điểm gửi
    DestinationHubId BIGINT NULL, -- kho/điểm đến
    WeightKg DECIMAL(10,2) NULL,
    Volume DECIMAL(10,4) NULL,
    Pieces INT DEFAULT 1,
    PackageType NVARCHAR(100) NULL, -- loại hàng
    DeclaredValue DECIMAL(18,2) NULL, -- giá trị khai báo
    CODAmount DECIMAL(18,2) DEFAULT 0, -- tiền thu hộ
    Currency NVARCHAR(10) DEFAULT 'VND',
    Status NVARCHAR(50) NOT NULL DEFAULT 'Created', -- Created, Assigned, Picked, OutForDelivery, Delivered, Failed, Cancelled
    IsCODCollected BIT DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_Shipment_Customer FOREIGN KEY (CustomerId) REFERENCES logistics.Customers(CustomerId),
    CONSTRAINT FK_Shipment_OriginHub FOREIGN KEY (OriginHubId) REFERENCES logistics.Hubs(HubId),
    CONSTRAINT FK_Shipment_DestHub FOREIGN KEY (DestinationHubId) REFERENCES logistics.Hubs(HubId)
);
GO

-- Chi tiết kiện/hàng trong shipment (nếu cần)
CREATE TABLE logistics.ShipmentItems (
    ShipmentItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ShipmentId BIGINT NOT NULL,
    Name NVARCHAR(300) NULL, -- tên hàng (tiếng việt)
    Quantity INT DEFAULT 1,
    WeightKg DECIMAL(10,2) NULL,
    Value DECIMAL(18,2) NULL,
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_ShipmentItem_Shipment FOREIGN KEY (ShipmentId) REFERENCES logistics.Shipments(ShipmentId) ON DELETE CASCADE
);
GO

-- Route (tuyến) - một tuyến do dispatcher tạo
CREATE TABLE logistics.Routes (
    RouteId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(100) NULL,
    Name NVARCHAR(200) NULL,
    Area NVARCHAR(200) NULL,
    CreatedBy BIGINT NULL, -- UserId người tạo
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Route_User FOREIGN KEY (CreatedBy) REFERENCES logistics.Users(UserId)
);
GO

-- Route stops: điểm dừng theo thứ tự (gồm shipment gán vào một điểm dừng)
CREATE TABLE logistics.RouteStops (
    RouteStopId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RouteId BIGINT NOT NULL,
    Sequence INT NOT NULL, -- thứ tự dừng
    ShipmentId BIGINT NULL, -- shipment được giao tại stop này
    Address NVARCHAR(400) NULL,
    PlannedArrival DATETIMEOFFSET NULL,
    PlannedDeparture DATETIMEOFFSET NULL,
    ActualArrival DATETIMEOFFSET NULL,
    ActualDeparture DATETIMEOFFSET NULL,
    Status NVARCHAR(50) NULL,
    CONSTRAINT FK_RouteStop_Route FOREIGN KEY (RouteId) REFERENCES logistics.Routes(RouteId) ON DELETE CASCADE,
    CONSTRAINT FK_RouteStop_Shipment FOREIGN KEY (ShipmentId) REFERENCES logistics.Shipments(ShipmentId)
);
GO

-- Assignment: gán tuyến/tài xế/xe/ca cho dispatcher (assign)
CREATE TABLE logistics.Assignments (
    AssignmentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RouteId BIGINT NULL,
    DriverId BIGINT NULL,
    VehicleId BIGINT NULL,
    AssignedBy BIGINT NULL, -- user
    AssignedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    StartAt DATETIMEOFFSET NULL,
    EndAt DATETIMEOFFSET NULL,
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_Assign_Route FOREIGN KEY (RouteId) REFERENCES logistics.Routes(RouteId),
    CONSTRAINT FK_Assign_Driver FOREIGN KEY (DriverId) REFERENCES logistics.Drivers(DriverId),
    CONSTRAINT FK_Assign_Vehicle FOREIGN KEY (VehicleId) REFERENCES logistics.Vehicles(VehicleId),
    CONSTRAINT FK_Assign_User FOREIGN KEY (AssignedBy) REFERENCES logistics.Users(UserId)
);
GO

-- Status events: lưu lịch sử trạng thái (idempotent cập nhật trạng thái; có thể kèm ảnh/chữ ký)
CREATE TABLE logistics.StatusEvents (
    StatusEventId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ShipmentId BIGINT NOT NULL,
    EventType NVARCHAR(100) NOT NULL, -- Picked, OutForDelivery, Delivered, Failed, Returned, Cancelled
    StatusBefore NVARCHAR(50) NULL,
    StatusAfter NVARCHAR(50) NULL,
    EventTime DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    Location NVARCHAR(400) NULL,
    Note NVARCHAR(500) NULL,
    Image VARBINARY(MAX) NULL, -- ảnh/chữ ký (tùy dùng)
    Signature VARBINARY(MAX) NULL,
    CreatedBy BIGINT NULL,
    CONSTRAINT FK_StatusEvent_Shipment FOREIGN KEY (ShipmentId) REFERENCES logistics.Shipments(ShipmentId) ON DELETE CASCADE,
    CONSTRAINT FK_StatusEvent_User FOREIGN KEY (CreatedBy) REFERENCES logistics.Users(UserId)
);
GO

-- COD transactions: giao nhận và đối soát COD
CREATE TABLE logistics.CODTransactions (
    CODTransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ShipmentId BIGINT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    CollectedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    CollectedBy BIGINT NULL, -- driver or user
    IsSettled BIT DEFAULT 0, -- đã đối soát với người gửi chưa
    SettledAt DATETIMEOFFSET NULL,
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_COD_Shipment FOREIGN KEY (ShipmentId) REFERENCES logistics.Shipments(ShipmentId),
    CONSTRAINT FK_COD_User FOREIGN KEY (CollectedBy) REFERENCES logistics.Users(UserId)
);
GO

-- Waybills (phiếu vận chuyển / in ấn)
CREATE TABLE logistics.Waybills (
    WaybillId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ShipmentId BIGINT NOT NULL,
    WaybillNumber NVARCHAR(200) NOT NULL,
    GeneratedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    GeneratedBy BIGINT NULL,
    Printed BIT DEFAULT 0,
    CONSTRAINT FK_Waybill_Shipment FOREIGN KEY (ShipmentId) REFERENCES logistics.Shipments(ShipmentId)
);
GO

-- Webhooks / callbacks (lưu lịch sử callback gửi sang hệ thống khác)
CREATE TABLE logistics.Webhooks (
    WebhookId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Url NVARCHAR(1000) NOT NULL,
    Payload NVARCHAR(MAX) NOT NULL,
    AttemptedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    ResponseStatus INT NULL,
    ResponseBody NVARCHAR(MAX) NULL
);
GO

-- Events / audit (optional general-purpose audit log)
CREATE TABLE logistics.AuditLogs (
    AuditLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Entity NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    Action NVARCHAR(100) NULL,
    Data NVARCHAR(MAX) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedBy BIGINT NULL
);
GO

-- Indexes gợi ý
CREATE INDEX IDX_Shipments_Status ON logistics.Shipments(Status);
CREATE INDEX IDX_Shipments_TrackingNumber ON logistics.Shipments(TrackingNumber);
CREATE INDEX IDX_RouteStops_RouteId_Seq ON logistics.RouteStops(RouteId, Sequence);
CREATE INDEX IDX_StatusEvents_ShipmentId_EventTime ON logistics.StatusEvents(ShipmentId, EventTime);
GO


USE LogisticsDB;
GO

-- Thêm hubs
INSERT INTO logistics.Hubs (Code, Name, Address, Phone)
VALUES 
('HUB-HN-01', N'Kho Hà Nội - Văn Quán', N'Phố A, Văn Quán, Hà Đông, Hà Nội', '024-xxxxxxx'),
('HUB-HN-02', N'Kho Hà Nội - Long Biên', N'KĐT B, Long Biên, Hà Nội', '024-xxxxxxx');

-- Thêm khách hàng
INSERT INTO logistics.Customers (Code, Name, Phone, Email, DefaultAddress)
VALUES
('CUST-001', N'Công ty ABC', '0901xxxxxx', 'abc@example.com', N'80 Nguyễn Trãi, Thanh Xuân, Hà Nội'),
('CUST-002', N'Nguyễn Văn A', '0988xxxxxx', 'nva@example.com', N'12 Trần Phú, Hà Đông, Hà Nội');

-- Thêm users
INSERT INTO logistics.Users (Username, PasswordHash, FullName, Role, Email)
VALUES
('admin', 'HASHED-PW-EXAMPLE', N'Quản trị hệ thống', 'Admin', 'admin@logistics.local'),
('dispatcher1', 'HASHED-PW-EXAMPLE', N'Điều phối 1', 'Dispatcher', 'dp1@logistics.local');

-- Thêm driver và vehicle
INSERT INTO logistics.Vehicles (PlateNumber, Type, CapacityKg) VALUES ('29A-12345','Xe máy',50);
INSERT INTO logistics.Drivers (FullName, Phone, LicenseNumber, VehicleId) VALUES (N'Nguyễn Văn Tài','0912xxxxxx','GPLX-12345', 1);

-- Thêm một shipment mẫu (nội dung tiếng Việt)
INSERT INTO logistics.Shipments (TrackingNumber, CustomerId, SenderName, SenderPhone, SenderAddress, RecipientName, RecipientPhone, RecipientAddress, OriginHubId, DestinationHubId, WeightKg, Pieces, PackageType, DeclaredValue, CODAmount, Status)
VALUES 
('TNH0000001', 1, N'Công ty ABC', '0901xxxxxx', N'80 Nguyễn Trãi, Hà Nội', N'Nguyễn Văn B', '0977xxxxxx', N'55 Lương Thế Vinh, Nam Từ Liêm, Hà Nội', 1, 2, 2.5, 1, N'Hàng tiêu dùng', 500000, 150000, 'Created');

-- Thêm item cho shipment
INSERT INTO logistics.ShipmentItems (ShipmentId, Name, Quantity, WeightKg, Value, Note)
VALUES (1, N'Sản phẩm: Áo khoác nam', 1, 2.5, 400000, N'Gói cẩn thận');

-- Thêm event trạng thái
INSERT INTO logistics.StatusEvents (ShipmentId, EventType, StatusBefore, StatusAfter, EventTime, Location, Note, CreatedBy)
VALUES (1, 'Picked', 'Created', 'Picked', SYSUTCDATETIME(), N'Kho Hà Nội - Văn Quán', N'Nhân viên đã lấy hàng', 2);

-- Thêm COD transaction (chưa đối soát)
INSERT INTO logistics.CODTransactions (ShipmentId, Amount, CollectedAt, CollectedBy, IsSettled)
VALUES (1, 150000, SYSUTCDATETIME(), NULL, 0);
GO



Select * from logistics.Hubs;
Select * from logistics.Customers;
Select * from logistics.Users;
Select * from logistics.Vehicles;
Select * from logistics.Shipments;
Select * from logistics.ShipmentItems;
Select * from logistics.StatusEvents;
Select * from logistics.CODTransactions;