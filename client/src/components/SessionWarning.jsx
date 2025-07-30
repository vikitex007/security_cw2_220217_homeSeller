import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) return;

    let warningTimeout;
    let countdownInterval;

    const startWarningTimer = () => {
      // Show warning 30 seconds before logout
      warningTimeout = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(30);
        
        // Start countdown
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 4.5 * 60 * 1000); // 4.5 minutes (30 seconds before 5 minutes)
    };

    const resetTimers = () => {
      if (warningTimeout) clearTimeout(warningTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
      setShowWarning(false);
      setTimeLeft(0);
      startWarningTimer();
    };

    // Reset timers on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimers, true);
    });

    // Start initial timer
    startWarningTimer();

    return () => {
      if (warningTimeout) clearTimeout(warningTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(event => {
        document.removeEventListener(event, resetTimers, true);
      });
    };
  }, [currentUser]);

  if (!showWarning || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Session Timeout Warning</h3>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Your session will expire in <span className="font-semibold text-red-600">{timeLeft}</span> seconds due to inactivity.
          </p>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => setShowWarning(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
} 