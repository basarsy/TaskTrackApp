// src/utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('fetch')) {
            return 'Network error. Please check your connection and ensure the API server is running.';
        }

        // Check for common HTTP status codes
        if (error.message.includes('401')) {
            return 'Unauthorized. Please log in again.';
        }

        if (error.message.includes('403')) {
            return 'Forbidden. You do not have permission to perform this action.';
        }

        if (error.message.includes('404')) {
            return 'Resource not found.';
        }

        if (error.message.includes('409')) {
            return 'Conflict. The resource already exists.';
        }

        if (error.message.includes('500')) {
            return 'Internal server error. Please try again later.';
        }

        return error.message;
    }

    return 'An unexpected error occurred.';
};