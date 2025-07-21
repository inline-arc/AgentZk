import { motion } from 'framer-motion';
import { Check, Plus, Crown } from 'lucide-react';
import { MCPService, mcpServices } from '../config/mcp-services';

interface MCPDropdownProps {
  isOpen: boolean;
  onServiceToggle: (service: MCPService) => void;
}

export const MCPDropdown = ({ isOpen, onServiceToggle }: MCPDropdownProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 bottom-12 w-80 bg-[#2d2936] rounded-lg border border-[#3a3545] shadow-lg z-50"
    >
      <div className="p-3 border-b border-[#3a3545]">
        <h3 className="text-white font-medium text-sm mb-1">MCP Services</h3>
        <p className="text-gray-400 text-xs">Connect to any app integration</p>
      </div>

      <div className="max-h-60 overflow-hidden">
        <div className="space-y-0">
          {mcpServices.map(service => (
            <div
              key={service.id}
              className={`flex items-center p-3 cursor-pointer border-b border-[#3a3545]/30 last:border-b-0 transition-all duration-200 ${
                service.isConnected 
                  ? 'bg-purple-600/20 hover:bg-purple-600/30' 
                  : 'hover:bg-[#3a3545] active:bg-[#4a4555]'
              }`}
              onClick={() => onServiceToggle(service)}
            >
              <img 
                src={service.logoUrl} 
                alt={service.name}
                className="w-6 h-6 rounded mr-3 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjY2NjY2IiByeD0iNCIvPgo8cGF0aCBkPSJNMTIgN1YxN002IDE0SDE4IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">{service.name}</span>
                  {service.isPro && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 py-0.5 rounded-full">
                      <Crown className="h-3 w-3" />
                      <span className="font-medium">$20</span>
                    </div>
                  )}
                </div>
                <div className="text-gray-400 text-xs truncate">{service.description}</div>
              </div>
              <div className="flex items-center ml-2">
                {service.isConnected ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-[#3a3545] bg-[#252030] rounded-b-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-medium">Unlock Pro Features</p>
            <p className="text-gray-400 text-xs">Get unlimited access to all integrations</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200">
            $20/mo
          </button>
        </div>
      </div>
    </motion.div>
  );
};
