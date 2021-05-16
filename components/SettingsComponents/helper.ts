import { isNone } from "../../lib/utils";

export function getLocalStorageData(localStorage: Storage, keyName: string, defaults: any) {
    const read = localStorage.getItem(keyName);
    if (isNone(read)) {
        localStorage.setItem(keyName, defaults);
        return defaults;
    }
    return read;
}
