const CODE: Record<number, { error: string, message: string }> = {
    400: {
        error: "BAD_REQUEST",
        message: "Bad request, check input"
    },
    401: {
        error: "UNAUTHORIZED",
        message: "Session expired, please login again"
    },
    403: {
        error: "FORBIDDEN",
        message: "Unauthorized, contact administrator"
    },
    404: {
        error: "RESOURCE_NOT_FOUND",
        message: "Resource not found, invalid request"
    },
    500: {
        error: "INTERNAL_SERVER_ERROR",
        message: "Internal server error, contact developer"
    }
}

export { CODE };
