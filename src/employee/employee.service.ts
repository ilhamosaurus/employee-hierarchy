import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class EmployeeService {
  private employees: Map<number, Employee> = new Map();
  constructor() {}

  initializeEmployees(data: Employee[]) {
    this.employees.clear();
    data.forEach((employee) => {
      this.employees.set(employee.id, { ...employee, directReports: [] });
      if (employee.managerId !== null) {
        const manager = this.employees.get(employee.managerId);
        if (manager) {
          manager.directReports.push(employee.id);
        }
      }
    });
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employees.get(id);
  }

  getManagersHierarchy(id: number): Employee[] {
    const employee = this.getEmployeeById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const managersHierarchy: Employee[] = [];
    this.traverseManagersHierarchy(employee, managersHierarchy);
    return managersHierarchy;
  }

  private traverseManagersHierarchy(employee: Employee, hierarchy: Empoyee[]) {
    if (employee.managerId !== null) {
      const manager = this.getEmployeeById(employee.managerId);
      if (manager) {
        hierarchy.push(manager);
        this.traverseManagersHierarchy(manager, hierarchy);
      }
    }
  }

  getDirectReportsCount(id: number): number {
    const employee = this.getEmployeeById(id);
    return employee ? employee.directReports.length : 0;
  }

  getIndirectReportsCount(id: number): number {
    const employee = this.getEmployeeById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let count = 0;
    this.traverseIndirectReports(employee, (report) => count++);
    return count;
  }

  private traverseIndirectReports(
    employee: Employee,
    callback: (employee: Employee) => void,
  ) {
    employee.directReports.forEach((reportId) => {
      const report = this.getEmployeeById(reportId);
      if (report) {
        callback(report);
        this.traverseIndirectReports(report, callback);
      }
    });
  }
}

export interface Employee {
  id: number;
  name: string;
  managerId?: number | null;
  directReports?: number[];
}
