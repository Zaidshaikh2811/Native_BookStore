import React from 'react'
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useLocalSearchParams} from "expo-router";


const filters = ['All', 'Apartment', 'House', 'Villa', 'Studio', 'Condo'];


const Filters = () => {
    const params = useLocalSearchParams<{filter?:string}>();
    const [selectedFilter, setSelectedFilter] = React.useState(params.filter || 'All');

    const  handleCategory=(category:string) => {

    }

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
