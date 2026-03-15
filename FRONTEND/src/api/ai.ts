import { AIExplainResponse } from '../types';
import { apiRequest } from './client';

export function explainNode(nodeId: string, context: string): Promise<AIExplainResponse> {
  return apiRequest<AIExplainResponse>('/ai/explain', {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      context
    })
  });
}
