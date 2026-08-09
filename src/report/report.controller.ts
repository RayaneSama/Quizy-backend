import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateReportStatusDto } from './dto/update-report.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.reportService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportService.updateStatus(reportId, dto.status);
  }

  @Post(':questionId')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('questionId') questionId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportService.create(user.sub, questionId, dto.reason);
  }

  @Get('my')
  findMyReports(@CurrentUser() user: JwtPayload) {
    return this.reportService.findMyReports(user.sub);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') reportId: string) {
    return this.reportService.remove(user.sub, reportId);
  }
}
