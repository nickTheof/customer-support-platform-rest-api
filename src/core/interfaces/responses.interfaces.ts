export interface ResponseEntity<T> {
    status: boolean;
    data: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    numberOfElements: number;
}