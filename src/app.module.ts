import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { Material, MaterialSchema } from './models/material.model';
import { MaterialService } from './services/material.service';
import { MaterialController } from './controllers/material.controller';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.uri!),
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
    AuthModule,
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
    console.log('🌐 Server đang chạy tại: http://localhost:3000');
    console.log('⏰ Khởi động lúc:', new Date().toLocaleString('vi-VN'));
    console.log('='.repeat(60));
  }
}
