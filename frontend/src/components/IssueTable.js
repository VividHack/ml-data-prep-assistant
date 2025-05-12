import React from 'react';

const IssueTable = ({ issues, onSelectFixes }) => {
  if (!issues || Object.keys(issues).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Issue Detection</h2>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-green-700">No issues were detected in your dataset. Great job!</p>
        </div>
      </div>
    );
  }

  // Count total issues
  const issueCount = Object.values(issues).reduce((count, category) => {
    return count + Object.keys(category).length;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Issue Detection</h2>
      
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
        <div className="flex items-start">
          <svg 
            className="h-6 w-6 text-yellow-500 mr-2 mt-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-700">Issues Detected</h3>
            <p className="text-gray-700">
              We found {issueCount} issues in your dataset that may affect your machine learning models.
              Review the suggestions below and select which fixes to apply.
            </p>
          </div>
        </div>
      </div>
      
      {/* Missing Values Section */}
      {issues.missing_values && (
        <IssueSection 
          title="Missing Values" 
          description="These columns have null or NaN values that could impact your analysis."
          icon={
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          color="red"
        >
          {Object.entries(issues.missing_values).map(([column, info]) => (
            <IssueItem 
              key={column}
              title={`Column: ${column}`}
              description={`${info.count} missing values (${info.percentage.toFixed(1)}% of data)`}
              color="red"
            />
          ))}
        </IssueSection>
      )}
      
      {/* Duplicates Section */}
      {issues.duplicates && (
        <IssueSection 
          title="Duplicates" 
          description="Duplicate rows were found in your dataset."
          icon={
            <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          color="orange"
        >
          {Object.entries(issues.duplicates).map(([key, info]) => (
            <IssueItem 
              key={key}
              title="Duplicate Rows"
              description={`${info.count} duplicates (${info.percentage.toFixed(1)}% of data)`}
              color="orange"
            />
          ))}
        </IssueSection>
      )}
      
      {/* Outliers Section */}
      {issues.outliers && (
        <IssueSection 
          title="Outliers" 
          description="These columns have unusual values that may skew your analysis."
          icon={
            <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
        >
          {Object.entries(issues.outliers).map(([column, info]) => (
            <IssueItem 
              key={column}
              title={`Column: ${column}`}
              description={`${info.count} outliers (${info.percentage.toFixed(1)}% of data)`}
              details={`Example values: ${info.example_values.map(v => v.toFixed(2)).join(', ')}`}
              color="purple"
            />
          ))}
        </IssueSection>
      )}
      
      {/* Inconsistent Formats Section */}
      {issues.inconsistent_formats && (
        <IssueSection 
          title="Inconsistent Formats" 
          description="These columns have inconsistent data formats."
          icon={
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
          color="blue"
        >
          {Object.entries(issues.inconsistent_formats).map(([column, info]) => (
            <IssueItem 
              key={column}
              title={`Column: ${column}`}
              description={`Inconsistent ${info.format_type} formats`}
              details={`Example values: ${info.example_values.join(', ')}`}
              color="blue"
            />
          ))}
        </IssueSection>
      )}
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => onSelectFixes(issues)}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Find Fixes for These Issues
        </button>
      </div>
    </div>
  );
};

// Helper components for rendering issue sections
const IssueSection = ({ title, description, icon, color, children }) => {
  const colorClasses = {
    red: 'bg-red-50 border-red-100',
    orange: 'bg-orange-50 border-orange-100',
    purple: 'bg-purple-50 border-purple-100',
    blue: 'bg-blue-50 border-blue-100',
  };

  const titleColors = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
    blue: 'text-blue-700',
  };

  return (
    <div className={`rounded-lg border p-4 mb-4 ${colorClasses[color]}`}>
      <div className="flex items-center mb-2">
        {icon}
        <h3 className={`text-lg font-semibold ml-2 ${titleColors[color]}`}>{title}</h3>
      </div>
      <p className="text-gray-700 text-sm mb-4">{description}</p>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

const IssueItem = ({ title, description, details, color }) => {
  const bgColors = {
    red: 'bg-red-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100',
    blue: 'bg-blue-100',
  };

  return (
    <div className={`rounded p-3 ${bgColors[color]}`}>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-700">{description}</div>
      {details && <div className="text-xs text-gray-600 mt-1">{details}</div>}
    </div>
  );
};

export default IssueTable; 