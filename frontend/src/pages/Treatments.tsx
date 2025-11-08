import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface Treatment {
  treatment_id: number
  treatment_name: string
  scheduled_on: string
  notes: string
  is_completed: boolean
}

function Treatments() {
  const [treatments] = useState<Treatment[]>([
    {
      treatment_id: 1,
      treatment_name: 'Cardiology Appointment',
      scheduled_on: '2024-11-15',
      notes: 'Annual heart checkup with Dr. Smith',
      is_completed: false
    },
    {
      treatment_id: 2,
      treatment_name: 'Physical Therapy Session',
      scheduled_on: '2024-11-12',
      notes: 'Lower back exercises and stretching',
      is_completed: true
    },
    {
      treatment_id: 3,
      treatment_name: 'Blood Work',
      scheduled_on: '2024-11-20',
      notes: 'Fasting required - check glucose and cholesterol levels',
      is_completed: false
    },
    {
      treatment_id: 4,
      treatment_name: 'Dental Cleaning',
      scheduled_on: '2024-11-08',
      notes: 'Regular 6-month cleaning',
      is_completed: true
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-2">
                  Treatments
                </h1>
                <p className="text-gray-600">Manage your scheduled appointments and treatments</p>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                Add Treatment
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <div key={treatment.treatment_id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        checked={treatment.is_completed}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        readOnly
                      />
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${treatment.is_completed ? 'text-gray-500 line-through' : 'text-purple-700'}`}>
                          {treatment.treatment_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Scheduled:</span> {new Date(treatment.scheduled_on).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
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
                  
                  {treatment.notes && (
                    <p className="text-sm text-gray-700 ml-8 mt-2 italic">{treatment.notes}</p>
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

export default Treatments

