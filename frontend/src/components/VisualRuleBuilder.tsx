'use client'

import { useState } from 'react'
import axios from 'axios'

interface Rule {
  id: string
  type: string
  name: string
  parameters: any
  isActive: boolean
}

interface VisualRuleBuilderProps {
  onAddRule: (rule: Rule) => void
  rules: Rule[]
  availableTasks: string[]
  availableWorkers: string[]
  availableClients: string[]
}

export default function VisualRuleBuilder({ 
  onAddRule, 
  rules, 
  availableTasks, 
  availableWorkers, 
  availableClients 
}: VisualRuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>('corun')
  const [currentRule, setCurrentRule] = useState<any>({})
  const [jsonPreview, setJsonPreview] = useState<string>('')

  const ruleTypes = [
    {
      id: 'corun',
      name: 'Co-Run Tasks',
      icon: '🔗',
      description: 'Tasks that must run together'
    },
    {
      id: 'priority',
      name: 'Priority Rules',
      icon: '🎯',
      description: 'Set priority levels for tasks'
    },
    {
      id: 'capacity',
      name: 'Capacity Limits',
      icon: '📊',
      description: 'Worker load and capacity constraints'
    },
    {
      id: 'skills',
      name: 'Skill Matching',
      icon: '🎨',
      description: 'Match tasks to worker skills'
    },
    {
      id: 'timing',
      name: 'Time Constraints',
      icon: '⏰',
      description: 'Schedule timing rules'
    },
    {
      id: 'exclusion',
      name: 'Exclusion Rules',
      icon: '🚫',
      description: 'Tasks that cannot run together'
    }
  ]

  const handleRuleChange = (field: string, value: any) => {
    const updatedRule = { ...currentRule, [field]: value }
    setCurrentRule(updatedRule)
    
    // Generate JSON preview
    const preview = {
      type: activeTab,
      name: updatedRule.name || `${activeTab}_rule`,
      parameters: updatedRule,
      enforcement: updatedRule.enforcement || 'strict',
      priority: updatedRule.priority || 'medium'
    }
    
    setJsonPreview(JSON.stringify(preview, null, 2))
  }

  const createRule = () => {
    if (!currentRule.name) {
      alert('Please provide a rule name')
      return
    }

    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      type: activeTab,
      name: currentRule.name,
      parameters: { ...currentRule },
      isActive: true
    }

    onAddRule(newRule)
    setCurrentRule({})
    setJsonPreview('')
  }

  const renderCoRunBuilder = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name
        </label>
        <input
          type="text"
          value={currentRule.name || ''}
          onChange={(e) => handleRuleChange('name', e.target.value)}
          placeholder="e.g., Critical Tasks Co-Run"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tasks to Co-Run
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {availableTasks.map(task => (
            <label key={task} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentRule.tasks?.includes(task) || false}
                onChange={(e) => {
                  const tasks = currentRule.tasks || []
                  if (e.target.checked) {
                    handleRuleChange('tasks', [...tasks, task])
                  } else {
                    handleRuleChange('tasks', tasks.filter((t: string) => t !== task))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{task}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Constraint Type
        </label>
        <select
          value={currentRule.constraintType || 'together'}
          onChange={(e) => handleRuleChange('constraintType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="together">Must run together</option>
          <option value="sequence">Must run in sequence</option>
          <option value="overlap">Can overlap</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enforcement Level
        </label>
        <div className="flex space-x-4">
          {['strict', 'preferred', 'optional'].map(level => (
            <label key={level} className="flex items-center space-x-1">
              <input
                type="radio"
                name="enforcement"
                value={level}
                checked={currentRule.enforcement === level}
                onChange={(e) => handleRuleChange('enforcement', e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPriorityBuilder = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name
        </label>
        <input
          type="text"
          value={currentRule.name || ''}
          onChange={(e) => handleRuleChange('name', e.target.value)}
          placeholder="e.g., Phase 1 High Priority"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority Level
        </label>
        <select
          value={currentRule.priorityLevel || 'high'}
          onChange={(e) => handleRuleChange('priorityLevel', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apply to Tasks
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="applyTo"
              value="all"
              checked={currentRule.applyTo === 'all'}
              onChange={(e) => handleRuleChange('applyTo', e.target.value)}
            />
            <span>All tasks</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="applyTo"
              value="conditional"
              checked={currentRule.applyTo === 'conditional'}
              onChange={(e) => handleRuleChange('applyTo', e.target.value)}
            />
            <span>Tasks matching conditions</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="applyTo"
              value="specific"
              checked={currentRule.applyTo === 'specific'}
              onChange={(e) => handleRuleChange('applyTo', e.target.value)}
            />
            <span>Specific tasks</span>
          </label>
        </div>
      </div>

      {currentRule.applyTo === 'conditional' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conditions
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={currentRule.condition || ''}
              onChange={(e) => handleRuleChange('condition', e.target.value)}
              placeholder="e.g., Phase = 1, Client = ABC Corp"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      )}

      {currentRule.applyTo === 'specific' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Specific Tasks
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {availableTasks.map(task => (
              <label key={task} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentRule.specificTasks?.includes(task) || false}
                  onChange={(e) => {
                    const tasks = currentRule.specificTasks || []
                    if (e.target.checked) {
                      handleRuleChange('specificTasks', [...tasks, task])
                    } else {
                      handleRuleChange('specificTasks', tasks.filter((t: string) => t !== task))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{task}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderCapacityBuilder = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name
        </label>
        <input
          type="text"
          value={currentRule.name || ''}
          onChange={(e) => handleRuleChange('name', e.target.value)}
          placeholder="e.g., Worker Load Limit"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capacity Type
        </label>
        <select
          value={currentRule.capacityType || 'worker'}
          onChange={(e) => handleRuleChange('capacityType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="worker">Per Worker</option>
          <option value="skill">Per Skill Group</option>
          <option value="client">Per Client</option>
          <option value="global">Global</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Concurrent Tasks
        </label>
        <input
          type="number"
          value={currentRule.maxTasks || ''}
          onChange={(e) => handleRuleChange('maxTasks', parseInt(e.target.value))}
          min="1"
          max="20"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apply to Workers/Groups
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {availableWorkers.map(worker => (
            <label key={worker} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentRule.targetWorkers?.includes(worker) || false}
                onChange={(e) => {
                  const workers = currentRule.targetWorkers || []
                  if (e.target.checked) {
                    handleRuleChange('targetWorkers', [...workers, worker])
                  } else {
                    handleRuleChange('targetWorkers', workers.filter((w: string) => w !== worker))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{worker}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGenericBuilder = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name
        </label>
        <input
          type="text"
          value={currentRule.name || ''}
          onChange={(e) => handleRuleChange('name', e.target.value)}
          placeholder={`e.g., Custom ${activeTab} rule`}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={currentRule.description || ''}
          onChange={(e) => handleRuleChange('description', e.target.value)}
          placeholder="Describe what this rule does..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configuration (JSON)
        </label>
        <textarea
          value={currentRule.config || ''}
          onChange={(e) => handleRuleChange('config', e.target.value)}
          placeholder='{"parameter": "value"}'
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
        />
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧩 Visual Rule Builder</h3>
        
        {/* Rule Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ruleTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setActiveTab(type.id)
                setCurrentRule({})
                setJsonPreview('')
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>

        {/* Rule Builder Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {ruleTypes.find(r => r.id === activeTab)?.description}
            </h4>
            
            {activeTab === 'corun' && renderCoRunBuilder()}
            {activeTab === 'priority' && renderPriorityBuilder()}
            {activeTab === 'capacity' && renderCapacityBuilder()}
            {(activeTab === 'skills' || activeTab === 'timing' || activeTab === 'exclusion') && renderGenericBuilder()}

            <div className="mt-6 flex gap-3">
              <button
                onClick={createRule}
                disabled={!currentRule.name}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Add Rule
              </button>
              <button
                onClick={() => {
                  setCurrentRule({})
                  setJsonPreview('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* JSON Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">JSON Preview</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto">
              <pre>{jsonPreview || '// Configure rule to see preview'}</pre>
            </div>
          </div>
        </div>

        {/* Current Rules Summary */}
        {rules.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Active Rules ({rules.length})</h4>
            <div className="space-y-2">
              {rules.slice(0, 3).map(rule => (
                <div key={rule.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{rule.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {rule.type}
                  </span>
                </div>
              ))}
              {rules.length > 3 && (
                <div className="text-sm text-gray-500">
                  ... and {rules.length - 3} more rules
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 