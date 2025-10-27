// Authentication utility functions

const USER_STORAGE_KEY = "bookr_user";

/**
 * Save user data to localStorage
 */
export const saveUser = (userData) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    return false;
  }
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return getUser() !== null;
};

/**
 * Clear user data from localStorage (logout)
 * Also clears all user-related data: saved books, reviews, reviewed books, stats
 */
export const clearUser = () => {
  try {
    // Clear all bookr-related localStorage keys
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("bookr_saved_books");
    localStorage.removeItem("bookr_reviews");
    localStorage.removeItem("bookr_reviewed_books");
    localStorage.removeItem("bookr_stats");
    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);
    return false;
  }
};

/**
 * Update user data in localStorage
 */
export const updateUser = (updates) => {
  try {
    const currentUser = getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  } catch (error) {
    console.error("Error updating user data:", error);
    return null;
  }
};
