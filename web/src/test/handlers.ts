import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/dashboard', () =>
    HttpResponse.json({
      totalFarms: 0,
      totalHectares: 0,
      farmsByState: [],
      cropsPlanted: [],
      landUse: { arableHectares: 0, vegetationHectares: 0 },
    }),
  ),
];
