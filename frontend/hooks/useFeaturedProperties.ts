import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { propertyAPI } from '@/api/propertyApi';

export const useFeaturedProperties = () => {
    const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                setLoading(true);
                const response = await propertyAPI.getFeaturedProperties(5);
                setFeaturedProperties(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch featured properties');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    return { featuredProperties, loading, error };
};