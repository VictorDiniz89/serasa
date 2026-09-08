import { resourceIdsFromRequest } from './request-log.interceptor';

describe('resourceIdsFromRequest', () => {
  it('extrai producerId de GET /producers/:id', () => {
    expect(
      resourceIdsFromRequest({
        params: { id: 'prod-1' },
        route: { path: '/producers/:id' },
      }),
    ).toEqual({ producerId: 'prod-1' });
  });

  it('extrai farmId de GET /farms/:id', () => {
    expect(
      resourceIdsFromRequest({
        params: { id: 'farm-1' },
        route: { path: '/farms/:id' },
      }),
    ).toEqual({ farmId: 'farm-1' });
  });

  it('extrai producerId de POST /producers/:producerId/farms', () => {
    expect(
      resourceIdsFromRequest({
        params: { producerId: 'prod-1' },
        route: { path: '/producers/:producerId/farms' },
      }),
    ).toEqual({ producerId: 'prod-1' });
  });

  it('não trata plantio como fazenda', () => {
    expect(
      resourceIdsFromRequest({
        params: { id: 'planting-1' },
        route: { path: '/plantings/:id' },
      }),
    ).toEqual({});
  });
});
