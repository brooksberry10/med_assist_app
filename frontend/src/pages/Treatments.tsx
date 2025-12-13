import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useTreatments } from '../hooks/useTreatments'
import type { Treatment } from '../utils/api/treatments'
import toast, { Toaster } from 'react-hot-toast'
import { parseDateInputToUtcDate, formatUtcDateForDateInput } from '../utils/date'


function Treatments() {
  const {
    treatments,
    //loading, 
    error,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  } = useTreatments()
  

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)

  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState('') // yyyy-mm-dd
  const [formNotes, setFormNotes] = useState('')
  const [formCompleted, setFormCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)


  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])


  const populateFormFromTreatment = (treatment: Treatment | null) => {
    if (treatment === null) {
      setFormName('')
      setFormDate('')
      setFormNotes('')
      setFormCompleted(false)
      setEditingTreatment(null)
      return
    }

    setEditingTreatment(treatment)
    setFormName(treatment.treatment_name)
    setFormNotes(treatment.notes ?? '')
    setFormCompleted(treatment.is_completed)

    setFormDate(formatUtcDateForDateInput(treatment.scheduled_on))
  }




  const formatScheduledOn = (treatment: Treatment): string => {
    if (!treatment.scheduled_on) {
      return 'Not scheduled'
    }

    return treatment.scheduled_on.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }



  const handleToggleCompleted = async (
    treatment: Treatment,
    checked: boolean
  ) => {
    try {
      await updateTreatment(treatment.treatment_id, { is_completed: checked })
      toast.success('Treatment updated')
    } catch {
      // error already surfaced via error + toast in useEffect
    }
  }

  const handleDelete = async (treatmentId: number) => {
    const confirmed = window.confirm('Delete this treatment?')
    if (!confirmed) return

    try {
      await deleteTreatment(treatmentId)
      toast.success('Treatment deleted')
    } catch {
      // error already surfaced via error + toast in useEffect
    }
  }

  const handleAddTreatment = () => {
    populateFormFromTreatment(null)
    setIsModalOpen(true)
  }



  const handleEditTreatment = (treatment: Treatment) => {
    populateFormFromTreatment(treatment)
    setIsModalOpen(true)
  }


  const handleModalClose = () => {
    setIsModalOpen(false)
    setSubmitting(false)
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim()) {
      toast.error('Treatment name is required')
      return
    }

    const scheduledDate = parseDateInputToUtcDate(formDate.trim())

    setSubmitting(true)

    try {
      if (editingTreatment) {
        await updateTreatment(editingTreatment.treatment_id, {
          treatment_name: formName.trim(),
          scheduled_on: scheduledDate ?? undefined,
          notes: formNotes.trim(),
          is_completed: formCompleted,
        })
        toast.success('Treatment updated')
      } else {
        await createTreatment({
          treatment_name: formName.trim(),
          scheduled_on: scheduledDate,
          notes: formNotes.trim(),
          is_completed: formCompleted,
        })
        toast.success('Treatment created')
      }

      handleModalClose()
    } catch {
      // error already surfaced via error + toast in useEffect
    } finally {
      setSubmitting(false)
    }
  }





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
                  Treatments
                </h1>
                <p className="text-gray-600">Manage your scheduled appointments and treatments</p>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                type="button"
                onClick={handleAddTreatment}
              >
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
                        onChange={(e) => void handleToggleCompleted(treatment, e.target.checked)}
                      />
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${treatment.is_completed ? 'text-gray-500 line-through' : 'text-purple-700'}`}>
                          {treatment.treatment_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Scheduled:</span>{' '}
                            {formatScheduledOn(treatment)}
                        </p>

                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleEditTreatment(treatment)}
                        className="text-purple-600 hover:text-purple-800 px-3 py-1 text-sm border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        type="button"
                        onClick={() => void handleDelete(treatment.treatment_id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
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
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              {editingTreatment ? 'Edit Treatment' : 'Add Treatment'}
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Treatment Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="e.g. Cardiology Appointment"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Scheduled Date
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
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                  placeholder="Optional notes about this treatment..."
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formCompleted}
                    onChange={(e) => setFormCompleted(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Mark as completed
                  </span>
                </label>

                <div className="flex gap-2">
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
                      ? editingTreatment
                        ? 'Updating...'
                        : 'Saving...'
                      : editingTreatment
                        ? 'Update'
                        : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default Treatments

