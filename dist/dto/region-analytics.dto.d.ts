export declare class RegionAnalyticsDto {
    startDate?: string;
    endDate?: string;
}
export declare class CustomerListByRegionDto {
    region?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
}
