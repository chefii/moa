import apiClient from '../client';
import { ApiResponse } from '../types';

export type EventStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  participantCount: number;
  maxParticipants?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  data: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateEventDto {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate: string;
  endDate: string;
  status?: EventStatus;
  maxParticipants?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
  participantCount?: number;
  maxParticipants?: number;
}

export const eventsApi = {
  // Get all events
  getEvents: async (
    page = 1,
    limit = 10,
    status?: EventStatus
  ): Promise<EventListResponse> => {
    let url = `/api/admin/events?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<ApiResponse<Event>>(
      `/api/admin/events/${id}`
    );
    return response.data.data!;
  },

  // Create event
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await apiClient.post<ApiResponse<Event>>(
      '/api/admin/events',
      data
    );
    return response.data.data!;
  },

  // Update event
  updateEvent: async (id: string, data: UpdateEventDto): Promise<Event> => {
    const response = await apiClient.put<ApiResponse<Event>>(
      `/api/admin/events/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/events/${id}`);
  },
};
