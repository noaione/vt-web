/**
 * Check if the variable is a null type or not.
 * @param { any } key - things that want to be checked.
 * @returns { boolean } `true` or `false`
 */
export function isNone(key: any, checkEmpty: boolean = false): boolean {
    if (typeof key === "undefined") {
        return true;
    } else if (key === null) {
        return true;
    }
    if (checkEmpty) {
        if (typeof key === "object") {
            if (Array.isArray(key)) {
                if (key.length < 1) {
                    return true;
                }
                return false;
            } else {
                if (Object.keys(key).length < 1) {
                    return true;
                }
                return false;
            }
        } else if (typeof key === "string") {
            if (key.length < 1 || key === "" || key === " ") {
                return true;
            }
            return false;
        }
    }
    return false;
}

/**
 * Capitalize a string.
 * @param { string } text - text that need capitalizing.
 * @returns { string } capitalized string
 */
export function capitalizeIt(text: string): string {
    if (isNone(text)) {return text};
    return text.slice(0, 1).toUpperCase() + text.slice(1);
}

/**
 * Convert a string/number to a number using fallback if it's NaN (Not a number).
 * If fallback is not specified, it will return to_convert.
 * @param cb parseFloat or parseInt function that will be run
 * @param to_convert number or string to convert
 * @param fallback fallback number
 */
export function fallbackNaN(cb: Function, to_convert: any, fallback?: any): any {
    if (isNaN(cb(to_convert))) {
        return isNone(fallback) ? to_convert : fallback;
    } else {
        return cb(to_convert);
    }
}

function rng(max: number): number {
    return Math.floor(Math.random() * max);
}

const ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const ASCII_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
export function generateCustomString(length = 8, includeNumbers = false, includeUppercase = false): string {
    let letters_used = ASCII_LOWERCASE;
    if (includeNumbers) {
        letters_used += NUMBERS;
    }
    if (includeUppercase) {
        letters_used += ASCII_UPPERCASE;
    }
    const charlengths = letters_used.length;
    let generated = "";
    for (let i = 0; i < length; i++) {
        generated += letters_used.charAt(rng(charlengths));
    }
    return generated;
}

const delayPromise = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function resolveDelayCrawlerPromises<T>(requests: Promise<T>[], delayPerRequest: number): Promise<T>[] {
    const remapRequest = requests.map(async (prom, idx) => {
        await delayPromise(delayPerRequest * idx);
        let res = await prom;
        return res;
    })
    return remapRequest;
}
