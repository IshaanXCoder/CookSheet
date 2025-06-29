'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import DataGrid from '@/components/DataGrid'
import RuleBuilder from '@/components/RuleBuilder'
import PriorityPanel from '@/components/PriorityPanel'
import ExportPanel from '@/components/ExportPanel'
import ValidationSummary from '@/components/ValidationSummary'
import NLModify from '@/components/NLModify'
import RuleSuggestions from '@/components/RuleSuggestions'

export interface DataRow {
  [key: string]: any
}

export interface Rule {
  id: string
  description: string
  type: string
  parameters: any
}

export interface Priority {
  fairness: number
  loadBalance: number
  priorityLevel: number
}

export default function Home() {
  // Separate data states for different data types
  const [clientsData, setClientsData] = useState<DataRow[]>([])
  const [workersData, setWorkersData] = useState<DataRow[]>([])
  const [tasksData, setTasksData] = useState<DataRow[]>([])
  
  const [rules, setRules] = useState<Rule[]>([])
  const [priorities, setPriorities] = useState<Priority>({
    fairness: 50,
    loadBalance: 50,
    priorityLevel: 50
  })
  
  // New market-ready features
  const [validationResult, setValidationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>('upload')
  const [aiInsights, setAiInsights] = useState<any>(null)

  const tabs = [
    { id: 'upload', name: '📁 Upload', description: 'Upload and validate data' },
    { id: 'data', name: '📊 Data Grid', description: 'View and edit data' },
    { id: 'validation', name: '🔍 Validation', description: 'Review data quality' },
    { id: 'rules', name: '⚙️ Rules', description: 'Build business rules' },
    { id: 'modify', name: '🤖 AI Modify', description: 'Natural language editing' },
    { id: 'suggestions', name: '🧠 AI Suggestions', description: 'Smart recommendations' },
    { id: 'priorities', name: '🎯 Priorities', description: 'Set optimization weights' },
    { id: 'export', name: '📦 Export', description: 'Download final package' }
  ]

  const handleDataUpload = async (type: string, data: DataRow[], backendResponse?: any) => {
    // Set the data based on type
    switch (type) {
      case 'clients':
        setClientsData(data)
        break
      case 'workers':
        setWorkersData(data)
        break
      case 'tasks':
        setTasksData(data)
        break
    }
    
    // Process backend response with AI insights
    if (backendResponse) {
      setAiInsights(backendResponse)
      
      // Set validation results from the backend
      if (backendResponse.validation_preview) {
        setValidationResult(backendResponse.validation_preview)
      }
      
      // If we have all data, run comprehensive validation
      if (clientsData.length > 0 || workersData.length > 0 || tasksData.length > 0) {
        try {
          const validationResponse = await fetch('http://localhost:8000/validate/comprehensive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clients_data: type === 'clients' ? data : clientsData,
              workers_data: type === 'workers' ? data : workersData,
              tasks_data: type === 'tasks' ? data : tasksData
            }),
          })
          
          if (validationResponse.ok) {
            const validationData = await validationResponse.json()
            setValidationResult(validationData.validation_result)
          }
        } catch (error) {
          console.error('Validation error:', error)
        }
      }
    }
  }

  const handleDataUpdate = (type: string, newData: DataRow[]) => {
    handleDataUpload(type, newData)
  }

  const handleAddRule = (rule: Rule) => {
    setRules([...rules, rule])
  }

  const handleRemoveRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId))
  }

  const handleRuleSuggestionAccept = (suggestion: any) => {
    const newRule: Rule = {
      id: `suggestion_${Date.now()}`,
      type: suggestion.type,
      description: suggestion.suggested_rule,
      parameters: { 
        source: 'ai_suggestion',
        confidence: suggestion.confidence,
        category: suggestion.category
      }
    }
    setRules([...rules, newRule])
  }

  const totalRecords = clientsData.length + workersData.length + tasksData.length

  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <div className="text-center mb-8 animate-fadeInUp">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="gradient-text">AI-Powered</span>
          <br />
          Spreadsheet Configurator
        </h1>
        <p className="text-gray-400 text-lg mb-6 max-w-3xl mx-auto">
          Transform your messy data into clean, validated configurations with AI assistance. 
          Upload, validate, configure, and export with enterprise-grade reliability.
        </p>
        
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Data Quality:</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              validationResult?.is_valid ? 'status-success' : 'status-error'
            }`}>
              {validationResult?.is_valid ? '✅ Valid' : (validationResult ? '❌ Issues Found' : '⚪ Not Checked')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-container mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fadeInUp">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Clients Data</h3>
                <FileUpload 
                  dataType="clients"
                  onDataUpload={(data, headers, response) => handleDataUpload('clients', data, response)}
                />
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">👥 Workers Data</h3>
                <FileUpload 
                  dataType="workers"
                  onDataUpload={(data, headers, response) => handleDataUpload('workers', data, response)}
                />
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Tasks Data</h3>
                <FileUpload 
                  dataType="tasks"
                  onDataUpload={(data, headers, response) => handleDataUpload('tasks', data, response)}
                />
              </div>
            </div>

            {/* AI Insights Panel */}
            {aiInsights && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🧠 AI Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="stat-card blue">
                    <h4 className="font-medium text-blue-400 mb-2">Header Mapping</h4>
                    <div className="space-y-1 text-sm">
                      {aiInsights.mapped_headers && Object.entries(aiInsights.mapped_headers).map(([original, mapped]: [string, any]) => (
                        <div key={original} className="flex justify-between">
                          <span className="text-blue-300">{original}</span>
                          <span className="text-blue-100 font-medium">→ {mapped}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="stat-card green">
                    <h4 className="font-medium text-green-400 mb-2">Suggestions</h4>
                    <div className="space-y-1 text-sm text-green-300">
                      {aiInsights.suggestions && aiInsights.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                        <div key={index}>• {suggestion}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {totalRecords > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">�� Data Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card blue text-center">
                    <div className="text-2xl font-bold gradient-text-blue">{clientsData.length}</div>
                    <div className="text-sm text-blue-300">Clients</div>
                  </div>
                  <div className="stat-card green text-center">
                    <div className="text-2xl font-bold text-green-400">{workersData.length}</div>
                    <div className="text-sm text-green-300">Workers</div>
                  </div>
                  <div className="stat-card purple text-center">
                    <div className="text-2xl font-bold text-purple-400">{tasksData.length}</div>
                    <div className="text-sm text-purple-300">Tasks</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Grid Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {clientsData.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Clients Data</h3>
                <DataGrid
                  data={clientsData}
                  headers={Object.keys(clientsData[0] || {})}
                  onDataUpdate={(newData: DataRow[]) => setClientsData(newData)}
                  validationErrors={{}}
                />
              </div>
            )}
            
            {workersData.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">👥 Workers Data</h3>
                <DataGrid
                  data={workersData}
                  headers={Object.keys(workersData[0] || {})}
                  onDataUpdate={(newData: DataRow[]) => setWorkersData(newData)}
                  validationErrors={{}}
                />
              </div>
            )}
            
            {tasksData.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Tasks Data</h3>
                <DataGrid
                  data={tasksData}
                  headers={Object.keys(tasksData[0] || {})}
                  onDataUpdate={(newData: DataRow[]) => setTasksData(newData)}
                  validationErrors={{}}
                />
              </div>
            )}
            
            {totalRecords === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📄</div>
                <p>No data uploaded yet. Go to Upload tab to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="glass-card">
            <ValidationSummary
              validationResult={validationResult}
              onFixSuggestion={(error) => console.log('Fix suggestion:', error)}
            />
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="glass-card">
            <RuleBuilder
              onAddRule={handleAddRule}
              onRemoveRule={handleRemoveRule}
              rules={rules}
            />
          </div>
        )}

        {/* AI Modify Tab */}
        {activeTab === 'modify' && (
          <div className="glass-card">
            <NLModify
              clientsData={clientsData}
              workersData={workersData}
              tasksData={tasksData}
              onDataUpdate={handleDataUpdate}
            />
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="glass-card">
            <RuleSuggestions
              onAcceptSuggestion={handleRuleSuggestionAccept}
              clientsData={clientsData}
              workersData={workersData}
              tasksData={tasksData}
            />
          </div>
        )}

        {/* Priorities Tab */}
        {activeTab === 'priorities' && (
          <div className="glass-card">
            <PriorityPanel
              priorities={priorities}
              onPriorityChange={setPriorities}
            />
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <ExportPanel
            data={[...clientsData, ...workersData, ...tasksData]}
            rules={rules}
            priorities={priorities}
            clients_data={clientsData}
            workers_data={workersData}
            tasks_data={tasksData}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="glass-card mt-12 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>🧪 <span className="gradient-text">CookSheet</span></span>
            
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Rules:</span>
              <span className="font-medium text-white">{rules.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Total Records:</span>
              <span className="font-medium text-white">{totalRecords}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
} 