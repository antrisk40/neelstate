import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair, FaUser, FaEnvelope } from 'react-icons/fa';

export default function SoldListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refunding, setRefunding] = useState({});

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        setLoading(true);
        // Get API URL from environment variable
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const listingsUrl = apiUrl ? `${apiUrl}/api/user/listing/${currentUser._id}` : `/api/user/listing/${currentUser._id}`;
        
        const res = await fetch(listingsUrl, {
          credentials: 'include',
        });
        const data = await res.json();
        
        if (res.ok) {
          // Filter to show only sold listings
          const soldListings = data.filter(listing => listing.isSold === true);
          setSoldListings(soldListings);
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
      fetchUserListings();
    }
  }, [currentUser]);

  const handleRefund = async (listingId) => {
    if (!window.confirm('Are you sure you want to process a refund for this listing?')) {
      return;
    }

    setRefunding(prev => ({ ...prev, [listingId]: true }));

    try {
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const refundUrl = apiUrl ? `${apiUrl}/api/payment/refund/${listingId}` : `/api/payment/refund/${listingId}`;
      
      const res = await fetch(refundUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Remove the listing from the sold listings
        setSoldListings(prev => prev.filter(listing => listing._id !== listingId));
        alert('Refund processed successfully');
      } else {
        alert(data.message || 'Failed to process refund');
      }
    } catch (error) {
      alert('Failed to process refund');
    } finally {
      setRefunding(prev => ({ ...prev, [listingId]: false }));
    }
  };

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
        My Sold Properties
      </h1>
      
      {soldListings.length === 0 ? (
        <div className="text-center my-7">
          <p className="text-xl text-gray-600 mb-4">
            You haven't sold any properties yet.
          </p>
          <Link 
            to="/create-listing" 
            className="text-blue-600 hover:underline"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-center mt-7 text-2xl font-semibold">
            Your Sold Listings
          </h2>
          {soldListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center gap-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Sold
                </span>
                <span className="text-sm text-gray-600">
                  ${listing.offer
                    ? listing.discountPrice.toLocaleString("en-US")
                    : listing.regularPrice.toLocaleString("en-US")}
                </span>
                {listing.paymentStatus === 'completed' && (
                  <button
                    onClick={() => handleRefund(listing._id)}
                    disabled={refunding[listing._id]}
                    className="text-red-700 uppercase text-xs hover:text-red-800 disabled:opacity-50"
                  >
                    {refunding[listing._id] ? 'Processing...' : 'Refund'}
                  </button>
                )}
              </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 