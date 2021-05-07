export type Nullable<T> = T | null;
export type NoneType = null | undefined;
export type NoneAble<T> = T | NoneType;
export type JSTypeof =
    | "string"
    | "function"
    | "bigint"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "symbol"
    | "array"; // Extra addition

export function capitalizeLetters(text: string) {
    return text.slice(0).toUpperCase() + text.slice(1);
}

export function isType(data: any, type: JSTypeof): data is typeof data {
    if (type === "array" && Array.isArray(data)) {
        return true;
    }
    return typeof data === type;
}
