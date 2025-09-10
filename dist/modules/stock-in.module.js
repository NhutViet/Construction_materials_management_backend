"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockInModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const stock_in_controller_1 = require("../controllers/stock-in.controller");
const stock_in_service_1 = require("../services/stock-in.service");
const stock_in_model_1 = require("../models/stock-in.model");
const material_model_1 = require("../models/material.model");
let StockInModule = class StockInModule {
};
exports.StockInModule = StockInModule;
exports.StockInModule = StockInModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: stock_in_model_1.StockIn.name, schema: stock_in_model_1.StockInSchema },
                { name: material_model_1.Material.name, schema: material_model_1.MaterialSchema },
            ]),
        ],
        controllers: [stock_in_controller_1.StockInController],
        providers: [stock_in_service_1.StockInService],
        exports: [stock_in_service_1.StockInService],
    })
], StockInModule);
//# sourceMappingURL=stock-in.module.js.map