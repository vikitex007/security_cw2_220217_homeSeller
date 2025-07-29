import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, security, login, transactions
  
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '/api/activity/logs';
      
      switch (filter) {
        case 'security':
          endpoint = '/api/activity/security';
          break;
        case 'login':
          endpoint = '/api/activity/login-history';
          break;
        case 'transactions':
          endpoint = '/api/activity/transaction-logs';
          break;
        default:
          endpoint = '/api/activity/logs';
      }
      
      const res = await fetch(`${endpoint}?page=${page}&limit=20`);
      const data = await res.json();
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      const logsData = data.logs || data.securityLogs || data.loginHistory || data.transactionLogs || [];
      setLogs(logsData);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format = 'json') => {
    try {
      const res = await fetch(`/api/activity/export?format=${format}`);
      
      if (format === 'csv') {
        const blob = new Blob([await res.text()], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_logs.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_logs.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Failed to export logs');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-800">Activity Logs</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Activities</option>
            <option value="security">Security Events</option>
            <option value="login">Login History</option>
            <option value="transactions">Transaction Logs</option>
          </select>
          <button
            onClick={() => exportLogs('json')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportLogs('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity logs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {formatAction(log.action)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(log.createdAt)}
                </span>
              </div>
              
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="mb-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              {log.ipAddress && (
                <div className="text-xs text-gray-500">
                  IP: {log.ipAddress}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 