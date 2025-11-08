import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface FoodLog {
  foodlog_id: number
  recorded_on: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  total_calories: number
  notes: string
}

function FoodLogs() {
  const [foodLogs] = useState<FoodLog[]>([
    {
      foodlog_id: 1,
      recorded_on: '2024-11-08',
      breakfast: 'Oatmeal with banana and honey',
      lunch: 'Grilled chicken salad with olive oil dressing',
      dinner: 'Baked salmon with brown rice and steamed broccoli',
      total_calories: 1850,
      notes: 'Felt energized throughout the day, no issues'
    },
    {
      foodlog_id: 2,
      recorded_on: '2024-11-07',
      breakfast: 'Greek yogurt with granola and berries',
      lunch: 'Turkey sandwich on whole wheat with vegetables',
      dinner: 'Pasta with tomato sauce and garlic bread',
      total_calories: 2100,
      notes: 'Felt slightly bloated after dinner'
    },
    {
      foodlog_id: 3,
      recorded_on: '2024-11-06',
      breakfast: 'Scrambled eggs with whole wheat toast',
      lunch: 'Quinoa bowl with roasted vegetables',
      dinner: 'Grilled steak with sweet potato and green beans',
      total_calories: 2250,
      notes: 'Great energy levels, no digestive issues'
    },
    {
      foodlog_id: 4,
      recorded_on: '2024-11-05',
      breakfast: 'Smoothie with spinach, banana, and protein powder',
      lunch: 'Sushi rolls with miso soup',
      dinner: 'Chicken stir-fry with mixed vegetables',
      total_calories: 1750,
      notes: 'Light day, felt good'
    },
    {
      foodlog_id: 5,
      recorded_on: '2024-11-04',
      breakfast: 'Pancakes with maple syrup and berries',
      lunch: 'Caesar salad with grilled chicken',
      dinner: 'Pizza with vegetables',
      total_calories: 2400,
      notes: 'Cheat day - experienced some heartburn in the evening'
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
                  Food Logs
                </h1>
                <p className="text-gray-600">Track your daily meals and calorie intake</p>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                Add Food Log
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              {foodLogs.map((log) => (
                <div key={log.foodlog_id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-purple-700">
                          {new Date(log.recorded_on).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {log.total_calories} cal
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {log.breakfast && (
                          <div className="flex gap-2">
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold min-w-[80px] text-center">
                              Breakfast
                            </span>
                            <p className="text-sm text-gray-700">{log.breakfast}</p>
                          </div>
                        )}
                        {log.lunch && (
                          <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold min-w-[80px] text-center">
                              Lunch
                            </span>
                            <p className="text-sm text-gray-700">{log.lunch}</p>
                          </div>
                        )}
                        {log.dinner && (
                          <div className="flex gap-2">
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold min-w-[80px] text-center">
                              Dinner
                            </span>
                            <p className="text-sm text-gray-700">{log.dinner}</p>
                          </div>
                        )}
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
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">{log.notes}</p>
                    </div>
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

export default FoodLogs

