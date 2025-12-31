/**
 * Import utilities
 */
/**
 * Validate imported items
 */
export function validateImport(items) {
    const valid = [];
    const invalid = [];
    for (const item of items) {
        if (!item.type) {
            invalid.push({ item, reason: 'Missing type' });
            continue;
        }
        if (item.type === 'login') {
            const login = item;
            if (!login.password) {
                invalid.push({ item, reason: 'Missing password' });
                continue;
            }
        }
        valid.push(item);
    }
    return { valid, invalid };
}
/**
 * Detect duplicate items
 */
export function detectDuplicates(items, existingItems) {
    const duplicates = [];
    for (const item of items) {
        if (item.type === 'login') {
            const login = item;
            const isDuplicate = existingItems.some((existing) => {
                if (existing.type !== 'login')
                    return false;
                const existingLogin = existing;
                return (existingLogin.username === login.username &&
                    existingLogin.urls?.[0] === login.urls?.[0]);
            });
            if (isDuplicate) {
                duplicates.push(item);
            }
        }
    }
    return duplicates;
}
export function mergeItems(newItems, existingItems, strategy = 'skip') {
    const duplicates = detectDuplicates(newItems, existingItems);
    const duplicateIds = new Set(duplicates.map((d) => JSON.stringify(d)));
    switch (strategy) {
        case 'skip':
            // Skip duplicates, keep only new items
            return newItems.filter((item) => !duplicateIds.has(JSON.stringify(item)));
        case 'replace':
            // Replace existing with new
            const newItemsMap = new Map(newItems.map((item) => [getItemKey(item), item]));
            return [
                ...existingItems.filter((item) => !newItemsMap.has(getItemKey(item))),
                ...newItems
            ];
        case 'keep-both':
            // Keep all, rename duplicates
            return newItems.map((item) => {
                if (duplicateIds.has(JSON.stringify(item))) {
                    return {
                        ...item,
                        name: item.name + ' (imported)'
                    };
                }
                return item;
            });
        default:
            return newItems;
    }
}
function getItemKey(item) {
    if (item.type === 'login') {
        const login = item;
        return `${login.username}@${login.urls?.[0] || ''}`;
    }
    return item.name;
}
//# sourceMappingURL=utils.js.map