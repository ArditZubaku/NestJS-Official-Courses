import { Test, TestingModule } from '@nestjs/testing';
import { HttpServer, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import { IncomingHttpHeaders } from 'http';

type Headers = {
  [K in keyof IncomingHttpHeaders]: string;
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: HttpServer;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    httpServer = app.getHttpServer();
    configService = app.get<ConfigService>(ConfigService);
    await app.init();
  });

  it('/ (GET)', () => {
    const headers: Headers = {
      authorization: configService.getOrThrow('API_KEY'),
    };

    return request(httpServer)
      .get('/')
      .set(headers)
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
