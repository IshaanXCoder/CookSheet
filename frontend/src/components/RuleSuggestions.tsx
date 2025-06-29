'use client'

import { useState, useEffect } from 'react'

interface RuleSuggestionsProps {
  onAcceptSuggestion: (suggestion: any) => void
  clientsData: any[]
  workersData: any[]
  tasksData: any[]
}

export default function RuleSuggestions({ 
  onAcceptSuggestion, 
  clientsData, 
  workersData, 
  tasksData 
}: RuleSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSuggestions = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8000/suggestions/ai-for-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clients_data: clientsData,
          workers_data: workersData,
          tasks_data: tasksData
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`)
      }

      const result = await response.json()
      setSuggestions(result.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch suggestions if we have some data
    if (clientsData.length > 0 || workersData.length > 0 || tasksData.length > 0) {
      fetchSuggestions()
    }
  }, [clientsData, workersData, tasksData])

  const handleAccept = (suggestion: any) => {
    onAcceptSuggestion(suggestion)
    // Remove accepted suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  if (clientsData.length === 0 && workersData.length === 0 && tasksData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">
            Upload some data first to get AI-powered rule suggestions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🧠 AI Rule Suggestions</h3>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh Suggestions'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Analyzing your data...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h4>
            <p className="text-gray-600">
              Your data looks good! No immediate rule suggestions needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        suggestion.type === 'loadBalance' ? 'bg-blue-100 text-blue-800' :
                        suggestion.type === 'priority' ? 'bg-red-100 text-red-800' :
                        suggestion.type === 'efficiency' ? 'bg-green-100 text-green-800' :
                        suggestion.type === 'skill_matching' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        suggestion.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                        suggestion.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(suggestion.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Suggested Rule:</p>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded">{suggestion.suggested_rule}</p>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      💡 {suggestion.impact}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAccept(suggestion)}
                    className="ml-4 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Accept Rule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 About AI Suggestions</h4>
          <p className="text-sm text-blue-800">
            These suggestions are based on analysis of your actual data. They identify patterns, 
            imbalances, and optimization opportunities specific to your uploaded datasets.
          </p>
        </div>
      )}
    </div>
  )
} 