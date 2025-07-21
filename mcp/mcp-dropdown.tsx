import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { MCPService, mcpServices } from '../config/mcp-services';

interface MCPDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onServiceConnect: (service: MCPService, apiKey?: string) => void;
  onServiceDisconnect: (serviceId: string) => void;
}

export const MCPDropdown = ({ 
  isOpen, 
  setIsOpen, 
  onServiceConnect, 
  onServiceDisconnect 
}: MCPDropdownProps) => {
  const handleServiceClick = (service: MCPService) => {
    if (service.isConnected) {
      onServiceDisconnect(service.id);
    } else {
      onServiceConnect(service);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 bottom-12 w-80 bg-[#2d2936] rounded-lg border border-[#3a3545] shadow-lg z-50"
    >
      <div className="p-3 border-b border-[#3a3545]">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-medium text-sm">MCP Services</h3>
          <span className="text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            PRO
          </span>
        </div>
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
              onClick={() => handleServiceClick(service)}
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
                    <span className="text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      PRO
                    </span>
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
    </motion.div>
  );
};
