import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "../types";
import { PropertyCard } from "./PropertyCard";
import { BACKEND_URL } from "../config/api";

interface PropertyMapProps {
  properties: Property[];
  searchLocation?: { lat: number; lng: number } | null;
  onPropertySelect: (property: Property) => void;
  onAuthRequired?: () => void;
}

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const MapUpdater: React.FC<{ searchLocation?: { lat: number; lng: number } | null }> = ({ searchLocation }) => {
  const map = useMap();

  React.useEffect(() => {
    if (searchLocation) {
      map.flyTo([searchLocation.lat, searchLocation.lng], 12, { animate: true });
    }
  }, [searchLocation, map]);

  return null;
};

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, searchLocation, onPropertySelect }) => {
  const defaultCenter: [number, number] = [12.7409, 77.8253]; // default center (Hosur)

  return (
    <MapContainer center={defaultCenter} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater searchLocation={searchLocation} />

      {properties.map((property) => {
        const lat = property.location?.lat || defaultCenter[0];
        const lng = property.location?.lng || defaultCenter[1];
        return (
          <Marker key={property._id} position={[lat, lng]} icon={markerIcon}>
            <Popup minWidth={250} closeButton={true}>
              <div className="flex flex-col gap-2">
                <img
                  src={property.images?.[0] ? `${BACKEND_URL}${property.images[0]}` : "/placeholder.png"}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <h3 className="font-bold text-gray-900 text-sm">{property.title}</h3>
                <button
                  onClick={() => onPropertySelect(property)}
                  className="bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
