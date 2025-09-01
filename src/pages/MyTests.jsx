import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";

const baseUrl = API_CONFIG.API_BASE;

export default function MyTests() {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await fetch(`${baseUrl}/tests/all`);
        const data = await response.json();
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    const loadStudents = async () => {
      try {
        const response = await fetch(`${baseUrl}/students`);
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    loadTests();
    loadStudents();
  }, []);

  const handleTestClick = (testId) => {
    navigate(`/test/${testId}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Test Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tests Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Tests</h2>
          {tests.length === 0 ? (
            <p className="text-gray-500">Loading tests...</p>
          ) : (
            <ul className="space-y-4">
              {tests.map((test) => (
                <li
                  key={test._id}
                  onClick={() => handleTestClick(test._id)}
                  className="p-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition"
                >
                  <div className="font-medium text-gray-800">{test.testName}</div>
                  {test.categories && (
                    <div className="mt-1 text-sm text-gray-500">
                      {test.categories.map(c => c.categoryName).join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Students</h2>
          {students.length === 0 ? (
            <p className="text-gray-500">Loading students...</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {students.map((student) => (
                <li key={student._id} className="py-2">
                  <div className="text-gray-800 font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
