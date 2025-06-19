export interface ResponseEntity<T> {
    status: boolean;
    data: T;
}

export interface PaginatedResponse<T> {
    status: boolean;
    data: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    numberOfElements: number;
}

export interface PaginatedAggregationResult<T> {
    data: T[];
    totalCount: [{ count: number }];
}