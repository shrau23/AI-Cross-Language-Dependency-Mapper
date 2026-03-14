import React, { useCallback } from 'react';

// Magic connection to n8n + other agents (Person A/B/C)
export const useN8n = () => {
  const predictBreakage = useCallback(async (change: string): Promise<{impacted_modules: string[]}> => {
    try {
      const response = await fetch('http://localhost:5678/webhook/predict-breakage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change })
      });
      const data = await response.json();
      return data;  // {impacted_modules: [\"checkout.py\", \"discount_engine.py\"]}
    } catch (error) {
      console.log('n8n not ready, using mock');
      // Fallback for hackathon demo
      return {
        impacted_modules: change.toLowerCase().includes('price') 
          ? ['checkout.py', 'discount_engine.py'] 
          : ['user_service.py']
      };
    }
  }, []);

  const scanRepo = useCallback(async (repoUrl: string) => {
    try {
      const response = await fetch('http://localhost:5678/webhook/repo-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      return await response.json();  // {nodes, edges, semantic_links}
    } catch {
      // Mock success
      return { nodes: [], edges: [] };
    }
  }, []);

  return { predictBreakage, scanRepo };
};

