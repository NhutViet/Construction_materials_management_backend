import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';

export class RegionAnalyticsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CustomerListByRegionDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsIn(['customerCount', 'totalRevenue', 'totalOrders'])
  sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
