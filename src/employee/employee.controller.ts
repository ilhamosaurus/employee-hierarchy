import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Employee, EmployeeService } from './employee.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':id')
  getEmployee(@Param('id') id: string): Employee {
    const employeeId = parseInt(id, 10);
    const employee = this.employeeService.getEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  @Get(':id/managers')
  getManagersHierarchy(@Param('id') id: string): Employee[] {
    const employeeId = parseInt(id, 10);
    return this.employeeService.getManagersHierarchy(employeeId);
  }

  @Get(':id/direct-reports-count')
  getDirectReportsCount(@Param('id') id: string): number {
    const employeeId = parseInt(id, 10);
    return this.employeeService.getDirectReportsCount(employeeId);
  }

  @Get(':id/indirect-reports-count')
  getIndirectReportsCount(@Param('id') id: string): number {
    const employeeId = parseInt(id, 10);
    return this.employeeService.getIndirectReportsCount(employeeId);
  }

  @Post('initialize')
  @UseInterceptors(FileInterceptor('file'))
  async initializeEmployees(@UploadedFile() file: Express.Multer.File) {
    const data: Employee[] = await JSON.parse(file.buffer.toString());
    this.employeeService.initializeEmployees(data);
    return { message: 'Employee data has initializes successfully' };
  }
}
