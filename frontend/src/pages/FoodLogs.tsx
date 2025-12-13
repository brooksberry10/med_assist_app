import { useEffect, useState } from 'react' 
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast, { Toaster } from 'react-hot-toast'
import { useFoodlogs } from '../hooks/useFoodlogs'
import type { FoodLog } from '../utils/api/foodlogs'

function FoodLogs() {
    // >>> CRUD INTEGRATION
  const { foodlogs, error, createFoodLog, updateFoodLog, deleteFoodLog } = useFoodlogs()

  // Modal + editing state 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFoodLog, setEditingFoodLog] = useState<FoodLog | null>(null)

  // Form state
  const [formDate, setFormDate] = useState('') // yyyy-mm-dd
  const [formBreakfast, setFormBreakfast] = useState('')
  const [formLunch, setFormLunch] = useState('')
  const [formDinner, setFormDinner] = useState('')
  const [formCalories, setFormCalories] = useState('0')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const populateFormFromFoodLog = (log: FoodLog | null) => {
    if (!log) {
      setEditingFoodLog(null)
      setFormDate('')
      setFormBreakfast('')
      setFormLunch('')
      setFormDinner('')
      setFormCalories('0')
      setFormNotes('')
      return
    }

    setEditingFoodLog(log)

    if (log.recorded_on) {
      const year = log.recorded_on.getFullYear()
      const month = String(log.recorded_on.getMonth() + 1).padStart(2, '0')
      const day = String(log.recorded_on.getDate()).padStart(2, '0')
      setFormDate(`${year}-${month}-${day}`)
    } else {
      setFormDate('')
    }

    setFormBreakfast(log.breakfast ?? '')
    setFormLunch(log.lunch ?? '')
    setFormDinner(log.dinner ?? '')
    setFormCalories(String(log.total_calories ?? 0))
    setFormNotes(log.notes ?? '')
  }

  const handleAddFoodLog = () => {
    populateFormFromFoodLog(null)
    setIsModalOpen(true)
  }

  const handleEditFoodLog = (log: FoodLog) => {
    populateFormFromFoodLog(log)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSubmitting(false)
  }

  const handleDeleteFoodLog = async (foodlogId: number) => {
    const confirmed = window.confirm('Delete this food log?')
    if (!confirmed) return
    try {
      await deleteFoodLog(foodlogId)
      toast.success('Food log deleted')
    } catch {
      // error handled by hook + useEffect toast
    }
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordedDate = formDate.trim() !== '' ? new Date(formDate.trim()) : null

    const caloriesNum = Number(formCalories)
    if (Number.isNaN(caloriesNum) || caloriesNum < 0) {
      toast.error('Total calories must be a number >= 0')
      return
    }

    setSubmitting(true)

    try {
      if (editingFoodLog) {
        await updateFoodLog(editingFoodLog.foodlog_id, {
          recorded_on: recordedDate ?? undefined,
          breakfast: formBreakfast.trim() === '' ? null : formBreakfast.trim(),
          lunch: formLunch.trim() === '' ? null : formLunch.trim(),
          dinner: formDinner.trim() === '' ? null : formDinner.trim(),
          notes: formNotes.trim() === '' ? null : formNotes.trim(),
          total_calories: caloriesNum,
        })
        toast.success('Food log updated')
      } else {
        await createFoodLog({
          recorded_on: recordedDate,
          breakfast: formBreakfast.trim() === '' ? null : formBreakfast.trim(),
          lunch: formLunch.trim() === '' ? null : formLunch.trim(),
          dinner: formDinner.trim() === '' ? null : formDinner.trim(),
          notes: formNotes.trim() === '' ? null : formNotes.trim(),
          total_calories: caloriesNum,
        })
        toast.success('Food log created')
      }

      handleModalClose()
    } catch {
      // error handled by hook + useEffect toast
    } finally {
      setSubmitting(false)
    }
  }
  // END CRUD INTEGRATION


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
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
              <button  type="button" onClick={handleAddFoodLog} className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
              Add Food Log
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              {foodlogs.length === 0 ? (<p className="text-gray-600">No food logs yet.</p>) : (foodlogs.map((log) => (
                <div key={log.foodlog_id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-purple-700">
                          {(log.recorded_on
                            ? log.recorded_on.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'No date')}
                        </h3>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {log.total_calories ?? 0} cal
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
                      <button
                        type="button"
                        onClick={() => handleEditFoodLog(log)}
                        className="text-purple-600 hover:text-purple-800 px-3 py-1 text-sm border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteFoodLog(log.foodlog_id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
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
              ))
              )}
            </div>
          </div>
        </div>
      </main>
        
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              {editingFoodLog ? 'Edit Food Log' : 'Add Food Log'}
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recorded Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Breakfast
                </label>
                <input
                  type="text"
                  value={formBreakfast}
                  onChange={(e) => setFormBreakfast(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Lunch
                </label>
                <input
                  type="text"
                  value={formLunch}
                  onChange={(e) => setFormLunch(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dinner
                </label>
                <input
                  type="text"
                  value={formDinner}
                  onChange={(e) => setFormDinner(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Total Calories
                </label>
                <input
                  type="number"
                  value={formCalories}
                  onChange={(e) => setFormCalories(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingFoodLog
                      ? 'Updating...'
                      : 'Saving...'
                    : editingFoodLog
                      ? 'Update'
                      : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default FoodLogs

