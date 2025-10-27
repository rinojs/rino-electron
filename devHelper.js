import { spawn } from 'child_process';
import path from 'path';
import url from 'url';
import chokidar from 'chokidar';
import electron from 'electron';
import { findPort } from "rinojs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ELECTRON_DEBOUNCE_MS = 250;
const port = await findPort(3000);

let ElectronChild = null;
let RinoChild = null;
let et;

function startElectron()
{
    function spawnNow()
    {
        const env = {
            ...process.env,
            RINO_DEV: '1',
            RINO_URL: `http://localhost:${ port }`,
        };
        ElectronChild = spawn(electron, ['.'], {
            stdio: ['ignore', 'inherit', 'inherit'],
            env,
        });
        ElectronChild.on('close', () => { ElectronChild = null; });
        console.log('[dev] Electron started/restarted');
    }

    if (ElectronChild)
    {
        const p = ElectronChild;
        ElectronChild = null;
        p.once('close', () => setTimeout(spawnNow, 50));
        try { p.kill(); } catch (error)
        {
            console.log(`Killing Electron Process Error: ${ error }`);
        }
    }
    else
    {
        spawnNow();
    }
}

function scheduleElectron()
{
    clearTimeout(et);
    et = setTimeout(() => startElectron(), ELECTRON_DEBOUNCE_MS);
}

function startRino()
{
    if (RinoChild) return;

    const devPath = path.join(__dirname, 'rino', 'dev.js');
    const env = { ...process.env, PORT: String(port) };

    RinoChild = spawn(process.execPath, [devPath], {
        stdio: ['ignore', 'inherit', 'inherit'],
        env,
    });

    RinoChild.on('close', () =>
    {
        console.log('[dev] Rino dev server exited');
        RinoChild = null;
    });
}

const mainDir = path.join(__dirname, 'main');

chokidar
    .watch([
        mainDir
    ], { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 } }).on('all', (evt, file) =>
    {
        console.log(`[dev] ${ evt }: ${ file }`);
        scheduleElectron();
    });


function shutdown()
{
    if (ElectronChild) ElectronChild.kill();
    if (RinoChild) RinoChild.kill();

    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startRino();
scheduleElectron();