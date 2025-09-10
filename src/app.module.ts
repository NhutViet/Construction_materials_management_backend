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

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.uri!),
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
    AuthModule,
    InvoiceModule,
    StockInModule,
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
    console.log('🌐 Server đang chạy tại: http://localhost:3000');
    console.log('⏰ Khởi động lúc:', new Date().toLocaleString('vi-VN'));
    console.log('='.repeat(60));
  }
}
