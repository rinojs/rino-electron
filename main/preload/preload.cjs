const { contextBridge, ipcRenderer } = require('electron');

let dataToPass = "Hello, World!";

contextBridge.exposeInMainWorld('api', {
  someFunction: () => ipcRenderer.invoke('ipcMainHandleEventName', { dataToPass }),
});