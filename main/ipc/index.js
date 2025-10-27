
import
{
    ipcMain,
} from 'electron';

ipcMain.handle('ipcMainHandleEventName', async (_evt, { dataToPass }) =>
{
    console.log(dataToPass);
    return;
});