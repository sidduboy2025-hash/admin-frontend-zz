import { useEffect, useState } from "react";
import { fetchTests, fetchQuestions, updateQuestion, deleteQuestion } from "../api/testApi";
import { buildApiUrl, API_CONFIG } from "../config/api";

const API_BASE = API_CONFIG.API_BASE;

export default function ManageQuestions() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTests()
      .then((data) => {
        console.log("Fetched tests:", data);
        setTests(data);
      })
      .catch((error) => console.error("Error fetching tests:", error));
  }, []);

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
  

  const loadQuestions = async (testId) => {
    console.log("Selected Test ID:", testId);
    setSelectedTest(testId);
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.QUESTIONS(testId)));
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Questions:", data);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(`Error fetching questions: ${error.message}`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (question) => {
    setEditingQuestion({ ...question });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS.UPDATE(editingQuestion._id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editingQuestion.question,
          options: editingQuestion.options,
          correctAnswer: editingQuestion.correctAnswer
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update question (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      setSuccess("Question updated successfully!");
      setEditingQuestion(null);
      await loadQuestions(selectedTest);
    } catch (error) {
      console.error("Error updating question:", error);
      setError(`Error updating question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS.DELETE(questionId)), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete question (${response.status}): ${errorText}`);
      }

      setSuccess("Question deleted successfully!");
      setQuestions(questions.filter((q) => q._id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
      setError(`Error deleting question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Questions</h2>
      
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
      
      <select 
        className="border p-2 rounded w-full mb-4" 
        onChange={(e) => loadQuestions(e.target.value)}
        disabled={loading}
      >
        <option>Select Test</option>
        {tests.map((test) => (
          <option key={test._id} value={test._id}>
            {test.testName}
          </option>
        ))}
      </select>

      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {questions.map((q) => (
        <div key={q._id} className="border p-4 mb-2 rounded flex justify-between">
          {editingQuestion && editingQuestion._id === q._id ? (
            <div className="w-full">
              <input
                type="text"
                className="border p-2 rounded w-full mb-2"
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                placeholder="Question text"
              />
              {editingQuestion.options && editingQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="border p-2 rounded flex-1 mr-2"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...editingQuestion.options];
                      newOptions[idx] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    }}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editingQuestion.correctAnswer === idx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: idx })}
                      className="mr-1"
                    />
                    <span className="text-sm">Correct</span>
                  </label>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button 
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50" 
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button 
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600" 
                  onClick={() => {
                    setEditingQuestion(null);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <p className="font-semibold mb-2">{q.question}</p>
              <ul className="list-disc ml-6 mb-4">
                {q.options && q.options.map((opt, idx) => (
                  <li key={idx} className={`${q.correctAnswer === idx ? 'text-green-600 font-semibold' : ''}`}>
                    {opt} {q.correctAnswer === idx && '(Correct)'}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button 
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50" 
                  onClick={() => handleEdit(q)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50" 
                  onClick={() => handleDelete(q._id)}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
