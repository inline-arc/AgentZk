import { MCPDropdown } from './mcp-dropdown';
import { MCPService, mcpServices } from './config/mcp-services';

interface MCPDropdownContainerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MCPDropdownContainer = ({ isOpen, setIsOpen }: MCPDropdownContainerProps) => {
  const handleServiceToggle = (service: MCPService) => {
    if (service.isPro && !service.isConnected) {
      console.log(`Pro feature required for ${service.name}`);
      return;
    }
    
    const serviceIndex = mcpServices.findIndex(s => s.id === service.id);
    if (serviceIndex !== 0) {
      mcpServices[serviceIndex].isConnected = !mcpServices[serviceIndex].isConnected;
      console.log(`${service.name} ${mcpServices[serviceIndex].isConnected ? 'connected' : 'disconnected'}`);
    }
  };

  return (
    <div className="relative">
      <MCPDropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onServiceConnect={handleServiceToggle}
        onServiceDisconnect={(serviceId: string) => {
          const service = mcpServices.find(s => s.id === serviceId);
          if (service) {
            handleServiceToggle(service);
          }
        }}
      />
    </div>
  );
};

