import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyMap } from "../components/PropertyMap";
import { PropertyDetailModal } from "../components/PropertyDetailModal";
import { AuthRequiredModal } from "../components/AuthRequiredModal";
import { Property } from "../types";
import { LayoutGrid, Map } from "lucide-react";
import { fetchProperties } from "../services/propertyService";

interface PropertiesProps {
  onAuthClick: () => void;
}

export const Properties: React.FC<PropertiesProps> = ({ onAuthClick }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    minPrice: "",
    maxPrice: "",
    bedrooms: "all",
  });

  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Debounce search
  useEffect(() => {
    const delayedSearch = debounce(() => setFilters((prev) => ({ ...prev, search: searchText })), 600);
    delayedSearch();
    return () => delayedSearch.cancel();
  }, [searchText]);

  // Geocode search text
  useEffect(() => {
    const geocode = async () => {
      if (!filters.search.trim()) return setSearchLocation(null);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(filters.search)}`
        );
        const data = await response.json();
        if (data.length > 0) {
          setSearchLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          setSearchLocation(null);
        }
      } catch {
        setSearchLocation(null);
      }
    };
    geocode();
  }, [filters.search]);

  // Fetch properties
  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchProperties({ search: filters.search, type: filters.type });
      setProperties(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load properties");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [filters.search, filters.type]);

  // Client-side filter
  const filteredProperties = properties.filter((p) => {
    if (filters.minPrice && p.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > parseInt(filters.maxPrice)) return false;
    if (filters.bedrooms !== "all" && p.bedrooms < parseInt(filters.bedrooms)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Browse Properties</h1>
          <p className="text-blue-100">
            {loading
              ? "Loading properties..."
              : error
              ? `Error: ${error}`
              : `Discover ${filteredProperties.length} amazing properties`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="City, State, Address, Title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="sale">Sale</option>
                <option value="hotel">Hotel</option>
                <option value="rental-house">Rental House</option>
                <option value="villa-stay">Villa Stay</option>
                <option value="one-day-stay">One Day Stay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="$0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="Any"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Found <span className="font-bold text-blue-600">{filteredProperties.length}</span> properties
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "map" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid / Map */}
        {loading ? (
          <p className="text-center text-gray-500">Loading properties...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} onClick={() => setSelectedProperty(property)} />
            ))}
          </div>
        ) : (
          <div className="h-[600px]">
            <PropertyMap
              properties={filteredProperties}
              searchLocation={searchLocation}
              onPropertySelect={setSelectedProperty}
              onAuthRequired={() => setShowAuthRequired(true)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onAuthRequired={() => {
          setSelectedProperty(null);
          setShowAuthRequired(true);
        }}
      />
      <AuthRequiredModal isOpen={showAuthRequired} onClose={() => setShowAuthRequired(false)} onLogin={onAuthClick} />
    </div>
  );
};
