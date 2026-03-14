import { LayoutDashboard, ScanLine, Network, Zap, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan Repository', icon: ScanLine },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'simulation', label: 'Impact Simulation', icon: Zap },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Network className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-white font-bold text-sm">Dependency</h1>
            <p className="text-gray-400 text-xs">Mapper</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
