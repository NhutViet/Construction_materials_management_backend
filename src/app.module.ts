import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { Material, MaterialSchema } from './models/material.model';
import { MaterialService } from './services/material.service';
import { MaterialController } from './controllers/material.controller';
import { AuthModule } from './modules/auth.module';
import { InvoiceModule } from './modules/invoice.module';
import { StockInModule } from './modules/stock-in.module';
import { AnalyticsModule } from './modules/analytics.module';
import { NotificationModule } from './modules/notification.module';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.uri!),
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
    AuthModule,
    InvoiceModule,
    StockInModule,
    AnalyticsModule,
    NotificationModule,
  ],
  controllers: [AppController, MaterialController],
  providers: [AppService, MaterialService],
})
export class AppModule implements OnModuleInit {
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
    console.log('🔔 Notifications (Thông báo):');
    console.log('   • POST   /notifications - Tạo thông báo mới');
    console.log('   • GET    /notifications - Lấy danh sách thông báo');
    console.log('   • GET    /notifications/:id - Lấy thông báo theo ID');
    console.log('   • PATCH  /notifications/:id - Cập nhật thông báo');
    console.log('   • DELETE /notifications/:id - Xóa thông báo');
    console.log('   • PATCH  /notifications/:id/read - Đánh dấu đã đọc');
    console.log('   • PATCH  /notifications/:id/unread - Đánh dấu chưa đọc');
    console.log('   • PATCH  /notifications/mark-all-read - Đánh dấu tất cả đã đọc');
    console.log('   • GET    /notifications/unread-count - Đếm số thông báo chưa đọc');
    console.log('   • GET    /notifications/type/:type - Lấy thông báo theo loại');
    console.log('   • GET    /notifications/priority/:priority - Lấy thông báo theo mức độ');
    console.log('   • GET    /notifications/user/:userId - Lấy thông báo của user');
    console.log('   • GET    /notifications/system - Lấy thông báo hệ thống');
    console.log('   • GET    /notifications/auto-generated - Lấy thông báo tự động');
    console.log('   • POST   /notifications/system/broadcast - Gửi thông báo broadcast');
    console.log('   • DELETE /notifications/cleanup/expired - Dọn dẹp thông báo hết hạn');
    console.log('🌐 Server đang chạy tại: http://localhost:3000');
    console.log('⏰ Khởi động lúc:', new Date().toLocaleString('vi-VN'));
    console.log('='.repeat(60));
  }
}
