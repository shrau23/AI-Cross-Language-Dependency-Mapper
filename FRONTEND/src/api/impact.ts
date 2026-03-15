import { ImpactResponse } from '../types';
import { apiRequest } from './client';

export function runImpactAnalysis(nodeId: string, algorithm = 'bfs', maxDepth = 4): Promise<ImpactResponse> {
  return apiRequest<ImpactResponse>('/impact', {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      algorithm,
      max_depth: maxDepth
    })
  });
}
