import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking');
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      setLocalError(false);
      
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const updateUrl = apiUrl ? `${apiUrl}/api/user/update/${currentUser._id}` : `/api/user/update/${currentUser._id}`;
      
      const res = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        setLocalError(data.message);
        setLocalLoading(false);
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setLocalLoading(false);
    } catch (error) {
      setLocalError(error.message);
      setLocalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLocalLoading(true);
      setLocalError(false);
      
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const deleteUrl = apiUrl ? `${apiUrl}/api/user/delete/${currentUser._id}` : `/api/user/delete/${currentUser._id}`;
      
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        setLocalError(data.message);
        setLocalLoading(false);
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const signoutUrl = apiUrl ? `${apiUrl}/api/auth/signout` : '/api/auth/signout';
      
      const res = await fetch(signoutUrl, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        setLocalError(data.message);
        setLocalLoading(false);
        return;
      }
      dispatch(signOutUserSuccess());
      setLocalLoading(false);
    } catch (error) {
      setLocalError(error.message);
      setLocalLoading(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const authUrl = apiUrl ? `${apiUrl}/api/auth/test` : '/api/auth/test';
        
        const res = await fetch(authUrl, {
          credentials: 'include',
        });
        
        if (res.ok) {
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('not-authenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthStatus('error');
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        setLocalLoading(true);
        setLocalError(false);
        
        // Debug: Log current user and API URL
        console.log('Current user:', currentUser);
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        // Get API URL from environment variable
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const listingsUrl = apiUrl ? `${apiUrl}/api/user/listing/${currentUser._id}` : `/api/user/listing/${currentUser._id}`;
        
        console.log('Fetching from:', listingsUrl);
        
        const res = await fetch(listingsUrl, {
          credentials: 'include',
        });
        const data = await res.json();
        console.log('Response:', res.status, data);
        
        if (data.success === false) {
          setLocalError(data.message);
          setLocalLoading(false);
          return;
        }
        setUserListings(data);
        setLocalLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setLocalError(error.message);
        setLocalLoading(false);
      }
    };
    fetchUserListings();
  }, [currentUser._id]);

  const handleShowListings = async () => {
    try {
      setLocalLoading(true);
      setShowListingsError(false);
      
      // Debug: Log current user and API URL
      console.log('Show Listings - Current user:', currentUser);
      console.log('Show Listings - API URL:', import.meta.env.VITE_API_URL);
      
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const listingsUrl = apiUrl ? `${apiUrl}/api/user/listing/${currentUser._id}` : `/api/user/listing/${currentUser._id}`;
      
      console.log('Show Listings - Fetching from:', listingsUrl);
      
      const res = await fetch(listingsUrl, {
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Show Listings - Response:', res.status, data);
      
      if (data.success === false) {
        setShowListingsError(true);
        setLocalLoading(false);
        return;
      }
      setUserListings(data);
      setLocalLoading(false);
    } catch (error) {
      console.error('Show Listings - Fetch error:', error);
      setShowListingsError(true);
      setLocalLoading(false);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      setLocalLoading(true);
      setLocalError(false);
      
      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const deleteUrl = apiUrl ? `${apiUrl}/api/listing/delete/${listingId}` : `/api/listing/delete/${listingId}`;
      
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        setLocalError(data.message);
        setLocalLoading(false);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
      setLocalLoading(false);
    } catch (error) {
      setLocalError(error.message);
      setLocalLoading(false);
    }
  };
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          onChange={handleChange}
          id="password"
          className="border p-3 rounded-lg"
        />
        <button
          disabled={localLoading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {localLoading ? "Loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>

      <p className="text-red-700 mt-5">{localError ? localError : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <p className="text-blue-700 mt-5">
        Auth Status: {authStatus}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
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
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col item-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
