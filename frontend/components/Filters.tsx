import React from 'react'
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useLocalSearchParams, usePathname, useRouter} from "expo-router";



const filters = ['All', 'Apartment', 'House', 'Villa', 'Studio', 'Condo'];


const Filters = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();
    const [selectedFilter, setSelectedFilter] = React.useState(params.filter || 'All');

    const handleCategory = (category: string) => {
        // Build new URL with updated filter parameter
        const searchParams = new URLSearchParams();

        // Preserve existing query parameter if it exists
        if (params.query) {
            searchParams.set('query', params.query);
        }

        // Set filter parameter (only if not 'All')
        if (category !== 'All') {
            searchParams.set('filter', category);
        }

        // Build the new path
        const queryString = searchParams.toString();
        const newPath = queryString ? `${pathname}?${queryString}` : pathname;

        // Navigate to new path
        router.push(newPath);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-4 pl-4"
        >
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    onPress={() => {
                        setSelectedFilter(filter);
                        handleCategory(filter);
                    }}
                    className={`mr-2 px-5 py-2 rounded-full border shadow-sm ${
                        selectedFilter === filter
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300'
                    }`}
                >
                    <Text
                        className={`text-sm font-medium ${
                            selectedFilter === filter ? 'text-white' : 'text-gray-700'
                        }`}
                    >
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}
export default Filters
