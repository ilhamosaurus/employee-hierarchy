import { Employee } from 'src/employee/employee.service';

export class TestHelper {
  static indirectReports0: Employee[] = [
    {
      id: 1,
      name: 'raelynn',
      managerId: null,
      directReports: [2, 3],
    },
    {
      id: 2,
      name: 'darin',
      managerId: 1,
      directReports: [4, 5, 6],
    },
    {
      id: 3,
      name: 'kacie',
      managerId: 1,
      directReports: [7, 8, 9],
    },
    {
      id: 9,
      name: 'eveleen',
      managerId: 3,
      directReports: [10],
    },
  ];
}
