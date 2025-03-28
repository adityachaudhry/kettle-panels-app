// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  on: (
    channel: string,
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel: string, args: any) => {
    ipcRenderer.send(channel, args);
  },
  invoke: (channel: string, args: any) => {
    return ipcRenderer.invoke(channel, args);
  },
});
