import { VaultStorage } from '@passkeyper/storage';
export declare class IpcServer {
    private vaultStorage;
    constructor(vaultStorage: VaultStorage | null);
    start(): void;
    setVaultStorage(storage: VaultStorage | null): void;
    private searchCredentials;
}
//# sourceMappingURL=ipc-server.d.ts.map