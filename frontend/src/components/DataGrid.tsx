'use client'

import { useMemo } from 'react'
import { DataGrid as ReactDataGrid } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'

interface DataGridProps {
  data: any[]
  headers: string[]
  onDataUpdate: (data: any[]) => void
  validationErrors: {[key: string]: string[]}
}

export default function DataGrid({ data, headers, onDataUpdate, validationErrors }: DataGridProps) {
  const columns = useMemo(() => {
    return headers.map(header => ({
      key: header,
      name: header,
      resizable: true,
      sortable: true,
      editable: true
    }))
  }, [headers])

  const rows = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      id: row.id || index
    }))
  }, [data])

  const handleRowsChange = (newRows: any[]) => {
    const updatedData = newRows.map(({ id, ...rest }) => rest)
    onDataUpdate(updatedData)
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {data.length} rows × {headers.length} columns
        </div>
        <div className="text-sm text-gray-500">
          Double-click any cell to edit. Press Enter to save, Escape to cancel.
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ReactDataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
          className="rdg-light"
          style={{ height: 400 }}
        />
      </div>
      
      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Validation Issues Found</h4>
          <p className="text-sm text-yellow-700">
            {Object.keys(validationErrors).length} cells have validation errors. 
            Fix these issues before exporting.
          </p>
          <div className="mt-2 text-sm text-yellow-600">
            <strong>Errors:</strong>
            <ul className="list-disc list-inside mt-1">
              {Object.entries(validationErrors).map(([cellKey, errors]) => (
                <li key={cellKey}>
                  Cell {cellKey}: {errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 