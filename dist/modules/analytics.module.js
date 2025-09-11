"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analytics_service_1 = require("../services/analytics.service");
const material_model_1 = require("../models/material.model");
const invoice_model_1 = require("../models/invoice.model");
const stock_in_model_1 = require("../models/stock-in.model");
const user_model_1 = require("../models/user.model");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: material_model_1.Material.name, schema: material_model_1.MaterialSchema },
                { name: invoice_model_1.Invoice.name, schema: invoice_model_1.InvoiceSchema },
                { name: stock_in_model_1.StockIn.name, schema: stock_in_model_1.StockInSchema },
                { name: user_model_1.User.name, schema: user_model_1.UserSchema },
            ]),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map