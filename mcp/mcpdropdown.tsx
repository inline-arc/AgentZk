import { MCPDropdown } from './mcp-dropdown';
import { MCPService, mcpServices } from './config/mcp-services';

interface MCPDropdownContainerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MCPDropdownContainer = ({ isOpen, setIsOpen }: MCPDropdownContainerProps) => {
  const handleServiceConnect = async (service: MCPService, apiKey?: string) => {
    try {
      // Here you would implement the actual connection logic
      console.log(`Connecting to ${service.name}`, { apiKey });
      
      // Update the service connection status
      const serviceIndex = mcpServices.findIndex(s => s.id === service.id);
      if (serviceIndex !== -1) {
        mcpServices[serviceIndex].isConnected = true;
        if (apiKey) {
          mcpServices[serviceIndex].apiKey = apiKey;
        }
      }
      
      // You could also emit an event or call a callback here
    } catch (error) {
      console.error(`Failed to connect to ${service.name}:`, error);
    }
  };

  const handleServiceDisconnect = async (serviceId: string) => {
    try {
      // Here you would implement the actual disconnection logic
      console.log(`Disconnecting from ${serviceId}`);
      
      // Update the service connection status
      const serviceIndex = mcpServices.findIndex(s => s.id === serviceId);
      if (serviceIndex !== -1) {
        mcpServices[serviceIndex].isConnected = false;
        mcpServices[serviceIndex].apiKey = undefined;
      }
      
      // You could also emit an event or call a callback here
    } catch (error) {
      console.error(`Failed to disconnect from ${serviceId}:`, error);
    }
  };

  return (
    <MCPDropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onServiceConnect={handleServiceConnect}
      onServiceDisconnect={handleServiceDisconnect}
    />
  );
};
