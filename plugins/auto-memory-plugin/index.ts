export interface PluginAPI {
  name: string;
  version: string;
  description?: string;
  author?: {
    name: string;
    email: string;
  };
  commands?: Record<string, CommandHandler>;
  agents?: Record<string, AgentHandler>;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

export interface CommandHandler {
  description: string;
  parameters?: Record<string, unknown>;
  handler: (args: unknown) => Promise<string>;
}

export interface AgentHandler {
  description: string;
  handler: (input: string) => Promise<string>;
}

export default {
  name: 'auto-memory-plugin',
  version: '1.0.0',
  description: 'Automatic memory system inspired by MemRL that hooks into Claude Code lifecycle events for seamless context retention',
  author: {
    name: 'cbuntingde',
    email: 'cbuntingde@gmail.com'
  }
} as PluginAPI;
