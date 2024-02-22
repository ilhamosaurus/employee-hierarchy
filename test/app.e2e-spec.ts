import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { Employee } from 'src/employee/employee.service';
import { TestHelper } from './test_helper';

describe('Test case e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(3123);

    pactum.request.setBaseUrl('http://localhost:3123');
  });

  afterAll(() => {
    app.close();
  });

  describe('correct-employee.json test', () => {
    it('Should successfully upload a file', async () => {
      return await pactum
        .spec()
        .post('/employee/initialize')
        .withFile('src/json/correct-employees.json')
        .expectStatus(201)
        .expectJson({ message: 'Employee data has initializes successfully' })
        .inspect();
    });

    it('Should return employee detail', async () => {
      const expectedOutcome: Employee = {
        id: 2,
        name: 'darin',
        managerId: 1,
        directReports: [4, 5, 6],
      };

      return await pactum
        .spec()
        .get(`/employee/${expectedOutcome.id}`)
        .expectStatus(200)
        .expectJsonMatch(expectedOutcome)
        .inspect();
    });

    it('Should return employee managers hierarchy detail', async () => {
      const employee: Employee = {
        id: 4,
        name: 'jordana',
        managerId: 2,
      };

      const expectedOutcome: Employee[] = [
        {
          id: 2,
          name: 'darin',
          managerId: 1,
          directReports: [4, 5, 6],
        },
        {
          id: 1,
          name: 'raelynn',
          managerId: null,
          directReports: [2, 3],
        },
      ];

      return await pactum
        .spec()
        .get(`/employee/${employee.id}/managers`)
        .expectStatus(200)
        .expectJsonMatch(expectedOutcome)
        .inspect();
    });

    it('Should return employee directs reports count', async () => {
      const employee: Employee = {
        id: 1,
        name: 'raelynn',
        managerId: null,
        directReports: [2, 3],
      };

      const expectedOutcome: object = {
        message: `${employee.name} has ${employee.directReports.length} direct reports`,
      };

      return await pactum
        .spec()
        .get(`/employee/${employee.id}/direct-reports-count`)
        .expectStatus(200)
        .expectJsonMatch(expectedOutcome)
        .inspect();
    });

    it('Should return employee indirect reports count', async () => {
      const employees: Employee[] = TestHelper.indirectReports0;

      const count: number = employees.reduce(
        (accumulator, employee) =>
          accumulator + (employee.directReports?.length || 0),
        0,
      );

      const expectedOutcome: object = {
        message: `${employees[0].name} has ${count} indirect reports`,
      };

      return await pactum
        .spec()
        .get(`/employee/${employees[0].id}/indirect-reports-count`)
        .expectStatus(200)
        .expectJsonMatch(expectedOutcome)
        .inspect();
    });

    it('Should not return employee managers hierarchy', async () => {
      const employee: Employee = {
        id: 1,
        name: 'raelynn',
        managerId: null,
        directReports: [2, 3],
      };

      const expectedOutcome: object = {
        message: 'This employee does not have a manager',
      };

      return await pactum
        .spec()
        .get(`/employee/${employee.id}/managers`)
        .expectStatus(404)
        .expectJsonMatch(expectedOutcome)
        .inspect();
    });
  });
});
