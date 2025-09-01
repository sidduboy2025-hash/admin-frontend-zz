import { useEffect, useState } from "react";
import { fetchTests } from "../api/testApi";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, API_CONFIG } from "../config/api";

const API_BASE = API_CONFIG.API_BASE;

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTests(tests);
    } else {
      setFilteredTests(tests.filter(test => (test.status || 'offline') === statusFilter));
    }
  }, [tests, statusFilter]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const loadTests = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchTests();
      console.log("Fetched tests:", data);
      setTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError(`Error fetching tests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test) => {
    setEditingTest({ ...test });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.UPDATE(editingTest._id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName: editingTest.testName,
          description: editingTest.description || "",
          status: editingTest.status || "offline"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update test (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      setSuccess("Test updated successfully!");
      setEditingTest(null);
      await loadTests();
    } catch (error) {
      console.error("Error updating test:", error);
      setError(`Error updating test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.DELETE(testId)), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete test (${response.status}): ${errorText}`);
      }

      setSuccess("Test deleted successfully!");
      setTests(tests.filter((t) => t._id !== testId));
    } catch (error) {
      console.error("Error deleting test:", error);
      setError(`Error deleting test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManageQuestions = (testId) => {
    navigate(`/test/${testId}`);
  };

  const handleStatusChange = async (testId, newStatus) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.STATUS(testId)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update test status (${response.status}): ${errorText}`);
      }

      setSuccess(`Test status updated to ${newStatus} successfully!`);
      
      // Update the test status in the local state
      setTests(tests.map(test => 
        test._id === testId 
          ? { ...test, status: newStatus }
          : test
      ));
    } catch (error) {
      console.error("Error updating test status:", error);
      setError(`Error updating test status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Tests</h2>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tests</option>
            <option value="live">Live Tests</option>
            <option value="offline">Offline Tests</option>
          </select>
        </div>
      </div>
      
      {/* Test Count Display */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTests.length} of {tests.length} tests
        {statusFilter !== "all" && ` (${statusFilter} only)`}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      <div className="space-y-4">
        {filteredTests.map((test) => (
          <div key={test._id} className={`border p-6 rounded-lg bg-white shadow-sm ${
            test.status === 'live' 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200'
          }`}>
            {editingTest && editingTest._id === test._id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editingTest.testName}
                    onChange={(e) => setEditingTest({ ...editingTest, testName: e.target.value })}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={editingTest.description || ""}
                    onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                    placeholder="Enter test description (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Status</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editingTest.status || 'offline'}
                    onChange={(e) => setEditingTest({ ...editingTest, status: e.target.value })}
                  >
                    <option value="offline">Offline</option>
                    <option value="live">Live</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Live tests are available for students to take, offline tests are not accessible.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    onClick={handleSaveEdit}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" 
                    onClick={() => {
                      setEditingTest(null);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{test.testName}</h3>
                    {test.description && (
                      <p className="text-gray-600 mb-2">{test.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>Created: {new Date(test.createdAt).toLocaleDateString()}</p>
                      {test.categories && test.categories.length > 0 && (
                        <p>Categories: {test.categories.map(cat => cat.categoryName).join(', ')}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <span className="mr-2">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.status === 'live' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.status === 'live' ? '🟢 Live' : '⭕ Offline'}
                        </span>
                        <select
                          value={test.status || 'offline'}
                          onChange={(e) => handleStatusChange(test._id, e.target.value)}
                          className="ml-3 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          <option value="offline">Offline</option>
                          <option value="live">Live</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors" 
                    onClick={() => handleEdit(test)}
                    disabled={loading}
                  >
                    Edit Test
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors" 
                    onClick={() => handleManageQuestions(test._id)}
                    disabled={loading}
                  >
                    Manage Questions
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      test.status === 'live' 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    onClick={() => handleStatusChange(test._id, test.status === 'live' ? 'offline' : 'live')}
                    disabled={loading}
                  >
                    {test.status === 'live' ? 'Set Offline' : 'Set Live'}
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors" 
                    onClick={() => handleDelete(test._id)}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Test"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {statusFilter === "all" 
              ? "No tests found. Create a test to get started." 
              : `No ${statusFilter} tests found.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
