export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    type: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Condo';
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    images: string[];
    features: {
        bedrooms: number;
        bathrooms: number;
        area: number;
        parking: boolean;
        furnished: boolean;
    };
    amenities: string[];
    status: 'available' | 'sold' | 'pending';
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    agent: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
    };
}

export interface SearchFilters {
    query?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    location?: string;
    features?: string[];
    amenities?: string[];
}

export interface ApiResponse<T> {
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}