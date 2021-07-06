import React, { useState } from "react";
import { useStoreDispatch } from "../../lib/store";
import { searchQuery as dispatchQuery } from "../../lib/slices/channels";

export default function SearchBoxComponent() {
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useStoreDispatch();

    function filterSearch(text: string) {
        setSearchQuery(text);
        dispatch(dispatchQuery(text));
    }

    return (
        <div className="flex flex-col gap-1 ml-2">
            <div className="text-gray-300 font-semibold">Search</div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => filterSearch(e.target.value)}
                className="form-input w-full md:w-1/2 lg:w-1/3 mt-1 bg-gray-700 rounded-lg border-gray-700 hover:border-gray-400 focus:hover:border-blue-500 transition duration-200"
            />
        </div>
    );
}
