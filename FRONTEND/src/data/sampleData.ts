import { FileNode, Dependency, FileTreeNode, DashboardMetrics, GraphMetrics } from '../types';

export const fileNodes: FileNode[] = [
  {
    id: 'user_service.py',
    name: 'user_service.py',
    language: 'Python',
    path: 'backend/user_service.py',
    apis: ['UserAPI', 'AuthAPI', 'DatabaseAPI'],
    dependencyCount: 5
  },
  {
    id: 'auth_service.py',
    name: 'auth_service.py',
    language: 'Python',
    path: 'backend/auth_service.py',
    apis: ['AuthAPI', 'TokenAPI'],
    dependencyCount: 3
  },
  {
    id: 'profile.js',
    name: 'profile.js',
    language: 'JavaScript',
    path: 'frontend/profile.js',
    apis: ['UserAPI', 'ProfileAPI'],
    dependencyCount: 4
  },
  {
    id: 'dashboard.js',
    name: 'dashboard.js',
    language: 'JavaScript',
    path: 'frontend/dashboard.js',
    apis: ['DashboardAPI', 'AnalyticsAPI'],
    dependencyCount: 6
  },
  {
    id: 'schema.sql',
    name: 'schema.sql',
    language: 'SQL',
    path: 'database/schema.sql',
    apis: ['DatabaseAPI'],
    dependencyCount: 2
  },
  {
    id: 'api_gateway.js',
    name: 'api_gateway.js',
    language: 'JavaScript',
    path: 'backend/api_gateway.js',
    apis: ['GatewayAPI', 'RouteAPI'],
    dependencyCount: 7
  },
  {
    id: 'analytics.py',
    name: 'analytics.py',
    language: 'Python',
    path: 'backend/analytics.py',
    apis: ['AnalyticsAPI', 'MetricsAPI'],
    dependencyCount: 4
  },
  {
    id: 'login.js',
    name: 'login.js',
    language: 'JavaScript',
    path: 'frontend/login.js',
    apis: ['AuthAPI'],
    dependencyCount: 2
  }
];

export const dependencies: Dependency[] = [
  { source: 'user_service.py', target: 'auth_service.py' },
  { source: 'user_service.py', target: 'schema.sql' },
  { source: 'profile.js', target: 'user_service.py' },
  { source: 'profile.js', target: 'api_gateway.js' },
  { source: 'dashboard.js', target: 'analytics.py' },
  { source: 'dashboard.js', target: 'api_gateway.js' },
  { source: 'dashboard.js', target: 'user_service.py' },
  { source: 'api_gateway.js', target: 'user_service.py' },
  { source: 'api_gateway.js', target: 'auth_service.py' },
  { source: 'api_gateway.js', target: 'analytics.py' },
  { source: 'analytics.py', target: 'schema.sql' },
  { source: 'login.js', target: 'auth_service.py' },
  { source: 'login.js', target: 'api_gateway.js' },
  { source: 'auth_service.py', target: 'schema.sql' }
];

export const fileTree: FileTreeNode[] = [
  {
    name: 'project',
    type: 'folder',
    path: 'project',
    children: [
      {
        name: 'backend',
        type: 'folder',
        path: 'backend',
        children: [
          { name: 'user_service.py', type: 'file', path: 'backend/user_service.py', language: 'Python' },
          { name: 'auth_service.py', type: 'file', path: 'backend/auth_service.py', language: 'Python' },
          { name: 'analytics.py', type: 'file', path: 'backend/analytics.py', language: 'Python' },
          { name: 'api_gateway.js', type: 'file', path: 'backend/api_gateway.js', language: 'JavaScript' }
        ]
      },
      {
        name: 'frontend',
        type: 'folder',
        path: 'frontend',
        children: [
          { name: 'profile.js', type: 'file', path: 'frontend/profile.js', language: 'JavaScript' },
          { name: 'dashboard.js', type: 'file', path: 'frontend/dashboard.js', language: 'JavaScript' },
          { name: 'login.js', type: 'file', path: 'frontend/login.js', language: 'JavaScript' }
        ]
      },
      {
        name: 'database',
        type: 'folder',
        path: 'database',
        children: [
          { name: 'schema.sql', type: 'file', path: 'database/schema.sql', language: 'SQL' }
        ]
      }
    ]
  }
];

export const dashboardMetrics: DashboardMetrics = {
  totalFiles: 8,
  languagesDetected: 3,
  totalDependencies: 14,
  riskLevel: 'Medium'
};

export const graphMetrics: GraphMetrics = {
  totalNodes: 8,
  totalEdges: 14,
  mostDependentFile: 'api_gateway.js',
  mostUsedAPI: 'UserAPI'
};
