// CSRF Token management utility
let csrfToken = null;

// Get CSRF token from server
export const getCsrfToken = async () => {
  try {
    const response = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include", // Include cookies
    });

    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    // Retry after a short delay
    setTimeout(() => {
      getCsrfToken();
    }, 1000);
  }
  return null;
};

// Get current CSRF token
export const getCurrentCsrfToken = () => {
  return csrfToken;
};

// Add CSRF token to request headers
export const addCsrfHeader = (headers = {}) => {
  if (csrfToken) {
    return {
      ...headers,
      "X-CSRF-Token": csrfToken,
    };
  }
  return headers;
};

// Initialize CSRF token on app startup
export const initializeCsrf = async () => {
  try {
    await getCsrfToken();
  } catch (error) {
    console.warn(
      "CSRF initialization failed, will retry on next request:",
      error
    );
  }
};
