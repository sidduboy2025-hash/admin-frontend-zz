import React, { useState, useEffect, useCallback } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_CONFIG } from "../config/api";
import { authenticatedFetch } from "../utils/api";

const INITIAL_FORM = {
  year: "",
  test: "",
  branch: "",
  section: "",
  category: "",
};

const YEARS = ["2026", "2027", "2028", "2029"];
const BRANCHES = ["CSE", "ECE", "EEE", "AIDS", "AI", "DS", "CS", "MECH", "CIVIL", "ECM", "IT"];
const SECTIONS = ["1", "2", "3", "4", "5", "6", "7" , "8"];
const CATEGORIES = ["Coding", "Aptitude", "Reasoning", "Verbal"];

const API_BASE = API_CONFIG.API_BASE;

export default function Dashboard() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [tests, setTests] = useState([]);
  const [ranks, setRanks] = useState(null);
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate pagination values
  const totalPages = ranks ? Math.ceil(ranks.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = ranks ? ranks.slice(startIndex, endIndex) : [];

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Reset pagination when new data is loaded
  const resetPagination = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE}/tests/all`);
        const data = await res.json();
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchTests();
  }, []);

  useEffect(() => {
    resetPagination();
  }, [ranks]);

  const handleProceed = useCallback(async () => {
    const { year, test, branch, section, category } = formData;

    if (!year || !test) {
      alert("Passing Out Year and Test are mandatory!");
      return;
    }

    setLoading(true);
    try {
      const studentsResponse = await authenticatedFetch(`${API_BASE}/students?year=${year}`);
      const studentsData = await studentsResponse.json();

      const processedData = studentsData.map((student) => {
        let categoryMarks = 0;

        const totalMarks = student.assignedTests.reduce((total, assignedTest) => {
          const matchedTest = tests.find(
            (t) => t.testName === test && t._id === assignedTest.testId
          );

          if (matchedTest) {
            if (category) {
              const mark = assignedTest.marks?.[category];
              // console.log(mark);
              if (typeof mark === "number") categoryMarks += mark;
              return total + (typeof mark === "number" ? mark : 0);
            } else {
              const marks = Object.values(assignedTest.marks || {});
              return total + marks.reduce((sum, mark) => sum + mark, 0);
            }
          }
          return total;
        }, 0);
        // console.log(categoryMarks);

        return {
          ...student,
          totalMarks,
          ...(category ? { categoryMark: categoryMarks } : {})
        };
      });

      const filteredData = processedData.filter((student) => {
        const matchesBranch = branch ? student.branch === branch : true;
        const matchesSection = section ? student.section === section : true;
        const matchesCategory = category
          ? student.assignedTests.some((assignedTest) => {
            const isTestMatched =
              assignedTest.testId === tests.find((t) => t.testName === test)?._id;
            const hasCategory = Object.keys(assignedTest.marks || {}).includes(category);
            return isTestMatched && hasCategory;
          })
          : true;

        return matchesBranch && matchesSection && matchesCategory;
      });

      filteredData.sort((a, b) => b.totalMarks - a.totalMarks);

      const rankedData = filteredData.map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

      setRanks(rankedData || []);
      resetPagination(); // Reset to first page when new data is loaded
    } catch (error) {
      console.error("Error getting ranks:", error);
      setRanks([]);
      resetPagination();
    } finally {
      setLoading(false);
    }
  }, [formData, tests]);

  const generatePDF = async () => {
    if (!ranks || ranks.length === 0) {
      alert('No data available to generate PDF. Please fetch the reports first.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add Vignan logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/images/vignan-logo.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        setTimeout(reject, 3000); // 3 second timeout
      });
      
      // Add logo to PDF
      const logoWidth = 40;
      const logoHeight = 20;
      const logoX = (pageWidth - logoWidth) / 2;
      pdf.addImage(logoImg, 'PNG', logoX, 15, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Logo could not be loaded:', error);
    }
    
    // Header with university colors
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102); // Dark blue color
    pdf.text("VIGNAN'S INSTITUTE OF INFORMATION TECHNOLOGY", pageWidth / 2, 45, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51); // Dark gray
    pdf.text('Student Assessment Report', pageWidth / 2, 55, { align: 'center' });
    
    // Add a decorative line
    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(20, 60, pageWidth - 20, 60);
    
    // Report details section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('Report Details', 20, 75);
    
    pdf.setFontSize(11);
    let yPosition = 85;
    
    const reportInfo = [
      ['Academic Year:', formData.year || 'All Years'],
      ['Test Name:', formData.test || 'All Tests'],
      ['Branch:', formData.branch || 'All Branches'],
      ['Section:', formData.section || 'All Sections'],
      ['Category:', formData.category || 'All Categories'],
      ['Total Students:', ranks.length.toString()],
      ['Generated On:', new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })]
    ];
    
    reportInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text(label, 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(value, 80, yPosition);
      yPosition += 7;
    });
    
    // Table section
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('Student Rankings', 20, yPosition);
    yPosition += 10;
    
    // Table header with better styling
    pdf.setFillColor(0, 51, 102); // Dark blue background
    pdf.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255); // White text
    const headers = ['Rank', 'Reg No', 'Student Name', 'Total Marks'];
    if (formData.category) {
      headers.push(`${formData.category} Marks`);
    }
    
    const colWidths = formData.category ? [20, 35, 70, 30, 30] : [25, 45, 80, 35];
    let xPosition = 20;
    
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 12;
    
    // Table data with better formatting
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    
    ranks.forEach((student, index) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = 20;
        
        // Add header on new page
        pdf.setFillColor(0, 51, 102);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        
        xPosition = 20;
        headers.forEach((header, i) => {
          pdf.text(header, xPosition, yPosition);
          xPosition += colWidths[i];
        });
        
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
      }
      
      // Alternate row coloring
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(15, yPosition - 3, pageWidth - 30, 8, 'F');
      }
      
      // Highlight top 3 ranks
      if (student.rank <= 3) {
        pdf.setFillColor(255, 245, 157); // Light yellow for top 3
        pdf.rect(15, yPosition - 3, pageWidth - 30, 8, 'F');
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      xPosition = 20;
      const rowData = [
        student.rank.toString(),
        student.rollno,
        student.name.length > 25 ? student.name.substring(0, 25) + '...' : student.name,
        student.totalMarks.toString()
      ];
      
      if (formData.category) {
        rowData.push((student.categoryMark ?? 'N/A').toString());
      }
      
      rowData.forEach((data, colIndex) => {
        pdf.text(data, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });
      
      yPosition += 8;
    });
    
    // Summary statistics
    if (ranks.length > 0) {
      const totalMarks = ranks.map(s => s.totalMarks);
      const avgMarks = (totalMarks.reduce((a, b) => a + b, 0) / totalMarks.length).toFixed(2);
      const maxMarks = Math.max(...totalMarks);
      const minMarks = Math.min(...totalMarks);
      
      yPosition += 15;
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 51, 102);
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Average Score: ${avgMarks}`, 20, yPosition);
      pdf.text(`Highest Score: ${maxMarks}`, 20, yPosition + 7);
      pdf.text(`Lowest Score: ${minMarks}`, 20, yPosition + 14);
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(128, 128, 128);
    pdf.text("This is a computer-generated report from Vignan's Institute of Information Technology Assessment System", 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text('Generated automatically - No signature required', 
             pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `VIIT_Assessment_Report_${formData.test || 'All'}_${formData.year || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const renderSelect = (label, key, options, required = false, disabled = false) => (
    <div key={key}>
      <label htmlFor={key} className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={key}
        value={formData[key]}
        onChange={handleChange(key)}
        disabled={disabled}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none bg-gray-50"
      >
        <option value="">-- Choose an option --</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  // Pagination component
  const renderPagination = () => {
    if (!ranks || ranks.length <= itemsPerPage) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          First
        </button>
        
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-2 text-sm rounded-md ${
              currentPage === number
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 ">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">Dashboard</h1>
          <p className="mb-6 text-gray-600 text-center">Welcome to the Admin Panel</p>

          <div className="space-y-4">
            {renderSelect("Passing Out Year", "year", YEARS, true)}
            {renderSelect("Select Test", "test", tests.map((t) => t.testName), true)}
            {renderSelect("Branch", "branch", BRANCHES)}
            {renderSelect("Section", "section", SECTIONS, false, !(formData.year && formData.branch))}
            {renderSelect("Category", "category", CATEGORIES)}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleProceed}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Loading..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Students Ranks</h2>

          {ranks ? (
            ranks.length > 0 ? (
              <div>
                {/* Summary info */}
                <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
                  <span>Total Students: {ranks.length}</span>
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, ranks.length)} of {ranks.length}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 border text-left text-sm">Rank</th>
                        <th className="py-2 px-3 border text-left text-sm">Reg No</th>
                        <th className="py-2 px-3 border text-left text-sm">Name</th>
                        <th className="py-2 px-3 border text-left text-sm">Total</th>
                        {formData.category && (
                          <th className="py-2 px-3 border text-left text-sm">{formData.category}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageData.map((student, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="py-2 px-3 border text-sm">{student.rank}</td>
                          <td className="py-2 px-3 border text-sm">{student.rollno}</td>
                          <td className="py-2 px-3 border text-sm">{student.name}</td>
                          <td className="py-2 px-3 border text-sm">{student.totalMarks}</td>
                          {formData.category && (
                            <td className="py-2 px-3 border text-sm">
                              {student.categoryMark ?? "N/A"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 18l-6-6 6-6" 
                        />
                      </svg>
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <span>Next</span>
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 6l6 6-6 6" 
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                </div>
                {renderPagination()}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={generatePDF}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <span className="text-lg">Download PDF Report</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-md">
                <p className="text-gray-600">No student rank data available.</p>
              </div>
            )
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded-md h-64 flex items-center justify-center">
              <p className="text-gray-600">
                Select the fields. "Passing Out Year" and "Test" are mandatory to fetch the leaderboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
