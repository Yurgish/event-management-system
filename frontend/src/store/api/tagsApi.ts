import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { baseApi } from '@/store/api/baseApi';
import type { TagItem } from '@/types/api/tags';

export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<TagItem[], void>({
      query: () => API_ENDPOINTS.TAGS,
      providesTags: ['Tag'],
    }),
  }),
});

export const { useGetTagsQuery } = tagsApi;
