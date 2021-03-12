import * as http from "http";
import * as loaders from './loaders';

const PORT: Readonly<number> = 1337;
async function boot(): Promise<void> {
    const httpServer: any = http.createServer();
    await loaders.init({ httpServer });

    httpServer.listen(PORT);
    console.log(`Socket server is booted up on port ${PORT}`);
}

boot().catch((e: any) => {
    console.error('Crash on start', e);
});
