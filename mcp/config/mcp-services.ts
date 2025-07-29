export interface MCPService {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  isConnected: boolean;
  apiKeyRequired: boolean;
  apiKey?: string;
  isPro: boolean;
}

export const mcpServices: MCPService[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read and send emails',
    logoUrl: 'https://www.google.com/gmail/about/static/images/logo-gmail.png',
    category: 'Communication',
    isConnected: false,
    apiKeyRequired: false,
    isPro: true
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Access and manage Notion pages',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    category: 'Productivity',
    isConnected: false,
    apiKeyRequired: false,
    isPro: true
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Manage databases and records',
    logoUrl: 'https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png',
    category: 'Database',
    isConnected: false,
    apiKeyRequired: false,
    isPro: true
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    description: 'Work with spreadsheets',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg',
    category: 'Productivity',
    isConnected: false,
    apiKeyRequired: false,
    isPro: false
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Manage events and schedules',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    category: 'Productivity',
    isConnected: false,
    apiKeyRequired: false,
    isPro: true
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Post and read tweets',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
    category: 'Social Media',
    isConnected: false,
    apiKeyRequired: false,
    isPro: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and manage channels',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    category: 'Communication',
    isConnected: false,
    apiKeyRequired: false,
    isPro: true
  }
];

