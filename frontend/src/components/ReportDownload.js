import React, { useState } from 'react';
import axios from 'axios';

const ReportDownload = ({ originalFilepath, cleanedFilepath, appliedFixes }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    if (!originalFilepath || !cleanedFilepath) {
      setError('Missing file paths. Unable to generate report.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/generate-report', {
        original_filepath: originalFilepath,
        cleaned_filepath: cleanedFilepath,
        applied_fixes: appliedFixes
      });

      if (response.data && response.data.report_path) {
        // For local development, create a URL to access the report
        const reportPath = response.data.report_path;
        // Extract the filename from the path
        const filenameMatch = reportPath.match(/[^/\\]+$/);
        const filename = filenameMatch ? filenameMatch[0] : 'data_quality_report.html';
        
        // Create a URL to download the file - in a real app, you would serve this from a public directory
        // or create a specific endpoint to serve the file
        setReportUrl(`http://localhost:5000/api/reports/${filename}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.error || 'Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Quality Report</h2>
      
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-6">
        <div className="flex items-start">
          <svg 
            className="h-6 w-6 text-indigo-500 mr-2 mt-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-indigo-700">Generate Data Quality Report</h3>
            <p className="text-gray-700 mt-1">
              Create a comprehensive report summarizing the data quality issues and the fixes that were applied.
              This report can be shared with your team or stakeholders.
            </p>
          </div>
        </div>
      </div>
      
      {appliedFixes && appliedFixes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Applied Fixes Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <ul className="space-y-2">
              {appliedFixes.map((fix, index) => (
                <li key={index} className="flex items-start">
                  <svg 
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  {renderFixDescription(fix)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        {!reportUrl ? (
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !originalFilepath || !cleanedFilepath}
            className={`py-2 px-6 rounded-lg font-medium flex items-center justify-center ${
              isGenerating || !originalFilepath || !cleanedFilepath
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Report...
              </>
            ) : (
              <>
                <svg 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Generate Report
              </>
            )}
          </button>
        ) : (
          <a 
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-6 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            View Report
          </a>
        )}
        
        <button 
          onClick={() => window.location.reload()}
          className="py-2 px-6 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <svg 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Start New Analysis
        </button>
      </div>
    </div>
  );
};

// Helper function to render fix descriptions
const renderFixDescription = (fix) => {
  const issueType = fix.issue_type;
  
  if (issueType === 'missing_values') {
    return (
      <span>
        Fixed <strong>{fix.count}</strong> missing values in column <strong>{fix.column}</strong> using <strong>{fix.fix_method}</strong> method
        {fix.fix_method === 'constant' && ` (value: "${fix.constant_value}")`}
      </span>
    );
  } else if (issueType === 'duplicates') {
    return (
      <span>
        Removed <strong>{fix.count}</strong> duplicate rows using <strong>{fix.fix_method}</strong> method
      </span>
    );
  } else if (issueType === 'outliers') {
    return (
      <span>
        {fix.fix_method === 'cap' ? 
          `Capped ${fix.count} outliers in column ${fix.column} (range: ${fix.lower_bound.toFixed(2)} to ${fix.upper_bound.toFixed(2)})` :
          `Removed ${fix.count} rows with outliers in column ${fix.column}`
        }
      </span>
    );
  } else if (issueType === 'inconsistent_formats') {
    return (
      <span>
        Standardized formats in column <strong>{fix.column}</strong> to <strong>{fix.format}</strong> format
      </span>
    );
  }
  
  return <span>Applied fix: {JSON.stringify(fix)}</span>;
};

export default ReportDownload; 