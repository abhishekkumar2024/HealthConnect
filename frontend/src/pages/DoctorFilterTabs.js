import { useCallback, useEffect, useRef, useState } from "react";
import { useDarkMode } from "../contextAPI/contextApi";
import { fetchDoctorsBasedOnFilter } from "../api/doctor.api";
import { DoctorCard } from "../Components/DoctorCard";
import { MapPin } from "lucide-react";

const DoctorFilterTabs = () => {
    const { themeStyles } = useDarkMode();
    const [selectedFilter, setSelectedFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilterValue, setSelectedFilterValue] = useState({});
    const [doctorsList, setDoctorsList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const limit = 9; // Fetch 9 doctors per page (3 cards per row)

    const wrapperRef = useRef(null);

    const FILTER_OPTIONS = ["location", "speciality", "MaximumFees", "availability", "minExperience", "rating"];
    const SPECIALITIES = ["Cardiology", "Dentistry", "Dermatology", "Gynecology", "Orthopedics", "Pediatrics", "Psychiatry", "ENT", "Neurology", "Ophthalmology"];
    const FEES = ["600Rs", "800Rs", "1000Rs", "1200Rs", "1500Rs", "1800Rs", "Above 2000Rs"];

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch doctors handler
    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchDoctorsBasedOnFilter({
                ...selectedFilterValue,
                page: currentPage,
                limit: limit // Fetch 9 doctors per page
            });
            setDoctorsList(response.data.data.doctors);
            setTotalPages(response.data.data.totalPages);
            setTotalDoctors(response.data.data.totalDoctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setError("Failed to fetch doctors. Please try again.");
            setDoctorsList([]);
        } finally {
            setLoading(false);
        }
    }, [selectedFilterValue, currentPage]);

    // Fetch doctors on component mount and when filters or page change
    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // Fetch doctors on page refresh (initial render)
    useEffect(() => {
        fetchDoctors();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Search locations handler
    const searchLocations = async (value) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    value
                )}&limit=5&addressdetails=1`
            );
            const data = await response.json();

            const formattedSuggestions = data.map(item => ({
                id: item.place_id,
                mainText: item.address?.road || item.address?.suburb || item.address?.city || item.display_name.split(',')[0],
                secondaryText: [
                    item.address?.city,
                    item.address?.state,
                    item.address?.country
                ].filter(Boolean).join(', '),
                fullAddress: item.display_name,
                coordinates: {
                    lat: item.lat,
                    lon: item.lon
                }
            }));
            setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error("Error fetching locations:", error);
            setSuggestions([]);
        }
    };

    // Debounce function
    const debounce = (func, delay) => {
        let timeout;

        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((value) => searchLocations(value), 300),
        []
    );

    // Input change handler
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // Key down handler
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            handleFilterSelection(searchQuery.trim(), selectedFilter);
            setSearchQuery("");
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    // Filter selection handler
    const handleFilterSelection = (value, filter) => {
        setSelectedFilterValue((prev) => ({ ...prev, [filter]: value }));
    };

    // Location selection handler
    const handleSelectLocation = (suggestion) => {
        handleFilterSelection(suggestion.fullAddress, "location");
        setSearchQuery("");
        setSuggestions([]);
        setIsOpen(false);
    };

    // Remove filter handler
    const handleRemoveFilter = (filter) => {
        setSelectedFilterValue((prev) => {
            const updatedFilters = { ...prev };
            delete updatedFilters[filter];
            return updatedFilters;
        });

        if (filter === selectedFilter) {
            setSearchQuery("");
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    // Render filter options
    const renderFilterOptions = () => {
        switch (selectedFilter) {
            case "location":
                return (
                    <div className="relative" ref={wrapperRef}>
                        <input
                            type="text"
                            className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                            placeholder="Please Search Location Near You"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                        />

                        {loading && (
                            <div className="absolute right-6 top-4">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />
                            </div>
                        )}

                        {isOpen && suggestions.length > 0 && (
                            <div className={`absolute mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-auto z-50 ${themeStyles.searchBarborderColor}`}>
                                <ul className="py-1">
                                    {suggestions.map((suggestion) => (
                                        <li
                                            key={suggestion.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSelectLocation(suggestion)}
                                        >
                                            <div className="flex items-start">
                                                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {suggestion.mainText}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {suggestion.secondaryText}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case "speciality":
                return (
                    <select
                        className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                        value={selectedFilterValue["speciality"] || ""}
                        onChange={(e) => handleFilterSelection(e.target.value, "speciality")}
                    >
                        <option value="" disabled>Please Select Speciality</option>
                        {SPECIALITIES.map((speciality) => (
                            <option key={speciality} value={speciality}>{speciality}</option>
                        ))}
                    </select>
                );

            case "MaximumFees":
                return (
                    <select
                        className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                        value={selectedFilterValue["fees"] || ""}
                        onChange={(e) => handleFilterSelection(e.target.value, "fees")}
                    >
                        <option value="" disabled>Please Select Fees</option>
                        {FEES.map((fee) => (
                            <option key={fee} value={fee}>{fee}</option>
                        ))}
                    </select>
                );

            case "availability":
                return (
                    <select
                        className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                        value={selectedFilterValue["availability"] || ""}
                        onChange={(e) => handleFilterSelection(e.target.value, "availability")}
                    >
                        <option value="" disabled>Please Select Availability</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>
                );

            case "minExperience":
                return (
                    <select
                        className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                        value={selectedFilterValue["minExperience"] || ""}
                        onChange={(e) => handleFilterSelection(e.target.value, "minExperience")}
                    >
                        <option value="" disabled>Please Select Experience</option>
                        <option value="1 Year">2 Year</option>
                        <option value="4 Years">4 Years</option>
                        <option value="8 Years">8 Years</option>
                        <option value="10 Years">10 Years</option>
                        <option value="15 Years">15 Years</option>
                        <option value="5+ Years">above 15 Years</option>
                    </select>
                );

            case "rating":
                return (
                    <select
                        className={`px-4 py-2 border m-2 w-full rounded-md ${themeStyles.searchBarborderColor} ${themeStyles.placeHoldertext}`}
                        value={selectedFilterValue["rating"] || ""}
                        onChange={(e) => handleFilterSelection(e.target.value, "rating")}
                    >
                        <option value="" disabled>Please Select Rating</option>
                        <option value="1 Star">1 Star</option>
                        <option value="2 Stars">2 Stars</option>
                        <option value="3 Stars">3 Stars</option>
                        <option value="4 Stars">4 Stars</option>
                        <option value="5 Stars">5 Stars</option>
                    </select>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div>
                <h1 className={`text-3xl font-bold ${themeStyles.text} m-2`}>
                    Select Doctor Speciality
                </h1>
                <div className="flex flex-wrap">
                    {FILTER_OPTIONS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-2 ${selectedFilter === filter
                                    ? themeStyles.selectedTabBg
                                    : themeStyles.otherTabBg
                                } ${themeStyles.text} m-2 rounded-md text-lg`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div>{renderFilterOptions()}</div>

            <div className="m-2 flex flex-wrap">
                <h3 className={`text-lg ${themeStyles.text} m-2`}>Selected Filters:</h3>
                <div className="flex flex-wrap">
                    {Object.entries(selectedFilterValue).map(([filter, value]) => (
                        <div key={filter} className="relative group flex items-center m-2">
                            <span className={`px-2 py-1 ${themeStyles.spantext} rounded-md text-md ${themeStyles.spanbg} relative`}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                                <button
                                    className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center text-sm"
                                    onClick={() => handleRemoveFilter(filter)}
                                >
                                    &times;
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="m-2 p-4 bg-red-50 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="m-2 p-4">
                    <p className={`text-lg ${themeStyles.text}`}>Loading doctors...</p>
                </div>
            ) : (
                /* Doctor List */
                <div className="m-2">
                    {doctorsList.length > 0 ? (
                        <div>
                            <h2 className={`text-2xl font-bold ${themeStyles.text} m-2 `}>
                                Doctors List
                            </h2>
                            {/* Grid layout for 3 cards per row */}
                            <div className="mt-4 px-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 justify-center">
                                {doctorsList.map((doctor) => (
                                    <div key={doctor._id}>
                                        <DoctorCard doctor={doctor} />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center mt-4">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 mx-1 rounded-md ${currentPage === 1
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`px-4 py-2 mx-1 rounded-md ${currentPage === index + 1
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-300 hover:bg-gray-400"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 mx-1 rounded-md ${currentPage === totalPages
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-lg ${themeStyles.text} m-2`}>
                            No doctors found based on selected filters.
                        </p>
                    )}
                </div>
            )}
        </>
    );
};

export { DoctorFilterTabs };