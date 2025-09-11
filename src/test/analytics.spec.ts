import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../services/analytics.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockMaterialModel: jest.Mocked<Model<any>>;
  let mockInvoiceModel: jest.Mocked<Model<any>>;
  let mockStockInModel: jest.Mocked<Model<any>>;
  let mockUserModel: jest.Mocked<Model<any>>;

  beforeEach(async () => {
    const mockModel = {
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
      find: jest.fn(),
      distinct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken('Material'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Invoice'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('StockIn'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('User'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    mockMaterialModel = module.get(getModelToken('Material'));
    mockInvoiceModel = module.get(getModelToken('Invoice'));
    mockStockInModel = module.get(getModelToken('StockIn'));
    mockUserModel = module.get(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics', async () => {
      const mockData = {
        totalRevenue: [{ total: 1000000 }],
        revenueByMonth: [],
        averageOrderValue: [{ avgOrderValue: 100000, minOrderValue: 50000, maxOrderValue: 200000 }],
        paymentMethodRevenue: []
      };

      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.totalRevenue);
      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.revenueByMonth);
      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.averageOrderValue);
      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.paymentMethodRevenue);

      const result = await service.getRevenueAnalytics('user123');

      expect(result).toBeDefined();
      expect(result.totalRevenue).toBe(1000000);
    });
  });

  describe('getInventoryAnalytics', () => {
    it('should return inventory analytics', async () => {
      const mockData = {
        inventoryOverview: [{ totalItems: 10, totalQuantity: 100, avgQuantity: 10, totalValue: 1000000 }],
        lowStockItems: [],
        topSellingMaterials: [],
        slowMovingItems: [],
        categoryAnalysis: [],
        inventoryValue: [{ total: 1000000 }]
      };

      mockMaterialModel.aggregate.mockResolvedValueOnce(mockData.inventoryOverview);
      mockMaterialModel.find.mockResolvedValueOnce(mockData.lowStockItems);
      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.topSellingMaterials);
      mockInvoiceModel.aggregate.mockResolvedValueOnce(mockData.slowMovingItems);
      mockMaterialModel.aggregate.mockResolvedValueOnce(mockData.categoryAnalysis);
      mockMaterialModel.aggregate.mockResolvedValueOnce(mockData.inventoryValue);

      const result = await service.getInventoryAnalytics('user123');

      expect(result).toBeDefined();
      expect(result.inventoryOverview.totalItems).toBe(10);
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      const mockFinancialSummary = { totalRevenue: 1000000, totalOrders: 10, averageOrderValue: 100000 };
      const mockInventorySummary = { totalItems: 10, lowStockCount: 2, totalValue: 500000 };
      const mockCustomerSummary = { totalCustomers: 5, newCustomers: 1 };
      const mockStockInSummary = { totalStockIns: 3, pendingCount: 1, totalAmount: 300000 };
      const mockAlerts = { lowStockItems: [], overdueInvoices: [], pendingStockIns: [], totalAlerts: 0 };

      // Mock all the aggregate calls
      mockInvoiceModel.aggregate.mockResolvedValue([{ total: 1000000 }]);
      mockInvoiceModel.countDocuments.mockResolvedValue(10);
      mockInvoiceModel.aggregate.mockResolvedValue([{ avg: 100000 }]);
      mockMaterialModel.countDocuments.mockResolvedValue(10);
      mockMaterialModel.countDocuments.mockResolvedValue(2);
      mockMaterialModel.aggregate.mockResolvedValue([{ total: 500000 }]);
      mockInvoiceModel.distinct.mockResolvedValue(['customer1', 'customer2']);
      mockStockInModel.countDocuments.mockResolvedValue(3);
      mockStockInModel.countDocuments.mockResolvedValue(1);
      mockStockInModel.aggregate.mockResolvedValue([{ total: 300000 }]);
      mockMaterialModel.find.mockResolvedValue([]);
      mockInvoiceModel.find.mockResolvedValue([]);
      mockStockInModel.find.mockResolvedValue([]);

      const result = await service.getDashboardData('user123');

      expect(result).toBeDefined();
      expect(result.financialSummary).toBeDefined();
      expect(result.inventorySummary).toBeDefined();
      expect(result.customerSummary).toBeDefined();
      expect(result.stockInSummary).toBeDefined();
      expect(result.alerts).toBeDefined();
    });
  });
});
