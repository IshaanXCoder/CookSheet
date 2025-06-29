'use client'

interface ValidationSummaryProps {
  validationResult: any
  onFixSuggestion: (error: any) => void
}

export default function ValidationSummary({ validationResult, onFixSuggestion }: ValidationSummaryProps) {
  if (!validationResult) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Validation Data</h3>
          <p className="text-gray-600">
            Upload some data first to see validation results.
          </p>
        </div>
      </div>
    )
  }

  const { is_valid, total_errors, total_warnings, errors = [], warnings = [], summary = {} } = validationResult

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔍 Data Validation Results</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {is_valid ? '✅ Valid' : '❌ Issues Found'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{total_errors || 0}</div>
            <div className="text-sm text-red-800">Critical Errors</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{total_warnings || 0}</div>
            <div className="text-sm text-yellow-800">Warnings</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{(errors?.length || 0) + (warnings?.length || 0)}</div>
            <div className="text-sm text-blue-800">Total Issues</div>
          </div>
        </div>

        {is_valid && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              🎉 All validation checks passed! Your data is ready for processing.
            </p>
          </div>
        )}
      </div>

      {/* Critical Errors */}
      {errors && errors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-red-900 mb-4">🚨 Critical Errors</h4>
          <div className="space-y-3">
            {errors.map((error: any, index: number) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        {error.error_type?.replace('_', ' ') || 'Error'}
                      </span>
                      {error.column && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Column: {error.column}
                        </span>
                      )}
                      {error.row_index >= 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Row: {error.row_index + 1}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-red-800 font-medium mb-1">{error.message}</p>
                    
                    {error.suggested_fix && (
                      <p className="text-red-600 text-sm">
                        💡 Suggestion: {error.suggested_fix}
                      </p>
                    )}
                    
                    {error.cell_value !== null && error.cell_value !== undefined && (
                      <p className="text-gray-600 text-xs mt-2">
                        Current value: "{error.cell_value}"
                      </p>
                    )}
                  </div>
                  
                  {error.suggested_fix && (
                    <button
                      onClick={() => onFixSuggestion(error)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Fix
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Warnings</h4>
          <div className="space-y-3">
            {warnings.map((warning: any, index: number) => (
              <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        {warning.error_type?.replace('_', ' ') || 'Warning'}
                      </span>
                      {warning.column && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Column: {warning.column}
                        </span>
                      )}
                      {warning.row_index >= 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Row: {warning.row_index + 1}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-yellow-800 font-medium mb-1">{warning.message}</p>
                    
                    {warning.suggested_fix && (
                      <p className="text-yellow-600 text-sm">
                        💡 Suggestion: {warning.suggested_fix}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary by Error Type */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Issues Summary</h4>
          <div className="space-y-3">
            {Object.entries(summary).map(([errorType, details]: [string, any]) => (
              <div key={errorType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 capitalize">
                    {errorType.replace('_', ' ')}
                  </h5>
                  <span className={`px-2 py-1 text-xs rounded ${
                    details.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {details.count} issues
                  </span>
                </div>
                
                {details.examples && details.examples.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Examples:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {details.examples.slice(0, 3).map((example: any, idx: number) => (
                        <li key={idx}>
                          {example.column && `Column "${example.column}"`}
                          {example.row >= 0 && ` (Row ${example.row + 1})`}: {example.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {validationResult.recommendations && validationResult.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">🎯 Recommendations</h4>
          <ul className="space-y-2">
            {validationResult.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-blue-800 text-sm">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 