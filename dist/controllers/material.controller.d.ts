import { MaterialService } from '../services/material.service';
import { Material } from '../models/material.model';
export declare class MaterialController {
    private readonly materialService;
    private readonly logger;
    constructor(materialService: MaterialService);
    create(createMaterialDto: Partial<Material>): Promise<Material>;
    findAll(): Promise<Material[]>;
    findLowStock(): Promise<Material[]>;
    findByCategory(category: string): Promise<Material[]>;
    findOne(id: string): Promise<Material>;
    update(id: string, updateMaterialDto: Partial<Material>): Promise<Material>;
    remove(id: string): Promise<Material>;
}
