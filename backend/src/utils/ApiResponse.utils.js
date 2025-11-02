class ApiResponse {
    constructor(status, data, message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    toJSON() {
        return {
            status: this.status,
            data: this.data,
            message: this.message,
        };
    }
}
export { ApiResponse };