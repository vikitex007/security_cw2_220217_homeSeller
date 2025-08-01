import { store } from "../redux/store";
import { signOutUserSuccess } from "../redux/user/userSlice";

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.inactivityTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.isActive = true;
    this.init();
  }

  init() {
    // Reset timer on user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });

    // Reset timer on page visibility change
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.resetTimer();
      }
    });

    // Start the initial timer
    this.resetTimer();
  }

  resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Only set timer if user is logged in
    const state = store.getState();
    if (state.user.currentUser) {
      this.timeoutId = setTimeout(() => {
        this.handleInactivity();
      }, this.inactivityTimeout);
    }
  }

  handleInactivity() {
    console.log("Session expired due to inactivity");

    // Clear the session
    store.dispatch(signOutUserSuccess());

    // Clear persisted Redux state
    localStorage.removeItem("persist:root");
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirect to sign-in page
    window.location.href = "/sign-in";
  }

  // Method to manually extend session (can be called from components)
  extendSession() {
    this.resetTimer();
  }

  // Method to clear session manually
  clearSession() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// Create and export a single instance
const sessionManager = new SessionManager();
export default sessionManager;
