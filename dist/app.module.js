"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = require("./config/database.config");
const material_model_1 = require("./models/material.model");
const material_service_1 = require("./services/material.service");
const material_controller_1 = require("./controllers/material.controller");
const auth_module_1 = require("./modules/auth.module");
const invoice_module_1 = require("./modules/invoice.module");
const stock_in_module_1 = require("./modules/stock-in.module");
const analytics_module_1 = require("./modules/analytics.module");
let AppModule = class AppModule {
    onModuleInit() {
        console.log('🚀 Construction Materials Management Backend đã khởi động!');
        console.log('📝 API Endpoints:');
        console.log('🔐 Authentication:');
        console.log('   • POST   /auth/register - Đăng ký tài khoản mới (username, password, fullname)');
        console.log('   • POST   /auth/login - Đăng nhập (username, password)');
        console.log('📦 Materials:');
        console.log('   • POST   /materials - Tạo vật liệu mới');
        console.log('   • GET    /materials - Lấy danh sách vật liệu');
        console.log('   • GET    /materials/:id - Lấy vật liệu theo ID');
        console.log('   • PATCH  /materials/:id - Cập nhật vật liệu');
        console.log('   • DELETE /materials/:id - Xóa vật liệu');
        console.log('   • GET    /materials/low-stock - Vật liệu sắp hết');
        console.log('   • GET    /materials/category/:category - Vật liệu theo danh mục');
        console.log('🧾 Invoices:');
        console.log('   • POST   /invoices - Tạo hoá đơn mới');
        console.log('   • GET    /invoices - Lấy danh sách hoá đơn');
        console.log('   • GET    /invoices/:id - Lấy hoá đơn theo ID');
        console.log('   • PATCH  /invoices/:id - Cập nhật hoá đơn');
        console.log('   • DELETE /invoices/:id - Xóa hoá đơn');
        console.log('   • GET    /invoices/statistics - Thống kê hoá đơn');
        console.log('   • GET    /invoices/pending - Hoá đơn chờ xử lý');
        console.log('   • GET    /invoices/confirmed - Hoá đơn đã xác nhận');
        console.log('   • GET    /invoices/delivered - Hoá đơn đã giao');
        console.log('   • GET    /invoices/unpaid - Hoá đơn chưa thanh toán');
        console.log('   • GET    /invoices/paid - Hoá đơn đã thanh toán');
        console.log('   • PATCH  /invoices/:id/status - Cập nhật trạng thái');
        console.log('   • PATCH  /invoices/:id/payment-status - Cập nhật trạng thái thanh toán');
        console.log('📥 Stock In (Nhập hàng):');
        console.log('   • POST   /stock-in - Tạo phiếu nhập hàng mới');
        console.log('   • GET    /stock-in - Lấy danh sách phiếu nhập hàng');
        console.log('   • GET    /stock-in/:id - Lấy phiếu nhập hàng theo ID');
        console.log('   • PUT    /stock-in/:id - Cập nhật phiếu nhập hàng');
        console.log('   • DELETE /stock-in/:id - Xóa phiếu nhập hàng');
        console.log('   • GET    /stock-in/materials - Lấy danh sách vật liệu để chọn');
        console.log('   • GET    /stock-in/stats - Thống kê phiếu nhập hàng');
        console.log('   • PUT    /stock-in/:id/payment-status - Cập nhật trạng thái thanh toán');
        console.log('   • PUT    /stock-in/:id/status - Cập nhật trạng thái phiếu nhập');
        console.log('📊 Analytics (Thống kê & Phân tích):');
        console.log('   • GET    /analytics/dashboard - Dashboard tổng hợp');
        console.log('   • GET    /analytics/revenue - Thống kê doanh thu');
        console.log('   • GET    /analytics/payments - Thống kê thanh toán');
        console.log('   • GET    /analytics/inventory - Thống kê tồn kho');
        console.log('   • GET    /analytics/customers - Thống kê khách hàng');
        console.log('   • GET    /analytics/customers/list - Danh sách khách hàng chi tiết');
        console.log('   • GET    /analytics/stock-in - Thống kê nhập hàng');
        console.log('   • GET    /analytics/trends - Thống kê xu hướng');
        console.log('   • GET    /analytics/quick-stats - Thống kê nhanh');
        console.log('   • GET    /analytics/alerts - Cảnh báo hệ thống');
        console.log('   • GET    /analytics/reports/* - Báo cáo chi tiết');
        console.log('🌐 Server đang chạy tại: http://localhost:3000');
        console.log('⏰ Khởi động lúc:', new Date().toLocaleString('vi-VN'));
        console.log('='.repeat(60));
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(database_config_1.databaseConfig.uri),
            mongoose_1.MongooseModule.forFeature([{ name: material_model_1.Material.name, schema: material_model_1.MaterialSchema }]),
            auth_module_1.AuthModule,
            invoice_module_1.InvoiceModule,
            stock_in_module_1.StockInModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController, material_controller_1.MaterialController],
        providers: [app_service_1.AppService, material_service_1.MaterialService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map