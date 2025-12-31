/**
 * Password Generator
 *
 * Generate cryptographically secure passwords and passphrases
 */
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = 'il1Lo0O';
/**
 * EFF Long Wordlist (subset for demo - should be complete in production)
 */
const WORDLIST = [
    'ability', 'able', 'about', 'above', 'accept', 'according', 'account', 'across',
    'action', 'activity', 'actually', 'add', 'address', 'administration', 'admit',
    'adult', 'affect', 'after', 'again', 'against', 'agency', 'agent', 'agree',
    'agreement', 'ahead', 'allow', 'almost', 'alone', 'along', 'already', 'also',
    'although', 'always', 'amazing', 'amount', 'analysis', 'ancient', 'animal',
    'another', 'answer', 'anyone', 'anything', 'appear', 'apply', 'approach', 'area',
    'argue', 'around', 'arrive', 'article', 'artist', 'assume', 'attack', 'attention',
    'attorney', 'audience', 'author', 'authority', 'available', 'avoid', 'away',
    'baby', 'back', 'ball', 'bank', 'base', 'beat', 'beautiful', 'because',
    'become', 'before', 'begin', 'behavior', 'behind', 'believe', 'benefit', 'best',
    'better', 'between', 'beyond', 'bill', 'billion', 'black', 'blood', 'blue',
    'board', 'body', 'book', 'born', 'both', 'break', 'bring', 'brother',
    'budget', 'build', 'building', 'business', 'buy', 'call', 'camera', 'campaign',
    'cancer', 'candidate', 'capital', 'card', 'care', 'career', 'carry', 'case',
    'catch', 'cause', 'cell', 'center', 'central', 'century', 'certain', 'certainly',
    'chair', 'challenge', 'chance', 'change', 'character', 'charge', 'check', 'child',
    'choice', 'choose', 'church', 'citizen', 'city', 'civil', 'claim', 'class',
    'clear', 'clearly', 'close', 'coach', 'cold', 'collection', 'college', 'color',
]; // In production, use full EFF wordlist (7776 words)
/**
 * Generate a random password with specified options
 *
 * @param options - Password generation options
 * @returns Cryptographically secure random password
 */
export function generatePassword(options) {
    let charset = '';
    if (options.includeLowercase)
        charset += LOWERCASE;
    if (options.includeUppercase)
        charset += UPPERCASE;
    if (options.includeNumbers)
        charset += NUMBERS;
    if (options.includeSymbols)
        charset += SYMBOLS;
    if (options.excludeAmbiguous) {
        charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    }
    if (charset.length === 0) {
        throw new Error('At least one character set must be enabled');
    }
    let password = '';
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    for (let i = 0; i < options.length; i++) {
        password += charset[array[i] % charset.length];
    }
    // Ensure minimum requirements are met
    if (!meetsRequirements(password, options)) {
        // Regenerate if requirements not met (rare with good options)
        return generatePassword(options);
    }
    return password;
}
/**
 * Check if password meets minimum requirements
 */
function meetsRequirements(password, options) {
    if (options.minUppercase) {
        const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
        if (uppercaseCount < options.minUppercase)
            return false;
    }
    if (options.minLowercase) {
        const lowercaseCount = (password.match(/[a-z]/g) || []).length;
        if (lowercaseCount < options.minLowercase)
            return false;
    }
    if (options.minNumbers) {
        const numberCount = (password.match(/[0-9]/g) || []).length;
        if (numberCount < options.minNumbers)
            return false;
    }
    if (options.minSymbols) {
        const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
        if (symbolCount < options.minSymbols)
            return false;
    }
    return true;
}
/**
 * Generate a passphrase (Diceware-style)
 *
 * @param options - Passphrase generation options
 * @returns Random passphrase
 */
export function generatePassphrase(options) {
    const array = new Uint32Array(options.wordCount);
    crypto.getRandomValues(array);
    const words = Array.from(array).map(n => {
        let word = WORDLIST[n % WORDLIST.length];
        if (options.capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    });
    let passphrase = words.join(options.separator);
    if (options.includeNumber) {
        const number = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
        passphrase += options.separator + number.toString().padStart(4, '0');
    }
    return passphrase;
}
/**
 * Calculate password strength
 *
 * @param password - Password to analyze
 * @returns Strength analysis
 */
export function calculateStrength(password) {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    // Calculate character set size
    let charsetSize = 0;
    if (hasLower)
        charsetSize += 26;
    if (hasUpper)
        charsetSize += 26;
    if (hasNumber)
        charsetSize += 10;
    if (hasSymbol)
        charsetSize += 32;
    // Calculate entropy: log2(charsetSize^length)
    const entropy = length * Math.log2(charsetSize);
    // Estimate crack time (assuming 10 billion guesses/second)
    const combinations = Math.pow(charsetSize, length);
    const secondsToCrack = combinations / 10000000000;
    const warnings = [];
    const suggestions = [];
    if (length < 12) {
        warnings.push('Password is too short');
        suggestions.push('Use at least 12 characters');
    }
    if (!hasUpper || !hasLower) {
        warnings.push('Missing mixed case');
        suggestions.push('Include both uppercase and lowercase letters');
    }
    if (!hasNumber) {
        warnings.push('No numbers');
        suggestions.push('Add numbers');
    }
    if (!hasSymbol) {
        warnings.push('No symbols');
        suggestions.push('Add special characters');
    }
    // Check common patterns
    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Repeated characters detected');
    }
    if (/^[a-z]+$/.test(password)) {
        warnings.push('Only lowercase letters');
    }
    // Calculate score (0-100)
    let score = Math.min(100, entropy * 3);
    // Penalize for warnings
    score -= warnings.length * 10;
    score = Math.max(0, score);
    return {
        score: Math.round(score),
        entropy: Math.round(entropy),
        crackTime: formatCrackTime(secondsToCrack),
        warnings,
        suggestions,
    };
}
/**
 * Format crack time in human-readable format
 */
function formatCrackTime(seconds) {
    if (seconds < 1)
        return 'Instant';
    if (seconds < 60)
        return `${Math.round(seconds)} seconds`;
    if (seconds < 3600)
        return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400)
        return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000)
        return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000)
        return `${Math.round(seconds / 2592000)} months`;
    if (seconds < 3153600000)
        return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
}
/**
 * Check if password is in common password list (basic check)
 * In production, use a comprehensive list like the top 100k passwords
 *
 * @param password - Password to check
 * @returns True if password is common
 */
export function isCommonPassword(password) {
    const commonPasswords = [
        '123456', 'password', '123456789', '12345678', '12345', '1234567',
        'password1', '123123', '1234567890', '1234', 'qwerty', 'abc123',
        'million2', '000000', '1234', 'iloveyou', 'aaron431',
    ];
    return commonPasswords.includes(password.toLowerCase());
}
//# sourceMappingURL=password-generator.js.map