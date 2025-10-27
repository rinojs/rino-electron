import { spawn } from 'child_process';
import electron from 'electron';

let child;

function start()
{
    if (child) child.kill();
    child = spawn(electron, ['.'], { stdio: 'inherit' });
}

start();

process.on('SIGINT', () =>
{
    if (child) child.kill();
    process.exit();
});