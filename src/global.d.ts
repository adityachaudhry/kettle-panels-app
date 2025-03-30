export interface ElectronAPI {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
