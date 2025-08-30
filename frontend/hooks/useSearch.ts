import { useState, useCallback } from 'react';
import { Property, SearchFilters } from '@/types/property';
import { propertyAPI } from '@/api/propertyApi';

export const useSearch = () => {
    const [searchResults, setSearchResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await propertyAPI.searchProperties(query, filters);
            setSearchResults(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setError(null);
    }, []);

    return {
        searchResults,
        loading,
        error,
        search,
        clearSearch,
    };
};