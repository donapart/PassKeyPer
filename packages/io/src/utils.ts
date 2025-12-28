/**
 * Import utilities
 */

import type { VaultItem, LoginItem } from '@passkeyper/core'

/**
 * Validate imported items
 */
export function validateImport(items: VaultItem[]): { valid: VaultItem[]; invalid: any[] } {
    const valid: VaultItem[] = []
    const invalid: any[] = []

    for (const item of items) {
        if (!item.type) {
            invalid.push({ item, reason: 'Missing type' })
            continue
        }

        if (item.type === 'login') {
            const login = item as LoginItem
            if (!login.password) {
                invalid.push({ item, reason: 'Missing password' })
                continue
            }
        }

        valid.push(item)
    }

    return { valid, invalid }
}

/**
 * Detect duplicate items
 */
export function detectDuplicates(
    items: VaultItem[],
    existingItems: VaultItem[]
): VaultItem[] {
    const duplicates: VaultItem[] = []

    for (const item of items) {
        if (item.type === 'login') {
            const login = item as LoginItem
            const isDuplicate = existingItems.some((existing) => {
                if (existing.type !== 'login') return false
                const existingLogin = existing as LoginItem

                return (
                    existingLogin.username === login.username &&
                    existingLogin.urls?.[0] === login.urls?.[0]
                )
            })

            if (isDuplicate) {
                duplicates.push(item)
            }
        }
    }

    return duplicates
}

/**
 * Merge strategy for duplicate items
 */
export type MergeStrategy = 'skip' | 'replace' | 'keep-both'

export function mergeItems(
    newItems: VaultItem[],
    existingItems: VaultItem[],
    strategy: MergeStrategy = 'skip'
): VaultItem[] {
    const duplicates = detectDuplicates(newItems, existingItems)
    const duplicateIds = new Set(duplicates.map((d) => JSON.stringify(d)))

    switch (strategy) {
        case 'skip':
            // Skip duplicates, keep only new items
            return newItems.filter((item) => !duplicateIds.has(JSON.stringify(item)))

        case 'replace':
            // Replace existing with new
            const newItemsMap = new Map(
                newItems.map((item) => [getItemKey(item), item])
            )

            return [
                ...existingItems.filter((item) => !newItemsMap.has(getItemKey(item))),
                ...newItems
            ]

        case 'keep-both':
            // Keep all, rename duplicates
            return newItems.map((item) => {
                if (duplicateIds.has(JSON.stringify(item))) {
                    return {
                        ...item,
                        name: item.name + ' (imported)'
                    }
                }
                return item
            })

        default:
            return newItems
    }
}

function getItemKey(item: VaultItem): string {
    if (item.type === 'login') {
        const login = item as LoginItem
        return `${login.username}@${login.urls?.[0] || ''}`
    }
    return item.name
}
