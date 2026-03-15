import { ScanResponse } from '../types';
import { apiRequest } from './client';

export function scanRepository(url: string, maxFiles = 200): Promise<ScanResponse> {
  return apiRequest<ScanResponse>('/scan', {
    method: 'POST',
    body: JSON.stringify({
      url,
      max_files: maxFiles
    })
  });
}
