import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Producer = {
  id: string;
  name: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
};

export type FarmSummary = {
  id: string;
  name: string;
  city: string;
  state: string;
  totalAreaHa: number;
  arableAreaHa: number;
  vegetationAreaHa: number;
};

export type ProducerWithFarms = Producer & { farms: FarmSummary[] };

export type ProducerList = {
  data: Producer[];
  meta: { page: number; limit: number; total: number };
};

export type FarmDetail = FarmSummary & {
  producerId: string;
  plantings: { id: string; harvestName: string; cropName: string }[];
};

export type Dashboard = {
  totalFarms: number;
  totalHectares: number;
  farmsByState: { state: string; count: number }[];
  cropsPlanted: { crop: string; count: number }[];
  landUse: { arableHectares: number; vegetationHectares: number };
};

export type CreateProducerBody = {
  name: string;
  document: string;
};

export type UpdateProducerBody = {
  name?: string;
  document?: string;
};

export type CreateFarmBody = {
  name: string;
  city: string;
  state: string;
  totalAreaHa: number;
  arableAreaHa: number;
  vegetationAreaHa: number;
};

export type CreatePlantingBody = {
  harvestName: string;
  cropName: string;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Dashboard', 'Producers', 'Producer', 'Farm'],
  endpoints: (builder) => ({
    getDashboard: builder.query<Dashboard, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
    getProducers: builder.query<
      ProducerList,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/producers',
        params: {
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ['Producers'],
    }),
    getProducer: builder.query<ProducerWithFarms, string>({
      query: (id) => `/producers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Producer', id }],
    }),
    createProducer: builder.mutation<Producer, CreateProducerBody>({
      query: (body) => ({
        url: '/producers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Producers'],
    }),
    updateProducer: builder.mutation<
      Producer,
      { id: string } & UpdateProducerBody
    >({
      query: ({ id, ...body }) => ({
        url: `/producers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Producer', 'Producers'],
    }),
    deleteProducer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/producers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Producers', 'Dashboard'],
    }),
    createFarm: builder.mutation<
      FarmSummary & { producerId: string },
      { producerId: string } & CreateFarmBody
    >({
      query: ({ producerId, ...body }) => ({
        url: `/producers/${producerId}/farms`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Producer', 'Dashboard'],
    }),
    getFarm: builder.query<FarmDetail, string>({
      query: (id) => `/farms/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Farm', id }],
    }),
    deleteFarm: builder.mutation<void, string>({
      query: (id) => ({
        url: `/farms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Producer', 'Farm', 'Dashboard'],
    }),
    createPlanting: builder.mutation<
      { id: string; harvestName: string; cropName: string },
      { farmId: string } & CreatePlantingBody
    >({
      query: ({ farmId, ...body }) => ({
        url: `/farms/${farmId}/plantings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Farm', 'Dashboard'],
    }),
    deletePlanting: builder.mutation<void, string>({
      query: (id) => ({
        url: `/plantings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Farm', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetProducersQuery,
  useGetProducerQuery,
  useCreateProducerMutation,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
  useCreateFarmMutation,
  useGetFarmQuery,
  useDeleteFarmMutation,
  useCreatePlantingMutation,
  useDeletePlantingMutation,
} = api;
