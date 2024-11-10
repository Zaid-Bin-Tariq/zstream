import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Subscriptions = () => {
  const userId = useSelector((state) => state.auth.user._id);
  const [subscriptions, setSubscriptions] = useState(null); // Subscription data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  console.log(userId);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        //setLoading(true); // Start loading
        const response = await axios.get(
          `http://localhost:8000/api/v1/subscriptions/c/${userId}`,
          {
            withCredentials: true, // Include credentials if needed for authentication
          }
        );
        setSubscriptions(response.data.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to load subscriptions"); // Handle errors
        console.error("Error fetching subscriptions:", err); // Log error for debugging
      } finally {
        setLoading(false); // Set loading to false after completion
      }
    };

    fetchSubscriptions(); // Call the async function
  }, [userId]); // Empty dependency array to run only once on component mount
  console.log(subscriptions);
  // Render component based on loading, error, and data state
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="px-5">
      <h2 className="text-2xl mx-auto font-bold text-center mb-4">Your Subscriptions</h2>
      {subscriptions ? (
        <div className="flex gap-4">
          {subscriptions.map((subscription) => (
            <Link to={`/user/${subscription[0].username}`}>
            <div className="flex flex-col items-center">
            <img src={subscription[0].avatar} alt="" className="rounded-full h-16 w-16"/>
            <p className="font-bold">{subscription[0].username}</p>
            </div>
            </Link>
          )
          )}
        </div>
        
      ) : (
        <p>No subscriptions found.</p>
      )}
    </div>
  );
};

export default Subscriptions;
