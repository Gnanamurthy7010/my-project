import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Square, Mail, Calendar } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../services/messageService';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onAuthRequired,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const BACKEND_URL = "http://localhost:5000";

  const getFullImageUrl = (imgPath?: string) => {
    if (!imgPath) return '/placeholder.png';
    return imgPath.startsWith('/uploads/') ? `${BACKEND_URL}${imgPath}` : imgPath;
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    try {
      setError('');
      const messageData = {
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com',
        phone: user?.phone || 'N/A',
        message: `Hello, I'm interested in your property "${property.title}" located at ${property.location?.address || 'N/A'}, ${property.location?.city || 'N/A'}. Please contact me for more details.`,
        propertyId: property.id,
        propertyTitle: property.title,
        ownerId: property.ownerId,
        userId: user?.id,
      };

      const token = user?.token || localStorage.getItem('token');
      const res = await sendMessage(messageData, token);

      if (res.success) {
        setShowContactSuccess(true);
        setTimeout(() => setShowContactSuccess(false), 3000);
      } else {
        throw new Error('Message not sent');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to send message. Please try again later.');
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setShowBookingSuccess(true);
    setTimeout(() => setShowBookingSuccess(false), 3000);
  };

  const images = property.images || [];
  const location = property.location || { address: 'N/A', city: 'N/A', state: 'N/A' };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto bg-black/50">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl my-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold">{property.title || 'Untitled Property'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Images */}
          <div>
            <div className="relative h-96 rounded-xl overflow-hidden mb-4 bg-gray-100">
              {images.length > 0 ? (
                <img
                  src={getFullImageUrl(images[selectedImage])}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                ₹{property.price?.toLocaleString('en-IN') || 'N/A'}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-24 rounded-lg overflow-hidden ${selectedImage === idx ? 'ring-4 ring-blue-600' : ''}`}
                  >
                    <img
                      src={getFullImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-lg">{location.address}, {location.city}, {location.state}</span>
            </div>

            {/* Basic Info */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center text-gray-700">
                <Bed className="h-5 w-5 mr-2 text-gray-400" />
                <span>{property.bedrooms || 0} Bedrooms</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Bath className="h-5 w-5 mr-2 text-gray-400" />
                <span>{property.bathrooms || 0} Bathrooms</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Square className="h-5 w-5 mr-2 text-gray-400" />
                <span>{property.sqft || 0} sqft</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold mb-2">Description</h3>
              <p className="text-gray-600">{property.description || 'No description provided.'}</p>
            </div>

            {/* Property Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Property Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{property.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium capitalize text-green-600">{property.status || 'Available'}</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Owner Information</h3>
              <p className="text-gray-700 font-medium">{property.ownerName || 'Unknown Owner'}</p>
              <p className="text-gray-600 text-sm">{property.ownerEmail || 'Not available'}</p>
            </div>

            {/* Messages */}
            {showContactSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Contact request sent successfully!
              </div>
            )}
            {showBookingSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Booking request submitted!
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleContact}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Mail className="h-5 w-5" />
                <span>Contact Owner</span>
              </button>
              <button
                onClick={handleBook}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Book Viewing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
