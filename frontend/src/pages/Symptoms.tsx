import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface Symptom {
  symptoms_id: number
  recorded_on: string
  severity: number
  type_of_symptom: string
  weight_lbs: number | null
  notes: string
}

function Symptoms() {
  const [symptomLogs] = useState<Symptom[]>([
    {
      symptoms_id: 1,
      recorded_on: '2024-11-08',
      severity: 6,
      type_of_symptom: 'Headache, Fatigue, Nausea',
      weight_lbs: 176.5,
      notes: 'Symptoms started in the morning, improved after lunch'
    },
    {
      symptoms_id: 2,
      recorded_on: '2024-11-07',
      severity: 4,
      type_of_symptom: 'Fatigue, Joint Pain',
      weight_lbs: 177.0,
      notes: 'Mild symptoms throughout the day'
    },
    {
      symptoms_id: 3,
      recorded_on: '2024-11-06',
      severity: 8,
      type_of_symptom: 'Severe Headache, Dizziness, Nausea',
      weight_lbs: 176.0,
      notes: 'Worst day this week, had to rest most of the day'
    },
    {
      symptoms_id: 4,
      recorded_on: '2024-11-05',
      severity: 3,
      type_of_symptom: 'Mild Fatigue',
      weight_lbs: 175.5,
      notes: 'Feeling much better today'
    },
    {
      symptoms_id: 5,
      recorded_on: '2024-11-04',
      severity: 2,
      type_of_symptom: 'None',
      weight_lbs: 175.0,
      notes: 'Great day, no significant symptoms'
    }
  ])

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500'
    if (severity <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-2">
                  Daily Symptoms
                </h1>
                <p className="text-gray-600">Track your daily symptoms, severity, and weight</p>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                Log Symptoms
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-3">
              {symptomLogs.map((log) => (
                <div key={log.symptoms_id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full ${getSeverityColor(log.severity)} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                        {log.severity}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-purple-700">
                            {new Date(log.recorded_on).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          {log.weight_lbs && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              {log.weight_lbs} lbs
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{log.type_of_symptom}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-purple-600 hover:text-purple-800 px-3 py-1 text-sm border border-purple-300 rounded hover:bg-purple-50 transition-colors">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {log.notes && (
                    <p className="text-sm text-gray-600 ml-13 italic">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Symptoms

