'use client'

interface Priority {
  fairness: number
  loadBalance: number
  priorityLevel: number
}

interface PriorityPanelProps {
  priorities: Priority
  onPriorityChange: (priorities: Priority) => void
}

export default function PriorityPanel({ priorities, onPriorityChange }: PriorityPanelProps) {
  const handleSliderChange = (key: keyof Priority, value: number) => {
    onPriorityChange({
      ...priorities,
      [key]: value
    })
  }

  const priorityItems = [
    {
      key: 'fairness' as keyof Priority,
      label: 'Fairness',
      description: 'How evenly work should be distributed',
      icon: '⚖️',
      leftLabel: 'Efficiency',
      rightLabel: 'Equal Distribution'
    },
    {
      key: 'loadBalance' as keyof Priority,
      label: 'Load Balancing',
      description: 'How to balance workload across resources',
      icon: '📊',
      leftLabel: 'Concentrated',
      rightLabel: 'Distributed'
    },
    {
      key: 'priorityLevel' as keyof Priority,
      label: 'Priority Enforcement',
      description: 'How strictly to enforce task priorities',
      icon: '🎯',
      leftLabel: 'Flexible',
      rightLabel: 'Strict'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Adjust these settings to control how the system handles scheduling and resource allocation:
      </div>

      {priorityItems.map((item) => (
        <div key={item.key} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.icon}</span>
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
          
          <div className="pl-7">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{item.leftLabel}</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {priorities[item.key]}%
              </span>
              <span>{item.rightLabel}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={priorities[item.key]}
                onChange={(e) => handleSliderChange(item.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${priorities[item.key]}%, #e5e7eb ${priorities[item.key]}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Priority Summary */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Current Configuration</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Fairness:</strong> {priorities.fairness < 30 ? 'Efficiency-focused' : priorities.fairness > 70 ? 'Equal distribution priority' : 'Balanced approach'}
          </p>
          <p>
            <strong>Load Balance:</strong> {priorities.loadBalance < 30 ? 'Concentrated workload' : priorities.loadBalance > 70 ? 'Widely distributed' : 'Moderate distribution'}
          </p>
          <p>
            <strong>Priority Level:</strong> {priorities.priorityLevel < 30 ? 'Flexible scheduling' : priorities.priorityLevel > 70 ? 'Strict priority enforcement' : 'Balanced priority handling'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
} 