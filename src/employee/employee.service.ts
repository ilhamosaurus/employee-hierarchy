import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class EmployeeService {
  private employees: Map<number, Employee> = new Map();
  private faultyEmployees: Map<number, Employee> = new Map(); // Added map to track faulty employees

  constructor() {}

  initializeEmployees(data: Employee[]) {
    this.employees.clear();
    this.faultyEmployees.clear(); // Clear faulty employees map
    data.forEach((employee) => {
      if (this.employees.has(employee.id)) {
        // Check for duplicate employees
        throw new BadRequestException(`Duplicate employee ${employee.name}`);
      }

      this.employees.set(employee.id, { ...employee, directReports: [] });

      if (employee.managerId !== null) {
        const manager = this.employees.get(employee.managerId);
        if (manager) {
          manager.directReports.push(employee.id);
        } else {
          // If manager is not found, mark employee as faulty
          this.faultyEmployees.set(employee.id, employee);
        }
      }
    });

    // Check for employees with multiple managers
    this.checkMultipleManagers();
  }

  private checkMultipleManagers() {
    this.faultyEmployees.forEach((employee) => {
      const manager = this.getEmployeeById(employee.managerId);
      if (manager) {
        throw new Error(
          `Unable to process employee tree. ${employee.name} has multiple managers: ${manager.name}, ${employee.name}`,
        );
      }
    });
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employees.get(id);
  }

  private traverseManagersHierarchy(employee: Employee, hierarchy: Employee[]) {
    if (employee.managerId !== null) {
      const manager = this.getEmployeeById(employee.managerId);
      if (manager) {
        hierarchy.push(manager);
        this.traverseManagersHierarchy(manager, hierarchy);
      }
    }
  }

  getManagersHierarchy(id: number): Employee[] {
    const employee = this.getEmployeeById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    } else if (employee.managerId === null) {
      throw new NotFoundException('This employee does not have a manager');
    }

    const managersHierarchy: Employee[] = [];
    this.traverseManagersHierarchy(employee, managersHierarchy);
    return managersHierarchy;
  }

  getDirectReportsCount(id: number): object {
    const employee = this.getEmployeeById(id);
    const count = employee ? employee.directReports.length : 0;

    return { message: `${employee.name} has ${count} direct reports` };
  }

  getIndirectReportsCount(id: number): object {
    const employee = this.getEmployeeById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let count = 0;
    this.traverseIndirectReports(employee, (report) => count++);
    return { message: `${employee.name} has ${count} indirect reports` };
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
