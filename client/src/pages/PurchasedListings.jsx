import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair } from 'react-icons/fa';

export default function PurchasedListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [purchasedListings, setPurchasedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPurchasedListings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment/purchased-listings/${currentUser._id}`);
        const data = await res.json();
        
        if (res.ok) {
          setPurchasedListings(data);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPurchasedListings();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="text-center my-7 text-2xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-7 text-2xl">
        Something went wrong!
      </div>
    );
  }

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        My Purchased Properties
      </h1>
      
      {purchasedListings.length === 0 ? (
        <div className="text-center my-7">
          <p className="text-xl text-gray-600 mb-4">
            You haven't purchased any properties yet.
          </p>
          <Link 
            to="/" 
            className="text-blue-600 hover:underline"
          >
            Browse available properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden rounded-lg"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
                />
              </Link>
              
              <div className="p-3 flex flex-col gap-2">
                <Link
                  to={`/listing/${listing._id}`}
                  className="font-semibold text-slate-700 truncate hover:underline"
                >
                  {listing.name}
                </Link>
                
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <FaMapMarkerAlt className="text-green-700" />
                  <p className="truncate text-sm">{listing.address}</p>
                </div>
                
                <p className="text-slate-600 text-sm">
                  ${listing.offer
                    ? listing.discountPrice.toLocaleString("en-US")
                    : listing.regularPrice.toLocaleString("en-US")}
                  {listing.type === "rent" && " / month"}
                </p>
                
                <div className="text-slate-700 flex gap-4">
                  <div className="font-bold text-xs">
                    <FaBed className="text-lg" />
                    {(listing.bedrooms || 0) > 1
                      ? `${listing.bedrooms || 0} beds `
                      : `${listing.bedrooms || 0} bed `}
                  </div>
                  <div className="font-bold text-xs">
                    <FaBath className="text-lg" />
                    {(listing.bathrooms || 0) > 1
                      ? `${listing.bathrooms || 0} baths `
                      : `${listing.bathrooms || 0} bath `}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaParking className="text-sm" />
                    <span>{listing.parking ? "Parking" : "No Parking"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaChair className="text-sm" />
                    <span>{listing.furnished ? "Furnished" : "Unfurnished"}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Purchased
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 