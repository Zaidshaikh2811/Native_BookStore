import { useState, useEffect, useCallback } from 'react';
import { Property, SearchFilters} from "@/types/property";
import { propertyAPI } from "@/api/propertyApi";

export const useProperties = (filters: SearchFilters = {}, autoFetch: boolean = true) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const fetchProperties = useCallback(async (page: number = 1, append: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await propertyAPI.getProperties(filters, page, pagination.limit);

            if (append) {
                setProperties(prev => [...prev, ...response.data]);
            } else {
                setProperties(response.data);
            }

            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    const loadMore = useCallback(() => {
        if (pagination.page < pagination.totalPages && !loading) {
            fetchProperties(pagination.page + 1, true);
        }
    }, [fetchProperties, pagination.page, pagination.totalPages, loading]);

    const refresh = useCallback(() => {
        fetchProperties(1, false);
    }, [fetchProperties]);

    useEffect(() => {
        if (autoFetch) {
            fetchProperties(1, false);
        }
    }, [filters, autoFetch]);

    return {
        properties,
        loading,
        error,
        pagination,
        fetchProperties,
        loadMore,
        refresh,
    };
};
