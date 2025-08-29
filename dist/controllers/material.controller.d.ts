import { MaterialService } from '../services/material.service';
import { Material } from '../models/material.model';
export declare class MaterialController {
    private readonly materialService;
    private readonly logger;
    constructor(materialService: MaterialService);
    create(createMaterialDto: Partial<Material>, user: any): Promise<Material>;
    findAll(user: any): Promise<Material[]>;
    findLowStock(user: any): Promise<Material[]>;
    findByCategory(category: string, user: any): Promise<Material[]>;
    findOne(id: string, user: any): Promise<Material>;
    update(id: string, updateMaterialDto: Partial<Material>, user: any): Promise<Material>;
    remove(id: string, user: any): Promise<Material>;
}
