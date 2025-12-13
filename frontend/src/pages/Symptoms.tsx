import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast, { Toaster } from 'react-hot-toast'

import { useSymptoms } from '../hooks/useSymptoms'
import type { Symptom } from '../utils/api/symptoms'




function Symptoms() {
   const {
    symptoms,
    loading,
    error,
    page,
    totalPages,
    setPage,
    createSymptom,
    updateSymptom,
    deleteSymptom,
  } = useSymptoms()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null)

  // Form state
  const [formDate, setFormDate] = useState('') // yyyy-mm-dd
  const [formSeverity, setFormSeverity] = useState('0')
  const [formType, setFormType] = useState('')
  const [formWeight, setFormWeight] = useState('') // optional
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const populateFormFromSymptom = (symptom: Symptom | null) => {
    if (!symptom) {
      setEditingSymptom(null)
      setFormDate('')
      setFormSeverity('0')
      setFormType('')
      setFormWeight('')
      setFormNotes('')
      return
    }

    setEditingSymptom(symptom)

    if (symptom.recorded_on) {
      const year = symptom.recorded_on.getFullYear()
      const month = String(symptom.recorded_on.getMonth() + 1).padStart(2, '0')
      const day = String(symptom.recorded_on.getDate()).padStart(2, '0')
      setFormDate(`${year}-${month}-${day}`)
    } else {
      setFormDate('')
    }

    setFormSeverity(String(symptom.severity ?? 0))
    setFormType(symptom.type_of_symptom ?? '')
    setFormWeight(
      symptom.weight_lbs === null || symptom.weight_lbs === undefined
        ? ''
        : String(symptom.weight_lbs)
    )
    setFormNotes(symptom.notes ?? '')
  }

  const handleAddSymptom = () => {
    populateFormFromSymptom(null)
    setIsModalOpen(true)
  }

  const handleEditSymptom = (symptom: Symptom) => {
    populateFormFromSymptom(symptom)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSubmitting(false)
  }

  const handleDeleteSymptom = async (symptomId: number) => {
    const confirmed = window.confirm('Delete this symptom log?')
    if (!confirmed) return

    try {
      await deleteSymptom(symptomId)
      toast.success('Symptom deleted')
    } catch {
      // error surfaced by hook + useEffect toast
    }
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const severityNum = Number(formSeverity)
    if (Number.isNaN(severityNum) || severityNum < 0) {
      toast.error('Severity must be a number >= 0')
      return
    }

    const typeTrimmed = formType.trim()
    if (!typeTrimmed) {
      toast.error('Type of symptom is required')
      return
    }

    const recordedDate =
      formDate.trim() !== '' ? new Date(formDate.trim()) : null

    const weightTrimmed = formWeight.trim()
    const weightNum = weightTrimmed === '' ? null : Number(weightTrimmed)

    if (weightTrimmed !== '' && (Number.isNaN(weightNum) || weightNum! < 0)) {
      toast.error('Weight must be a number >= 0')
      return
    }

    setSubmitting(true)

    try {
      if (editingSymptom) {
        await updateSymptom(editingSymptom.symptoms_id, {
          recorded_on: recordedDate ?? undefined,
          severity: severityNum,
          type_of_symptom: typeTrimmed,
          weight_lbs: weightNum ?? undefined,
          notes: formNotes.trim(),
        })
        toast.success('Symptom updated')
      } else {
        await createSymptom({
          recorded_on: recordedDate,
          severity: severityNum,
          type_of_symptom: typeTrimmed,
          weight_lbs: weightNum ?? undefined,
          notes: formNotes.trim(),
        })
        toast.success('Symptom created')
      }

      handleModalClose()
    } catch {
      // error surfaced by hook + useEffect toast
    } finally {
      setSubmitting(false)
    }
  }
  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500'
    if (severity <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
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
                  Daily Symptoms
                </h1>
                <p className="text-gray-600">Track your daily symptoms, severity, and weight</p>
              </div>
              <button
                type="button"
                onClick={handleAddSymptom}
                className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                Log Symptoms
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-600">Loading symptoms...</p>
              ) : symptoms.length === 0 ? (
                <p className="text-gray-600">No symptom logs yet.</p>
              ) : (
                symptoms.map((log) => (
                  <div
                    key={log.symptoms_id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full ${getSeverityColor(
                            log.severity
                          )} text-white flex items-center justify-center font-bold flex-shrink-0`}
                        >
                          {log.severity}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-purple-700">
                              {log.recorded_on
                                ? log.recorded_on.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'No date'}
                            </h3>

                            {log.weight_lbs !== null && log.weight_lbs !== undefined && (
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {log.weight_lbs} lbs
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 font-medium">
                            {log.type_of_symptom}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSymptom(log)}
                          className="text-purple-600 hover:text-purple-800 px-3 py-1 text-sm border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteSymptom(log.symptoms_id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {log.notes && <p className="text-sm text-gray-600 italic">{log.notes}</p>}
                  </div>
                ))
              )}

            </div>
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>

                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              {editingSymptom ? 'Edit Symptoms' : 'Log Symptoms'}
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
                  Severity<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Type of Symptom<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="e.g. Headache, fatigue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="Optional"
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
                  placeholder="Optional notes..."
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
                    ? editingSymptom
                      ? 'Updating...'
                      : 'Saving...'
                    : editingSymptom
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

export default Symptoms

