import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, API_CONFIG } from "../config/api";

export default function StartTest() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.ALL), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("API response:", data);
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    loadTests();
  }, []);

  const handleTestClick = (testId) => {
    // Navigate to the test-specific page (e.g., /test/:id)
    navigate(`/test/${testId}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test List</h2>
      {tests.length === 0 ? (
        <p>Loading tests...</p>
      ) : (
        <ul>
          {tests.map((test) => (
            <li
              key={test._id}
              className="mb-2 cursor-pointer hover:underline"
              onClick={() => handleTestClick(test._id)}
            >
              {test.testName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
