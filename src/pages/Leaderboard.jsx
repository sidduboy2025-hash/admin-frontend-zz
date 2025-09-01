import { useState, useEffect } from "react";
import { fetchOverallLeaderboard } from "../api/testApi";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSpecificYear, setSelectedSpecificYear] = useState("");
  const [selectedLimit, setSelectedLimit] = useState("25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate years from 2020 to current year + 4
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 4 - 2020 + 1 }, (_, i) => 2020 + i);
  const branches = ["CSE", "ECE", "EEE", "AIDS", "AI", "DS", "CS", "MECH", "CIVIL", "ECM", "IT"];
  const sections = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const limits = ["10", "15", "20", "25", "50", "100"];

  const loadLeaderboard = async () => {
    if (!selectedYear) return;
    
    setLoading(true);
    setError("");
    
    try {
      const filters = {};
      
      // Add filters based on selections
      if (selectedBranch) filters.branch = selectedBranch;
      if (selectedSection) filters.section = selectedSection;
      if (selectedSpecificYear) filters.specificYear = selectedSpecificYear;
      if (selectedLimit && selectedLimit !== '25') filters.limit = selectedLimit;
      
      const data = await fetchOverallLeaderboard(selectedYear, filters);
      setLeaderboardData(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(`Error fetching leaderboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    // Reset section when branch changes
    if (!e.target.value) {
      setSelectedSection("");
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleSpecificYearChange = (e) => {
    setSelectedSpecificYear(e.target.value);
  };

  const handleLimitChange = (e) => {
    setSelectedLimit(e.target.value);
  };

  const handleFetchLeaderboard = () => {
    loadLeaderboard();
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-blue-500 text-white";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Overall Leaderboard</h1>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            {/* Context Year */}
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                Context Year <span className="text-red-500">*</span>
              </label>
              <select
                id="graduationYear"
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label htmlFor="branchFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Filter
              </label>
              <select
                id="branchFilter"
                value={selectedBranch}
                onChange={handleBranchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label htmlFor="sectionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Section Filter
              </label>
              <select
                id="sectionFilter"
                value={selectedSection}
                onChange={handleSectionChange}
                disabled={!selectedBranch}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Year Filter */}
            <div>
              <label htmlFor="specificYear" className="block text-sm font-medium text-gray-700 mb-1">
                Specific Year
              </label>
              <select
                id="specificYear"
                value={selectedSpecificYear}
                onChange={handleSpecificYearChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Limit */}
            <div>
              <label htmlFor="resultLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Result Limit
              </label>
              <select
                id="resultLimit"
                value={selectedLimit}
                onChange={handleLimitChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {limits.map((limit) => (
                  <option key={limit} value={limit}>
                    Top {limit}
                  </option>
                ))}
              </select>
            </div>

            {/* Fetch Button */}
            <div className="flex items-end">
              <button
                onClick={handleFetchLeaderboard}
                disabled={loading || !selectedYear}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Loading..." : "Fetch Leaderboard"}
              </button>
            </div>
          </div>

          {/* Applied Filters Display */}
          {leaderboardData?.appliedFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Applied Filters:</h3>
              <div className="text-xs text-blue-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>Branch: {leaderboardData.appliedFilters.branch}</div>
                <div>Section: {leaderboardData.appliedFilters.section}</div>
                <div>Year: {leaderboardData.appliedFilters.specificYear}</div>
                <div>Limit: {leaderboardData.appliedFilters.limit}</div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading leaderboard...</p>
          </div>
        )}

        {/* Leaderboard Data */}
        {leaderboardData && !loading && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Students with Scores</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {leaderboardData.totalStudentsEvaluated}
                </p>
                <p className="text-sm text-gray-500 mt-1">Students who have taken tests</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-green-600">
                  {leaderboardData.totalStudentsInYear}
                </p>
                <p className="text-sm text-gray-500 mt-1">Students registered for {leaderboardData.graduationYear}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Collections Processed</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {leaderboardData.totalCollectionsProcessed || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Test collections</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Categories</h3>
                <p className="text-sm text-gray-600">
                  {leaderboardData.categories.join(", ")}
                </p>
                <p className="text-sm text-gray-500 mt-1">Available test categories</p>
              </div>
            </div>

            {/* Data Source Info */}
            {leaderboardData.message && leaderboardData.message.includes('Generated from students data') && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    <strong>Info:</strong> This leaderboard was generated from the student collections database. 
                    The data is current and includes all students with recorded test scores.
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Top Students Leaderboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {leaderboardData.message}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch & Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      {/* Category Breakdown column removed per requirement */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardData.overallLeaderboard.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(
                              student.rank
                            )}`}
                          >
                            {student.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Roll No: {student.rollno}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {student.branch}
                            </div>
                            <div className="text-sm text-gray-500">
                              Section: {student.section}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              Total Score: <span className="text-blue-600 font-bold">{student.totalScore}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Tests: {student.totalTests} | Avg: {student.averageScore}
                            </div>
                          </div>
                        </td>
                        {/* Category Breakdown cell removed */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty state */}
              {leaderboardData.overallLeaderboard.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Students Found</h3>
                  <p className="text-gray-500 mb-2">{leaderboardData.message}</p>
                  {leaderboardData.totalStudentsInYear > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 mx-4">
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Note:</strong> There are {leaderboardData.totalStudentsInYear} students registered for {leaderboardData.graduationYear}, 
                        but {leaderboardData.totalStudentsEvaluated === 0 ? 'none have taken any tests yet' : 'none have scores greater than 0'}.
                      </p>
                      {leaderboardData.totalStudentsEvaluated === 0 && (
                        <div className="text-sm text-blue-700">
                          <p className="mb-2"><strong>Possible actions:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Check if tests are available and active for this year</li>
                            <li>Verify that students have the correct test links</li>
                            <li>Ensure students are registered with the correct graduation year</li>
                            <li>Contact students to encourage test participation</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data Selected */}
        {!leaderboardData && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Fetch Overall Leaderboard</h3>
            <p className="text-gray-500">Click "Fetch Leaderboard" above to view the overall rankings with your selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
