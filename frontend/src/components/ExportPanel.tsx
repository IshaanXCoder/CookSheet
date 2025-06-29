'use client'

import { useState } from 'react'
import axios from 'axios'

interface Rule {
  id: string
  description: string
  type: string
  parameters: any
}

interface Priority {
  fairness: number
  loadBalance: number
  priorityLevel: number
}

interface ExportPanelProps {
  data: any[]
  rules: Rule[]
  priorities: Priority
  clients_data?: any[]
  workers_data?: any[]
  tasks_data?: any[]
}

export default function ExportPanel({ data, rules, priorities, clients_data = [], workers_data = [], tasks_data = [] }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [exportedFiles, setExportedFiles] = useState<string[]>([])

  const prepareExportData = () => ({
    clients_data,
    workers_data,
    tasks_data,
    rules,
    priorities,
    timestamp: new Date().toISOString()
  })

  const downloadFile = (blob: Blob, filename: string, mediaType: string = 'text/csv') => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mediaType }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleCSVExport = async (type: 'clients' | 'workers' | 'tasks' | 'all') => {
    setIsExporting(true)
    setExportStatus(`Exporting ${type} data as CSV...`)

    try {
      const exportData = prepareExportData()
      const response = await axios.post(`http://localhost:8000/export/csv/${type}`, exportData, {
        responseType: 'blob'
      })

      const filename = `${type}_data_${new Date().toISOString().slice(0, 10)}.csv`
      downloadFile(response.data, filename)

      setExportStatus(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} CSV exported successfully!`)
      setExportedFiles([filename])
    } catch (error) {
      console.error('CSV Export error:', error)
      setExportStatus(`❌ Failed to export ${type} CSV. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFullExport = async () => {
    setIsExporting(true)
    setExportStatus('Preparing full configuration export...')

    try {
      const exportData = prepareExportData()
      const response = await axios.post('http://localhost:8000/export', exportData, {
        responseType: 'blob'
      })

      const filename = `data-alchemist-export-${Date.now()}.zip`
      downloadFile(response.data, filename, 'application/zip')

      setExportStatus('✅ Full configuration exported successfully!')
      setExportedFiles(['clean_clients.csv', 'clean_workers.csv', 'clean_tasks.csv', 'rules_config.json', 'priority_config.json', 'deployment_config.json'])
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('❌ Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePreview = () => {
    const preview = {
      summary: {
        totalClients: clients_data.length,
        totalWorkers: workers_data.length,
        totalTasks: tasks_data.length,
        totalRules: rules.length,
        priorities
      },
      sampleClientsData: clients_data.slice(0, 3),
      sampleWorkersData: workers_data.slice(0, 3),
      sampleTasksData: tasks_data.slice(0, 3),
      rules: rules.map(rule => ({
        description: rule.description,
        type: rule.type
      }))
    }
    
    console.log('Export Preview:', preview)
    alert('Preview logged to console. Check developer tools.')
  }

  const totalRecords = clients_data.length + workers_data.length + tasks_data.length

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card blue text-center">
          <div className="text-2xl font-bold gradient-text-blue">{clients_data.length}</div>
          <div className="text-sm text-blue-300">Clients</div>
        </div>
        <div className="stat-card green text-center">
          <div className="text-2xl font-bold text-green-400">{workers_data.length}</div>
          <div className="text-sm text-green-300">Workers</div>
        </div>
        <div className="stat-card orange text-center">
          <div className="text-2xl font-bold text-orange-400">{tasks_data.length}</div>
          <div className="text-sm text-orange-300">Tasks</div>
        </div>
        <div className="stat-card purple text-center">
          <div className="text-2xl font-bold text-purple-400">{rules.length}</div>
          <div className="text-sm text-purple-300">Rules</div>
        </div>
      </div>

      {/* CSV Export Options */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">📄 CSV Export Options</h3>
        <p className="text-gray-400 text-sm mb-6">Download individual data sets as CSV files for immediate use</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleCSVExport('clients')}
            disabled={isExporting || clients_data.length === 0}
            className="export-button clients"
          >
            <div className="text-blue-400 font-medium text-lg">📋 Clients CSV</div>
            <div className="text-sm text-gray-400 mt-1">{clients_data.length} records</div>
            <div className="mt-2 text-xs text-blue-300">Ready for download</div>
          </button>

          <button
            onClick={() => handleCSVExport('workers')}
            disabled={isExporting || workers_data.length === 0}
            className="export-button workers"
          >
            <div className="text-green-400 font-medium text-lg">👥 Workers CSV</div>
            <div className="text-sm text-gray-400 mt-1">{workers_data.length} records</div>
            <div className="mt-2 text-xs text-green-300">Ready for download</div>
          </button>

          <button
            onClick={() => handleCSVExport('tasks')}
            disabled={isExporting || tasks_data.length === 0}
            className="export-button tasks"
          >
            <div className="text-orange-400 font-medium text-lg">📋 Tasks CSV</div>
            <div className="text-sm text-gray-400 mt-1">{tasks_data.length} records</div>
            <div className="mt-2 text-xs text-orange-300">Ready for download</div>
          </button>

          <button
            onClick={() => handleCSVExport('all')}
            disabled={isExporting || totalRecords === 0}
            className="export-button combined"
          >
            <div className="text-purple-400 font-medium text-lg">🔗 Combined CSV</div>
            <div className="text-sm text-gray-400 mt-1">{totalRecords} records</div>
            <div className="mt-2 text-xs text-purple-300">All data unified</div>
          </button>
        </div>
      </div>

      {/* Full Export Configuration */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">📦 Complete Configuration Package</h3>
        <p className="text-gray-400 text-sm mb-6">Export everything: data, rules, configurations, and documentation</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <input type="checkbox" defaultChecked className="mt-1" id="include-data" />
            <div>
              <label htmlFor="include-data" className="font-medium text-white">
                📊 Clean Data Files
              </label>
              <p className="text-sm text-gray-400 mt-1">
                All validated CSV files: clients, workers, tasks
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <input type="checkbox" defaultChecked className="mt-1" id="include-rules" />
            <div>
              <label htmlFor="include-rules" className="font-medium text-white">
                ⚙️ Rules & Logic
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Business rules and validation constraints
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <input type="checkbox" defaultChecked className="mt-1" id="include-priorities" />
            <div>
              <label htmlFor="include-priorities" className="font-medium text-white">
                📚 Documentation
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Complete deployment guides and configs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePreview}
          className="btn-glass"
        >
          👁️ Preview Export
        </button>
        
        <button
          onClick={handleFullExport}
          disabled={isExporting || totalRecords === 0}
          className="flex-1 btn-gradient"
        >
          {isExporting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </span>
          ) : (
            <>
              📦 Export Complete Package
              <span className="ml-2 text-sm opacity-80">(ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div className={`p-4 rounded-lg border ${
          exportStatus.includes('✅') 
            ? 'status-success' 
            : exportStatus.includes('❌')
            ? 'status-error'
            : 'status-info'
        }`}>
          <div className="font-medium">{exportStatus}</div>
          
          {exportedFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Generated files:</p>
              <div className="grid grid-cols-2 gap-2">
                {exportedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-current rounded-full opacity-70"></span>
                    <span className="font-mono">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="glass-card p-6">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <span className="text-lg">🚀</span>
          Next Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium text-gray-300 text-sm">For CSV Files:</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Import directly into Excel/Sheets
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Load into databases or BI tools
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                Use with data processing pipelines
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-gray-300 text-sm">For Complete Package:</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Extract ZIP to deployment environment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Follow README instructions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                Deploy with included configurations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 