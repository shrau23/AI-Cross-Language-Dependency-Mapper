import { Search, ChevronDown, User, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  repoId: string;
  connected: boolean;
}

const Header = ({ query, onQueryChange, repoId, connected }: HeaderProps) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-6 flex-1">
        <h1 className="text-xl font-bold text-white">AI Cross-Language Dependency Mapper</h1>

        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <span className="text-sm text-gray-300">{repoId}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search nodes, files, symbols..."
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-80"
          />
        </div>

        <div
          className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-xs ${
            connected
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{connected ? 'Backend live' : 'Backend offline'}</span>
        </div>

        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
          <User className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
