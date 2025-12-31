/**
 * TOTP Display Component
 * Shows TOTP code with countdown timer
 */
import { type TOTPConfig } from '@passkeyper/totp';
interface TOTPDisplayProps {
    config: TOTPConfig;
    onCopy?: () => void;
}
export declare function TOTPDisplay({ config, onCopy }: TOTPDisplayProps): import("react/jsx-runtime").JSX.Element;
/**
 * TOTP Setup Component
 * For adding new TOTP
 */
interface TOTPSetupProps {
    onAdd: (config: TOTPConfig) => void;
    onCancel: () => void;
}
export declare function TOTPSetup({ onAdd, onCancel }: TOTPSetupProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TOTPDisplay.d.ts.map