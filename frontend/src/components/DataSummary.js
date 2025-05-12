import React from 'react';

const DataSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Rows:</span>
              <span className="font-medium">{summary.rows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Columns:</span>
              <span className="font-medium">{summary.columns}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Quality Check</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Missing Values:</span>
              <span className="font-medium">
                {summary.column_info.reduce((total, col) => total + col.missing_values, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Columns with Issues:</span>
              <span className="font-medium">
                {summary.column_info.filter(col => col.missing_values > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Column Details</h3>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Type</th>
              <th className="py-2 px-4 border-b text-left">Missing</th>
              <th className="py-2 px-4 border-b text-left">Unique Values</th>
              <th className="py-2 px-4 border-b text-left">Sample Values</th>
            </tr>
          </thead>
          <tbody>
            {summary.column_info.map((column, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 border-b">{column.name}</td>
                <td className="py-2 px-4 border-b">{column.dtype}</td>
                <td className={`py-2 px-4 border-b ${column.missing_values > 0 ? 'text-red-600 font-medium' : ''}`}>
                  {column.missing_values} ({column.missing_percentage.toFixed(1)}%)
                </td>
                <td className="py-2 px-4 border-b">{column.unique_values}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex flex-wrap gap-1">
                    {column.sample_values.map((value, i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {value.length > 15 ? value.substring(0, 15) + '...' : value}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {summary.column_info.some(col => col.missing_values > 0) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">Issues Detected</h3>
          <p className="text-gray-700">
            There are missing values in some columns. Continue to the next step to detect and fix these issues.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataSummary; 