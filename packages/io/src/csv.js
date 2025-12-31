/**
 * CSV Export/Import
 * Supports PassKeyPer format and other password managers
 */
import Papa from 'papaparse';
/**
 * Export items to CSV
 */
export function exportToCSV(items) {
    const rows = items
        .filter((item) => item.type === 'login')
        .map((item) => {
        const login = item;
        return {
            name: login.name,
            url: login.urls?.[0] || '',
            username: login.username || '',
            password: login.password,
            notes: login.notes || '',
            folder: '', // TODO: Add folder support
            favorite: login.metadata?.isFavorite ? 'true' : 'false',
            totp: '', // TODO: Add TOTP export
        };
    });
    return Papa.unparse(rows, {
        header: true,
        columns: ['name', 'url', 'username', 'password', 'notes', 'folder', 'favorite', 'totp']
    });
}
/**
 * Import from PassKeyPer CSV
 */
export function importFromCSV(csv) {
    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase()
    });
    if (result.errors.length > 0) {
        throw new Error('CSV parsing failed: ' + result.errors[0].message);
    }
    return result.data.map((row) => ({
        type: 'login',
        name: row.name || 'Untitled',
        username: row.username || '',
        password: row.password || '',
        urls: row.url ? [row.url] : [],
        notes: row.notes || '',
        customFields: [],
        passwordHistory: [],
        metadata: {
            isFavorite: row.favorite === 'true',
            tags: [],
        }
    }));
}
/**
 * Import from 1Password CSV
 */
export function importFrom1Password(csv) {
    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    });
    return result.data.map((row) => ({
        type: 'login',
        name: row.Title || row.title || 'Untitled',
        username: row.Username || row.username || '',
        password: row.Password || row.password || '',
        urls: [row.URL || row.url || ''].filter(Boolean),
        notes: row.Notes || row.notes || '',
        customFields: [],
        passwordHistory: [],
    }));
}
/**
 * Import from Bitwarden JSON
 */
export function importFromBitwarden(json) {
    const data = JSON.parse(json);
    if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid Bitwarden export format');
    }
    return data.items
        .filter((item) => item.type === 1) // 1 = login
        .map((item) => ({
        type: 'login',
        name: item.name || 'Untitled',
        username: item.login?.username || '',
        password: item.login?.password || '',
        urls: item.login?.uris?.map((uri) => uri.uri) || [],
        notes: item.notes || '',
        customFields: item.fields?.map((field) => ({
            name: field.name,
            value: field.value,
            type: field.type === 0 ? 'text' : 'hidden'
        })) || [],
        passwordHistory: [],
        metadata: {
            isFavorite: item.favorite || false,
            tags: item.organizationId ? ['shared'] : [],
        }
    }));
}
/**
 * Import from LastPass CSV
 */
export function importFromLastPass(csv) {
    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    });
    return result.data.map((row) => ({
        type: 'login',
        name: row.name || 'Untitled',
        username: row.username || '',
        password: row.password || '',
        urls: [row.url].filter(Boolean),
        notes: row.extra || '',
        customFields: [],
        passwordHistory: [],
        metadata: {
            tags: row.grouping ? [row.grouping] : [],
        }
    }));
}
/**
 * Import from Chrome passwords CSV
 */
export function importFromChrome(csv) {
    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    });
    return result.data.map((row) => ({
        type: 'login',
        name: row.name || new URL(row.url || 'https://example.com').hostname,
        username: row.username || '',
        password: row.password || '',
        urls: [row.url].filter(Boolean),
        notes: '',
        customFields: [],
        passwordHistory: [],
    }));
}
/**
 * Detect import format from content
 */
export function detectImportFormat(content) {
    // Try JSON (Bitwarden)
    try {
        const json = JSON.parse(content);
        if (json.encrypted === false && json.items) {
            return 'bitwarden';
        }
    }
    catch {
        // Not JSON, continue
    }
    // Try CSV
    const firstLine = content.split('\n')[0].toLowerCase();
    if (firstLine.includes('name') && firstLine.includes('url') && firstLine.includes('username') && firstLine.includes('password')) {
        if (firstLine.includes('folder')) {
            return 'passkeyper';
        }
        if (firstLine.includes('title')) {
            return '1password';
        }
        if (firstLine.includes('grouping')) {
            return 'lastpass';
        }
        return 'chrome';
    }
    return 'unknown';
}
/**
 * Auto-import based on detected format
 */
export function autoImport(content) {
    const format = detectImportFormat(content);
    switch (format) {
        case 'passkeyper':
            return importFromCSV(content);
        case '1password':
            return importFrom1Password(content);
        case 'bitwarden':
            return importFromBitwarden(content);
        case 'lastpass':
            return importFromLastPass(content);
        case 'chrome':
            return importFromChrome(content);
        default:
            throw new Error('Unknown import format');
    }
}
//# sourceMappingURL=csv.js.map