interface User {
    id: string;
    email: string;
    publicKey: string;
    encryptedPrivateKey: string;
}
interface Vault {
    id: string;
    name: string;
    type: 'personal' | 'shared' | 'work';
    teamId?: string;
    team?: {
        id: string;
        name: string;
    };
}
interface Team {
    id: string;
    name: string;
    description: string;
    _count: {
        members: number;
        vaults: number;
    };
}
interface Item {
    id: string;
    vaultId: string;
    type: string;
    metadata: any;
    version: number;
}
interface SyncSettings {
    apiUrl: string;
    autoSync: boolean;
    syncInterval: number;
    lastSync: number | null;
}
interface MobileState {
    user: User | null;
    isAuthenticated: boolean;
    authToken: string | null;
    masterKey: Uint8Array | null;
    encryptionKey: Uint8Array | null;
    authKey: Uint8Array | null;
    vaults: Vault[];
    teams: Team[];
    items: Item[];
    currentVault: Vault | null;
    searchQuery: string;
    syncSettings: SyncSettings;
    login: (user: User, token: string, masterKey: Uint8Array) => void;
    logout: () => void;
    setVaults: (vaults: Vault[]) => void;
    setTeams: (teams: Team[]) => void;
    setItems: (items: Item[]) => void;
    setSyncSettings: (settings: Partial<SyncSettings>) => void;
    updateLastSync: () => void;
    setCurrentVault: (vault: Vault | null) => void;
    fetchTeams: () => Promise<void>;
    createVault: (name: string, type: 'personal' | 'shared' | 'work', teamId?: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    createItem: (itemData: any) => Promise<void>;
    updateItem: (id: string, itemData: any) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}
export declare const useMobileStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<MobileState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<MobileState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: MobileState) => void) => () => void;
        onFinishHydration: (fn: (state: MobileState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<MobileState, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=mobile-store.d.ts.map