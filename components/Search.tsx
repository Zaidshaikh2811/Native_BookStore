import React, { useState } from "react";
import { TextInput, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {useDebouncedCallback} from "use-debounce";

const Search = () => {
    const router = useRouter();
    const path = usePathname();
    const params = useLocalSearchParams<{ query?: string }>();

    const [search, setSearch] = useState(params.query || "");

    const debounceSearch=useDebouncedCallback(
        (text:string)=>{
            setSearch(text);
            handleSearchSubmit();
        },500
    )


    const handleSearchChange = (text: string) => {
        setSearch(text);
    };

    const handleSearchSubmit = () => {
        const newPath = search
            ? `/?query=${encodeURIComponent(search)}` // Use root path for home tab
            : "/explore";

        if (newPath !== path) {
            router.push(newPath);
        }
    };

    return (
        <View className="flex-row items-center bg-white rounded-full px-3 py-2 shadow-md border border-gray-200">
            <Ionicons name="search" size={22} color="#6B7280" />
            <TextInput
                value={search}
                onChangeText={debounceSearch}
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
