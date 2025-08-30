import React, {useEffect, useState} from "react";
import { TextInput, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {useDebouncedCallback} from "use-debounce";

const Search = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();

    const [search, setSearch] = useState(params.query || "");

    // Update local state when URL params change
    useEffect(() => {

        setSearch(params.query || "");
    }, [params.query]);

    const handleSearchSubmit = (searchText: string = search) => {
        // Build new URL with updated query parameter
        const searchParams = new URLSearchParams();

        // Set query parameter if there's search text
        if (searchText.trim()) {
            searchParams.set('query', searchText.trim());
        }

        // Preserve existing filter parameter if it exists
        if (params.filter && params.filter !== 'All') {
            searchParams.set('filter', params.filter);
        }

        // Build the new path
        const queryString = searchParams.toString();
        const newPath = queryString ? `${pathname}?${queryString}` : pathname;

        // Navigate to new path
        router.push(newPath);
    };

    const debounceSearch = useDebouncedCallback(
        (text: string) => {
            handleSearchSubmit(text);
        }, 500
    );

    const handleSearchChange = (text: string) => {
        setSearch(text);
        debounceSearch(text);
    };

    const handleClearSearch = () => {
        setSearch("");
        handleSearchSubmit("");
    };

    return (
        <View className=" flex-row items-center bg-white rounded-full px-3 py-2 shadow-md border border-gray-200">
            <Ionicons name="search" size={22} color="#6B7280" />
            <TextInput
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base text-gray-800"
                returnKeyType="search"
                onSubmitEditing={handleSearchSubmit}
            />
            {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Search;
