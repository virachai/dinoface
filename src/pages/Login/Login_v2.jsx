import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import SimpleNavbar from "../../components/layout/SimpleNavbar";
import SimpleFooter from "../../components/layout/SimpleFooter";
import uiStyle from "./Login.module.css";
import axiosInstance from "../../services/axiosInstance"; // Import axiosInstance
import Cookies from "js-cookie"; // Import js-cookie
import { useNavigate } from "react-router-dom"; // Import react-router-dom for redirection
import { useAuth } from "../../context/AuthContext"; // Import the Auth context

function Login() {
  const [username, setUsername] = useState("johndoe1");
  const [password, setPassword] = useState("P@ssword1");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth(); // Get login and checkAuthStatus from context

  const navigate = useNavigate(); // For programmatic redirection

  // Check if the user is already logged in (i.e., if the token exists)
  useEffect(() => {
    // Use the checkAuthStatus from context to check for the token
    const checkToken = () => {
      const token = Cookies.get("auth_token"); // Get the token from cookies
      if (token) {
        // If token exists, redirect to the dashboard
        navigate("/user/dashboard");
      }
    };

    checkToken(); // Run the check on component mount
  }, [navigate]); // Ensure that `navigate` is included as a dependency for useEffect

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      const response = await axiosInstance.post("/api/user/login", {
        username,
        password,
      });

      // Handle successful login
      if (response.status === 200) {
        console.log("Login successful");

        const { token, userId, username, fullname, email } = response.data;

        // Call the login function from the AuthContext
        login({ userId, username, fullname, email }, token);

        // Store the token in a cookie with an expiration time (e.g., 1 day)
        // Cookies.set("auth_token", token, { expires: 1 });

        // // Optionally store user details in local storage or context
        // localStorage.setItem(
        //   "user",
        //   JSON.stringify({
        //     userId: response.data.userId,
        //     username: response.data.username,
        //     fullname: response.data.fullname,
        //     email: response.data.email,
        //   }),
        // );

        // Redirect to dashboard after successful login
        navigate("/user/dashboard");
      }
    } catch (error) {
      setErrorMessage("Invalid username or password. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleNavbar />
      <main className={`mt-[64px] min-h-svh max-w-[1440px] ${uiStyle.mx_auto}`}>
        <section className="flex justify-center py-[64px]">
          <div className="w-full max-w-[768px]">
            <div className="flex-col items-center justify-start text-center">
              <h1 className="font-roboto text-center text-[32px] font-normal text-black">
                Let’s get you started
              </h1>
              <p className="font-roboto p-[32px] text-center text-[16px] font-normal text-black">
                Enter the detail to get going
              </p>
            </div>

            <div className="flex-col items-center justify-start text-center">
              <form className="w-full py-[24px]" onSubmit={handleLogin}>
                <div>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-left text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      maxLength="255"
                      minLength="5"
                      autoComplete="off"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="password"
                      className="block text-left text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        maxLength="255"
                        minLength="1"
                        autoComplete="off"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center bg-transparent pr-3 hover:border-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="my-6 flex justify-center">
                    <button
                      type={loading ? "button" : "submit"}
                      className="flex w-full max-w-[200px] justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="mt-2 text-sm text-red-500">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SimpleFooter />
    </>
  );
}

export default Login;
