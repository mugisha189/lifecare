import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { QueryPlatformAnalyticsDto } from './dto/query-platform-analytics.dto';

@Controller('analytics')
@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST', 'LABORATORY_STAFF')
  @ApiOperation({ summary: 'Get platform analytics (Admin: all data, Others: own data)' })
  @ApiQuery({ name: 'period', required: false, enum: ['TODAY', 'WEEK', 'MONTH', 'YEAR', 'CUSTOM'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Platform analytics retrieved successfully',
  })
  async getPlatformAnalytics(
    @Query() query: QueryPlatformAnalyticsDto,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.analyticsService.getPlatformAnalytics(query, userId);
    return {
      ok: true,
      message: 'Platform analytics retrieved successfully',
      data,
    };
  }
}
