'use client'

import { useState } from 'react'
import axios from 'axios'

interface Rule {
  id: string
  description: string
  type: string
  parameters: any
}

interface RuleBuilderProps {
  rules: Rule[]
  onAddRule: (rule: Rule) => void
  onRemoveRule: (ruleId: string) => void
}

export default function RuleBuilder({ rules, onAddRule, onRemoveRule }: RuleBuilderProps) {
  const [ruleInput, setRuleInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions] = useState([
    "T12 and T14 should run together",
    "Set priority to high for Phase 1 tasks",
    "Balance load across all workers",
    "Tasks with same client should be grouped",
    "No more than 3 tasks per worker simultaneously"
  ])

  const handleAddRule = async () => {
    if (!ruleInput.trim()) return

    setIsProcessing(true)
    try {
      // Call backend to parse natural language rule
      const response = await axios.post('http://localhost:8000/rules/generate', {
        query: ruleInput
      })

      const newRule: Rule = {
        id: Date.now().toString(),
        description: ruleInput,
        type: response.data.type || 'custom',
        parameters: response.data.parameters || {}
      }

      onAddRule(newRule)
      setRuleInput('')
    } catch (error) {
      console.error('Error processing rule:', error)
      // Fallback to simple rule creation
      const newRule: Rule = {
        id: Date.now().toString(),
        description: ruleInput,
        type: 'custom',
        parameters: { raw_query: ruleInput }
      }
      onAddRule(newRule)
      setRuleInput('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setRuleInput(suggestion)
  }

  return (
    <div className="space-y-6">
      {/* Rule Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your rule in plain English:
          </label>
          <div className="flex gap-2">
            <textarea
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              placeholder="e.g., Tasks T12 and T14 should run together, or Set priority to high for Phase 1 tasks"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <button
              onClick={handleAddRule}
              disabled={!ruleInput.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
            >
              {isProcessing ? '🤖' : '+ Add Rule'}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick suggestions:
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Rules */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Rules ({rules.length})</h3>
        
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No rules defined yet. Add your first rule above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{rule.description}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {rule.type}
                    </span>
                    {Object.keys(rule.parameters).length > 0 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {Object.keys(rule.parameters).length} parameters
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveRule(rule.id)}
                  className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove rule"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 