import { useState } from "react";
import { buildApiUrl, API_CONFIG } from "./src/config/api";

export default function CreateTest() {
  const [testName, setTestName] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categoriesOptions = ["Coding", "Math", "Behavioral", "Aptitude"];

  const handleCreateTest = async () => {
    if (!testName.trim() || !questionsText.trim() || !selectedCategory) {
      alert("Please fill all fields including category!");
      return;
    }

    // Create the payload in the expected format:
    const payload = {
      testName,
      categoryName: selectedCategory,
      questionsText, // Sending the raw questions text
    };

    console.log("Payload sent to API:", payload);
    alert("Initiating API call. Check console for payload details.");

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.CREATE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("API response:", response);

      const resultText = await response.text();
      console.log("Result text from API:", resultText);
      
      alert("API call completed: " + resultText);
      
      // Clear only the questions text and the selected category,
      // keeping the testName intact for further uploads.
      setQuestionsText("");
      setSelectedCategory("");
    } catch (error) {
      console.error("Error during API call:", error);
      alert("Error creating test: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Test</h2>

      <input
        type="text"
        placeholder="Enter test name"
        className="border p-2 rounded w-full mb-4"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
      />

      <div className="mb-4">
        <p className="mb-2 font-semibold">Select Category:</p>
        <div className="flex flex-wrap gap-2">
          {categoriesOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`border px-3 py-1 rounded ${
                selectedCategory === cat ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={10}
        placeholder={`Format:
Question Text (opt1, opt2, opt3, opt4) [correctAnswer]

Example:
What is 2+2? (2, 3, 4, 5) [4]
Who is CEO of Tesla? (Jeff, Elon, Bill, Mark) [Elon]`}
        className="border p-2 rounded w-full mb-4"
        value={questionsText}
        onChange={(e) => setQuestionsText(e.target.value)}
      ></textarea>

      <button
        type="button"
        className="bg-blue-500 text-white p-2 rounded w-full"
        onClick={handleCreateTest}
      >
        Save Test
      </button>
    </div>
  );
}
