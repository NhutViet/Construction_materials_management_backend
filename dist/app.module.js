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
let AppModule = class AppModule {
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
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(database_config_1.databaseConfig.uri),
            mongoose_1.MongooseModule.forFeature([{ name: material_model_1.Material.name, schema: material_model_1.MaterialSchema }]),
        ],
        controllers: [app_controller_1.AppController, material_controller_1.MaterialController],
        providers: [app_service_1.AppService, material_service_1.MaterialService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map