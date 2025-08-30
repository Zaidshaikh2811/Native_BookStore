
import { Property, SearchFilters, ApiResponse } from "@/types/property";

const API_BASE_URL = 'https://localhost:3000/api/v1';

class PropertyAPI {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    private getToken(): string {

        return 'your-auth-token';
    }

    private buildQueryString(filters: SearchFilters): string {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(item => params.append(key, item.toString()));
                } else {
                    params.append(key, value.toString());
                }
            }
        });

        return params.toString();
    }

    // Get all properties with filtering and pagination
    async getProperties(filters: SearchFilters = {}, page: number = 1, limit: number = 20): Promise<ApiResponse<Property[]>> {
        const queryString = this.buildQueryString({ ...filters, page, limit });
        return this.request<ApiResponse<Property[]>>(`/properties?${queryString}`);
    }

    // Get featured properties
    async getFeaturedProperties(limit: number = 10): Promise<ApiResponse<Property[]>> {
        return this.request<ApiResponse<Property[]>>(`/properties/featured?limit=${limit}`);
    }

    // Search properties with text query
    async searchProperties(query: string, filters: SearchFilters = {}, page: number = 1): Promise<ApiResponse<Property[]>> {
        const searchFilters = { ...filters, query };
        const queryString = this.buildQueryString({ ...searchFilters, page });
        return this.request<ApiResponse<Property[]>>(`/properties/search?${queryString}`);
    }

    // Get recommended properties for user
    async getRecommendedProperties(userId: string, limit: number = 20): Promise<ApiResponse<Property[]>> {
        return this.request<ApiResponse<Property[]>>(`/properties/recommended/${userId}?limit=${limit}`);
    }

    // Get property by ID
    async getPropertyById(id: string): Promise<ApiResponse<Property>> {
        return this.request<ApiResponse<Property>>(`/properties/${id}`);
    }

    // Get properties by type
    async getPropertiesByType(type: string, page: number = 1, limit: number = 20): Promise<ApiResponse<Property[]>> {
        return this.request<ApiResponse<Property[]>>(`/properties/type/${type}?page=${page}&limit=${limit}`);
    }

    // Get property types (for filter options)
    async getPropertyTypes(): Promise<ApiResponse<string[]>> {
        return this.request<ApiResponse<string[]>>('/properties/types');
    }
}

export const propertyAPI = new PropertyAPI();