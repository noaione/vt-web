interface ExtendedError extends Error {
    response: Response;
    data: any;
    httpCode: number;
}

export default async function fetcher(...args: Parameters<typeof fetch>) {
    try {
        const response = await fetch(...args);
        const data = await response.json();
        if (response.ok) {
            return data;
        }

        const error = new Error(response.statusText) as ExtendedError;
        error.response = response;
        error.data = data;
        error.httpCode = response.status;

        throw error;
    } catch (error) {
        if (!error.data) {
            error.data = { message: error.message };
        }
        if (typeof error.httpCode !== "number") {
            error.httpCode = 500;
        }
        throw error;
    }
}
