import { configureApp } from './configure-app';

describe('configureApp', () => {
  it('habilita CORS para o Vite em localhost:5173', () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      enableCors: jest.fn(),
    };

    configureApp(app as never);

    expect(app.enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:5173',
    });
  });
});
