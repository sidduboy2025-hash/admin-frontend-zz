import { useLocation } from "react-router-dom";

export default function QuizPage() {
  const location = useLocation();
  const { questions } = location.state || { questions: [] };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Test</h2>
      {questions.map((q, idx) => (
        <div key={idx} className="mb-6">
          <p className="font-semibold">{idx + 1}. {q.question}</p>
          <ul className="list-disc pl-5">
            {q.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
