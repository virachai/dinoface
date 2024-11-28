import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import axios from "axios"; // Import axios to make API calls
import axiosInstance from "../services/axiosInstance"; // Import axiosInstance

// Create the context for authentication and cart
const AuthContext = createContext();

// AuthProvider component that manages both user and cart state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Check if the user is logged in by checking the token from cookies
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = Cookies.get("auth_token");
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem("user"));
          if (userData) {
            setUser(userData); // Load the user from localStorage if token is present
            fetchCart(); // Fetch cart from the API if the user is logged in
          } else {
            logout(); // If user data is missing, log out
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          logout(); // If parsing fails, log out
        }
      }
    };

    checkAuthStatus();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Fetch the user's cart from the API
  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get("/api/cart", {
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
      });
      setCart(response.data.items || []); // Set the cart data
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Login function to store user data and token in cookies and localStorage
  const login = (userData, token) => {
    setUser(userData);
    Cookies.set("auth_token", token, { expires: 1 }); // Token expires in 1 day
    localStorage.setItem("user", JSON.stringify(userData));
    fetchCart(); // Fetch the user's cart after login
  };

  // Logout function to clear user data and token
  const logout = () => {
    setUser(null);
    Cookies.remove("auth_token");
    localStorage.removeItem("user");
    setCart([]); // Clear cart when logging out
  };

  // Add item to the cart via API
  const addToCart = async (item) => {
    try {
      const response = await axios.post(
        "/api/cart/add",
        { productId: item.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` } },
      );
      setCart(response.data.items); // Update cart with the new data from the API
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // Remove item from the cart via API
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete("/api/cart/remove", {
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
        data: { productId: itemId },
      });
      setCart(response.data.items); // Update cart with the new data from the API
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Clear the cart via API
  const clearCart = async () => {
    try {
      const response = await axios.delete("/api/cart/clear", {
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
      });
      setCart(response.data.items); // Clear cart with data from the API
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cart,
        login,
        logout,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Prop validation for children
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures that children is required and is a valid React node
};

// Custom hook to use the Auth context (with cart management)
export const useAuth = () => useContext(AuthContext);
