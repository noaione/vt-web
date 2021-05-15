/// <reference types="next" />
/// <reference types="next/types/global" />

declare global {
    namespace NodeJS {
        // Extend process.env typing
        interface ProcessEnv {
            TOKEN_SECRET?: string;
            HASHED_WEB_PASSWORD?: string;
            IHAAPI_PASSWORD?: string;
        }
    }
}
