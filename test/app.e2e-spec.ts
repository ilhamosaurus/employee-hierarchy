import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { Employee } from 'src/employee/employee.service';

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
    it('it should successfully upload file', async () => {
      return await pactum
        .spec()
        .post('/employee/initialize')
        .withFile('src/json/correct-employees.json')
        .expectStatus(201)
        .expectJson({ message: 'Employee data has initializes successfully' })
        .inspect();
    });

    it('it shoud return employee detail', async () => {
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
  });
});
