import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';
export declare class MaterialService {
    private materialModel;
    constructor(materialModel: Model<MaterialDocument>);
    create(createMaterialDto: Partial<Material>, userId: string): Promise<Material>;
    findAll(userId: string): Promise<Material[]>;
    findOne(id: string, userId: string): Promise<Material>;
    update(id: string, updateMaterialDto: Partial<Material>, userId: string): Promise<Material>;
    remove(id: string, userId: string): Promise<Material>;
    findByCategory(category: string, userId: string): Promise<Material[]>;
    findLowStock(threshold: number | undefined, userId: string): Promise<Material[]>;
    findAllForAdmin(): Promise<Material[]>;
}
