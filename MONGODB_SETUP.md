# Hướng dẫn thiết lập MongoDB cho Construction Materials Management Backend

## Yêu cầu hệ thống

- Node.js (v18+)
- MongoDB (v5+)
- NestJS CLI

## Cài đặt MongoDB

### 1. Cài đặt MongoDB trên macOS (sử dụng Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### 2. Khởi động MongoDB service
```bash
brew services start mongodb/brew/mongodb-community
```

### 3. Kiểm tra MongoDB đang chạy
```bash
mongosh
# hoặc
mongo
```

## Cấu hình ứng dụng

### 1. Tạo file .env (nếu cần)
```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/construction_materials_db

# App Configuration
PORT=3000
NODE_ENV=development
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy ứng dụng
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## Cấu trúc dự án

```
src/
├── config/
│   └── database.config.ts    # Cấu hình kết nối MongoDB
├── models/
│   └── material.model.ts     # Schema MongoDB cho vật liệu
├── services/
│   └── material.service.ts   # Logic nghiệp vụ
├── controllers/
│   └── material.controller.ts # Xử lý HTTP requests
└── app.module.ts             # Module chính với MongoDB connection
```

## API Endpoints

### Materials API

- `POST /materials` - Tạo vật liệu mới
- `GET /materials` - Lấy danh sách tất cả vật liệu
- `GET /materials/:id` - Lấy thông tin vật liệu theo ID
- `PATCH /materials/:id` - Cập nhật vật liệu
- `DELETE /materials/:id` - Xóa vật liệu (soft delete)
- `GET /materials/low-stock` - Lấy danh sách vật liệu sắp hết
- `GET /materials/category/:category` - Lấy vật liệu theo danh mục

## Ví dụ sử dụng

### Tạo vật liệu mới
```bash
curl -X POST http://localhost:3000/materials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Xi măng Hà Tiên",
    "category": "Xi măng",
    "unit": "Bao",
    "quantity": 100,
    "price": 85000,
    "description": "Xi măng Portland PCB40",
    "supplier": "Vicem Hà Tiên"
  }'
```

### Lấy danh sách vật liệu
```bash
curl http://localhost:3000/materials
```

## Kiểm tra kết nối MongoDB

Khi ứng dụng khởi động thành công, bạn sẽ thấy log:
```
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [MongooseModule] MongoDB connection established
```

## Troubleshooting

### Lỗi kết nối MongoDB
1. Kiểm tra MongoDB service có đang chạy không
2. Kiểm tra connection string trong file cấu hình
3. Kiểm tra firewall và network settings

### Lỗi Schema validation
1. Kiểm tra các trường required trong model
2. Kiểm tra kiểu dữ liệu của các trường
3. Kiểm tra các validation rules

## Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
