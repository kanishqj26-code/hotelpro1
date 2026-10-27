import React from 'react';
import { Room } from '../types/index.ts';
import { CheckCircle2, XCircle } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onLearnMore: (room: Room) => void;
  onBookNow: (room: Room) => void;
  selectedDates?: { checkIn?: string; checkOut?: string };
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onLearnMore,
  onBookNow,
  selectedDates
}) => {
  const displayImage = room.images && room.images.length > 0
    ? room.images[0]
    : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

  const isDelux = room.type === 'Delux';

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Room Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 group">
        <img
          src={displayImage}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              isDelux
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {room.type}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded">
          Room {room.roomNumber}
        </div>
      </div>

      {/* Card Content - Styled identically to screenshot 3 */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Room Type: {room.type.toLowerCase()}
          </h3>

          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center">
              <span className="font-medium text-gray-700 mr-1.5">Room Capacity:</span>
              <span>{room.capacity} {room.capacity === 1 ? 'Person' : 'People'}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium text-gray-700 mr-1.5">Rent:</span>
              <span className="font-semibold text-gray-900">₹{room.pricePerNight} per day</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium text-gray-700 mr-1.5">Type:</span>
              <span>{room.type.toLowerCase()}</span>
            </p>
            <p className="text-gray-600 text-xs line-clamp-2 pt-1 leading-relaxed">
              <span className="font-medium text-gray-700">Description: </span>
              {room.description}
            </p>
          </div>

          {/* Availability Indicator if dates chosen */}
          {selectedDates?.checkIn && selectedDates?.checkOut && (
            <div className="pt-2">
              {room.isAvailable !== false ? (
                <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Available for your dates
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reserved for selected dates
                </span>
              )}
            </div>
          )}
        </div>

        {/* Buttons - matches screenshot 3 blue LEARN MORE button + action button */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center space-x-2">
          <button
            onClick={() => onLearnMore(room)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded transition shadow-xs text-center"
          >
            LEARN MORE
          </button>
          <button
            onClick={() => onBookNow(room)}
            disabled={room.isAvailable === false}
            className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition text-center ${
              room.isAvailable === false
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
};
