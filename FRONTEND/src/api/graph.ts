import { GraphResponse } from '../types';
import { apiRequest } from './client';

export function fetchGraph(): Promise<GraphResponse> {
  return apiRequest<GraphResponse>('/graph');
}
