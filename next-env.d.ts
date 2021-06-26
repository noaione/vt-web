/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

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
