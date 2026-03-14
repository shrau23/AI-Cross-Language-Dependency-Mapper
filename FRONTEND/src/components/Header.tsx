import { Search, ChevronDown, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-6 flex-1">
        <h1 className="text-xl font-bold text-white">AI Cross-Language Dependency Mapper</h1>

        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
          <span className="text-sm text-gray-300">my-awesome-project</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files, dependencies..."
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-80"
          />
        </div>

        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
          <User className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
