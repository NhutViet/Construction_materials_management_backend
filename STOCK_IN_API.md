# API Nhập Hàng (Stock In) - Hướng Dẫn Sử Dụng

## Tổng Quan
API nhập hàng cho phép quản lý quá trình nhập vật liệu vào kho với các trạng thái thanh toán: "chưa thanh toán", "thanh toán một phần", "đã thanh toán".

## Luồng Hoạt Động
1. **Tạo phiếu nhập hàng**: Chọn vật liệu từ danh sách có sẵn và nhập số lượng
2. **Quản lý trạng thái**: Cập nhật trạng thái thanh toán và trạng thái phiếu nhập
3. **Tự động cập nhật kho**: Khi duyệt phiếu nhập, số lượng vật liệu sẽ được cập nhật tự động

## API Endpoints

### 1. Tạo Phiếu Nhập Hàng Mới
```http
POST /stock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "materialId": "64a1b2c3d4e5f6789012345",
      "materialName": "Xi măng PC40",
      "quantity": 100,
      "unitPrice": 85000,
      "totalPrice": 8500000,
      "unit": "bao",
      "supplier": "Công ty Xi măng Hà Tiên"
    }
  ],
  "subtotal": 8500000,
  "taxRate": 10,
  "taxAmount": 850000,
  "discountRate": 5,
  "discountAmount": 425000,
  "totalAmount": 8925000,
  "supplier": "Công ty Xi măng Hà Tiên",
  "supplierPhone": "0123456789",
  "supplierAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Nhập hàng tháng 1/2024",
  "receivedDate": "2024-01-15T00:00:00.000Z"
}
```

### 2. Lấy Danh Sách Phiếu Nhập Hàng
```http
GET /stock-in?page=1&limit=10&search=PN20240115&paymentStatus=unpaid&status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)
- `search`: Tìm kiếm theo số phiếu, nhà cung cấp, ghi chú
- `paymentStatus`: Trạng thái thanh toán (unpaid, partial, paid)
- `status`: Trạng thái phiếu nhập (pending, approved, rejected, completed)
- `supplier`: Lọc theo nhà cung cấp
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)

### 3. Lấy Danh Sách Vật Liệu Để Chọn
```http
GET /stock-in/materials
Authorization: Bearer <token>
```

### 4. Lấy Chi Tiết Phiếu Nhập Hàng
```http
GET /stock-in/{id}
Authorization: Bearer <token>
```

### 5. Cập Nhật Phiếu Nhập Hàng
```http
PUT /stock-in/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [...],
  "subtotal": 9000000,
  "totalAmount": 9450000,
  "notes": "Cập nhật ghi chú"
}
```

### 6. Cập Nhật Trạng Thái Thanh Toán
```http
PUT /stock-in/{id}/payment-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "partial",
  "paidAmount": 5000000
}
```

**Trạng thái thanh toán:**
- `unpaid`: Chưa thanh toán (paidAmount = 0)
- `partial`: Thanh toán một phần (0 < paidAmount < totalAmount)
- `paid`: Đã thanh toán (paidAmount = totalAmount)

### 7. Cập Nhật Trạng Thái Phiếu Nhập
```http
PUT /stock-in/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```

**Trạng thái phiếu nhập:**
- `pending`: Chờ duyệt
- `approved`: Đã duyệt (sẽ cập nhật số lượng kho)
- `rejected`: Từ chối
- `completed`: Hoàn thành

### 8. Xóa Phiếu Nhập Hàng
```http
DELETE /stock-in/{id}
Authorization: Bearer <token>
```

### 9. Lấy Thống Kê Phiếu Nhập Hàng
```http
GET /stock-in/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalStockIns": 25,
  "totalAmount": 500000000,
  "paidAmount": 300000000,
  "remainingAmount": 200000000,
  "unpaidCount": 10,
  "partialCount": 5,
  "paidCount": 10
}
```

## Cấu Trúc Dữ Liệu

### StockInItem
```typescript
{
  materialId: string;        // ID vật liệu
  materialName: string;      // Tên vật liệu
  quantity: number;          // Số lượng nhập
  unitPrice: number;         // Đơn giá
  totalPrice: number;        // Thành tiền
  unit: string;              // Đơn vị
  supplier?: string;         // Nhà cung cấp
}
```

### StockIn
```typescript
{
  _id: string;
  stockInNumber: string;     // Số phiếu nhập (tự động tạo)
  userId: string;            // ID người dùng
  items: StockInItem[];      // Danh sách vật liệu
  subtotal: number;          // Tổng tiền hàng
  taxRate: number;           // Thuế suất (%)
  taxAmount: number;         // Số tiền thuế
  discountRate: number;      // Tỷ lệ chiết khấu (%)
  discountAmount: number;    // Số tiền chiết khấu
  totalAmount: number;       // Tổng tiền thanh toán
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;        // Số tiền đã trả
  remainingAmount: number;   // Số tiền còn lại
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  supplier: string;          // Nhà cung cấp
  supplierPhone: string;     // SĐT nhà cung cấp
  supplierAddress: string;   // Địa chỉ nhà cung cấp
  notes: string;             // Ghi chú
  receivedDate: Date;        // Ngày nhận hàng
  createdBy: string;         // Người tạo
  approvedBy: string;        // Người duyệt
  approvedAt: Date;          // Thời gian duyệt
  createdAt: Date;
  updatedAt: Date;
}
```

## Quy Tắc Nghiệp Vụ

1. **Tạo phiếu nhập**: Chỉ có thể tạo khi có vật liệu trong hệ thống
2. **Chỉnh sửa**: Chỉ được phép khi phiếu nhập ở trạng thái `pending`
3. **Duyệt phiếu**: Khi duyệt (`approved`), số lượng vật liệu sẽ được cập nhật tự động
4. **Xóa phiếu**: Chỉ được phép khi phiếu nhập ở trạng thái `pending`
5. **Số phiếu nhập**: Tự động tạo theo format `PNYYYYMMDDXXXX` (VD: PN202401150001)

## Lưu Ý

- Tất cả API đều yêu cầu xác thực JWT
- Số phiếu nhập hàng được tạo tự động và duy nhất
- Khi duyệt phiếu nhập, hệ thống sẽ tự động cập nhật số lượng vật liệu trong kho
- Trạng thái thanh toán được tính toán tự động dựa trên `paidAmount`
- Hỗ trợ soft delete (xóa mềm) cho phiếu nhập hàng
