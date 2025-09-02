import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_CONFIG } from "../config/api";

const baseUrl = API_CONFIG.API_BASE;

const tabs = ["Details", "Questions", "Assign Students"];

export default function TestDetailsPage() {
    const { testId } = useParams();
    const [activeTab, setActiveTab] = useState("Details");
    const [test, setTest] = useState(null);
    const [students, setStudents] = useState([]);
    const [assignedStudentIds, setAssignedStudentIds] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        const loadTest = async () => {
            const res = await fetch(`${baseUrl}/tests/${testId}`);
            const data = await res.json();
            setTest(data);
        };

        const loadStudents = async (params = {}) => {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${baseUrl}/students${query ? `?${query}` : ""}`);
            const data = await res.json();
            setStudents(data);
        };

        loadTest();
        // initial load - all students
        loadStudents();
    }, [testId]);

    const handleInputChange = (e) => {
        setTest({ ...test, [e.target.name]: e.target.value });
    };

    const updateTest = async () => {
        try {
            const response = await fetch(`${baseUrl}/tests/${testId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testName: test.testName,
                    description: test.description
                }),
            });

            if (response.ok) {
                alert("Test updated successfully!");
                // Reload the test data to reflect changes
                const updatedRes = await fetch(`${baseUrl}/tests/${testId}`);
                const updatedData = await updatedRes.json();
                setTest(updatedData);
            } else {
                const errorData = await response.text();
                alert(`Failed to update test: ${errorData}`);
            }
        } catch (error) {
            console.error("Error updating test:", error);
            alert(`Error updating test: ${error.message}`);
        }
    };

    const toggleStudent = (studentId) => {
        setAssignedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleAllStudents = () => {
        const visible = selectedYear ? (studentsByYear[selectedYear] || [])
            .filter(s => !selectedBranch || s.branch === selectedBranch)
            .filter(s => !selectedSection || s.section === selectedSection) : [];
        if (assignedStudentIds.length === visible.length) {
            // remove visible students from selection
            const visibleIds = new Set(visible.map(s => s._id));
            setAssignedStudentIds(prev => prev.filter(id => !visibleIds.has(id)));
        } else {
            // add all visible students (union)
            const visibleIds = visible.map(s => s._id);
            setAssignedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    const studentsByYear = students.reduce((acc, student) => {
        const year = student.year || "Unknown";
        if (!acc[year]) acc[year] = [];
        acc[year].push(student);
        return acc;
    }, {});

    const handleAssignStudents = async () => {
        if (!selectedYear) {
            alert("Please select a year before assigning students.");
            return;
        }

        try {
            const res = await fetch(`${baseUrl}/tests/${testId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentIds: assignedStudentIds,
                    year: parseInt(selectedYear),
                }),
            });

            if (res.ok) {
                alert("Students assigned successfully.");
            } else {
                alert("Failed to assign students.");
            }
        } catch (err) {
            console.error(err);
            alert("Error assigning students.");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Manage Test</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`pb-2 ${activeTab === tab
                            ? "border-b-2 border-black font-semibold"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab: Details */}
            {activeTab === "Details" && test && (
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium">Test Name</label>
                        <input
                            name="testName"
                            value={test.testName}
                            onChange={handleInputChange}
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Description</label>
                        <textarea
                            name="description"
                            value={test.description || ""}
                            onChange={handleInputChange}
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>
                    <button
                        onClick={updateTest}
                        className="px-4 py-2 bg-black text-white rounded"
                    >
                        Save Changes
                    </button>
                </div>
            )}

            {/* Tab: Questions */}
            {activeTab === "Questions" && test && (
                <div className="space-y-6">
                    {test.categories?.length === 0 ? (
                        <p>No categories found.</p>
                    ) : (
                        test.categories.map((cat) => (
                            <div key={cat._id}>
                                <h2 className="text-lg font-semibold mb-2">{cat.categoryName}</h2>
                                <ul className="list-disc list-inside space-y-1">
                                    {cat.questions.map((q, i) => (
                                        <li key={q._id}>
                                            <div>
                                                <strong>Q{i + 1}:</strong> {q.question}
                                            </div>
                                            <ul className="ml-4 list-decimal">
                                                {q.options.map((opt, idx) => (
                                                    <li key={idx}>
                                                        {opt}
                                                        {opt === q.correctAnswer && " (Correct)"}
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Assign Students */}
            {activeTab === "Assign Students" && (
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={(() => {
                                const visible = selectedYear ? (studentsByYear[selectedYear] || [])
                                    .filter(s => !selectedBranch || s.branch === selectedBranch)
                                    .filter(s => !selectedSection || s.section === selectedSection) : [];
                                return visible.length > 0 && visible.every(s => assignedStudentIds.includes(s._id));
                            })()}
                            onChange={toggleAllStudents}
                            disabled={!selectedYear}
                        />
                        <label className="font-medium">Select All Students</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-medium mb-1">Select Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            >
                                <option value="">-- Select Year --</option>
                                {Object.keys(studentsByYear)
                                    .sort((a, b) => b - a)
                                    .map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Filter by Branch</label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                disabled={!selectedYear}
                            >
                                <option value="">All Branches</option>
                                {selectedYear && Array.from(new Set((studentsByYear[selectedYear] || []).map(s => s.branch))).map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Filter by Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                disabled={!selectedYear}
                            >
                                <option value="">All Sections</option>
                                {selectedYear && Array.from(new Set((studentsByYear[selectedYear] || [])
                                    .filter(s => !selectedBranch || s.branch === selectedBranch)
                                    .map(s => s.section))).map(section => (
                                        <option key={section} value={section}>{section}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedYear && studentsByYear[selectedYear] && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">{selectedYear} Year</h2>
                            <ul className="space-y-2">
                                {studentsByYear[selectedYear]
                                    .filter(s => !selectedBranch || s.branch === selectedBranch)
                                    .filter(s => !selectedSection || s.section === selectedSection)
                                    .map((student) => (
                                    <li key={student._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={assignedStudentIds.includes(student._id)}
                                            onChange={() => toggleStudent(student._id)}
                                        />
                                        <span>
                                            {student.name} ({student.email}) - {student.branch}-{student.section}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handleAssignStudents}
                    >
                        Assign Students
                    </button>
                </div>
            )}

        </div>
    );
}
