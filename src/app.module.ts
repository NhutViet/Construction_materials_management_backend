import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { Material, MaterialSchema } from './models/material.model';
import { MaterialService } from './services/material.service';
import { MaterialController } from './controllers/material.controller';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.uri!),
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
  ],
  controllers: [AppController, MaterialController],
  providers: [AppService, MaterialService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log('🚀 Construction Materials Management Backend đã khởi động!');
    console.log('📝 API Endpoints:');
    console.log('   • GET    / - Main app');
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
