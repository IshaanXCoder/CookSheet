'use client'

import { useState } from 'react'

interface NLModifyProps {
  clientsData: any[]
  workersData: any[]
  tasksData: any[]
  onDataUpdate: (type: string, newData: any[]) => void
}

export default function NLModify({ clientsData, workersData, tasksData, onDataUpdate }: NLModifyProps) {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a modification command')
      return
    }

    if (clientsData.length === 0 && workersData.length === 0 && tasksData.length === 0) {
      setError('No data available to modify. Please upload data first.')
      return
    }

    setIsProcessing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/modify/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          clients_data: clientsData,
          workers_data: workersData,
          tasks_data: tasksData
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process modification: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)

      // Update the data in parent component if modifications were made
      if (data.total_changes > 0) {
        if (data.modified_clients && data.modified_clients.length > 0) {
          onDataUpdate('clients', data.modified_clients)
        }
        if (data.modified_workers && data.modified_workers.length > 0) {
          onDataUpdate('workers', data.modified_workers)
        }
        if (data.modified_tasks && data.modified_tasks.length > 0) {
          onDataUpdate('tasks', data.modified_tasks)
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process modification')
    } finally {
      setIsProcessing(false)
    }
  }

  const examples = [
    'Set all high priority tasks to duration 8 hours',
    'Change all workers with Python skills to max load 10',
    'Update client TechCorp budget to 75000',
    'Set priority to Medium for all tasks with duration > 5',
    'Increase all workers max load by 2'
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Data Modification</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to modify:
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: Set all high priority tasks to duration 8 hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || !query.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              'Apply Modification'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            {result.total_changes > 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Modifications Applied</h4>
                <p className="text-green-800 mb-3">
                  {result.total_changes} change{result.total_changes !== 1 ? 's' : ''} made successfully
                </p>
                
                {result.changes_made && result.changes_made.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-900">Changes made:</h5>
                    <ul className="space-y-1">
                      {result.changes_made.map((change: any, index: number) => (
                        <li key={index} className="text-sm text-green-800">
                          • Row {change.row + 1}: {change.field} changed from "{change.old_value}" to "{change.new_value}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ No Changes Made</h4>
                <p className="text-yellow-800">
                  No data matched your modification criteria. Try being more specific or check your data.
                </p>
              </div>
            )}

            {result.query_interpretation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🤖 AI Interpretation</h4>
                <p className="text-blue-800">
                  Command interpreted as: "{result.query_interpretation}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Data Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">📊 Current Data Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{clientsData.length}</div>
            <div className="text-sm text-blue-800">Clients</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{workersData.length}</div>
            <div className="text-sm text-green-800">Workers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{tasksData.length}</div>
            <div className="text-sm text-purple-800">Tasks</div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">💡 Example Commands</h4>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700">"{example}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 