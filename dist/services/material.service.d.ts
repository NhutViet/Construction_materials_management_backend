import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';
export declare class MaterialService {
    private materialModel;
    constructor(materialModel: Model<MaterialDocument>);
    create(createMaterialDto: Partial<Material>): Promise<Material>;
    findAll(): Promise<Material[]>;
    findOne(id: string): Promise<Material>;
    update(id: string, updateMaterialDto: Partial<Material>): Promise<Material>;
    remove(id: string): Promise<Material>;
    findByCategory(category: string): Promise<Material[]>;
    findLowStock(threshold?: number): Promise<Material[]>;
}
