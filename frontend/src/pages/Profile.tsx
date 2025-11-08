import { useState, useEffect } from 'react'
import AppNavbar from '../components/Navbar'
import AppFooter from '../components/Footer'
import AuthService from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState<number | null>(null)
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })
  const [loadingUser, setLoadingUser] = useState(true)

  const [age, setAge] = useState(0)
  const [gender, setGender] = useState('Other')
  const [weight_lbs, setWeight_lbs] = useState(0)
  const [height_ft, setHeight_ft] = useState(0)
  const [height_in, setHeight_in] = useState(0)
  const [current_diagnoses, setCurrent_diagnoses] = useState('')
  const [medical_history, setMedical_history] = useState('')
  const [insurance, setInsurance] = useState('')

  // Loading states for each card
  const [loadingPhysical, setLoadingPhysical] = useState(false)
  const [loadingMedical, setLoadingMedical] = useState(false)
  const [loadingInsurance, setLoadingInsurance] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        if (user) {
          setUserInfo({
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            email: user.email
          })
          setUserId(user.id)

          const response = await AuthService.authenticatedFetch(`/api/user-info/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.user_info) {
              setAge(data.user_info.age || 0)
              setGender(data.user_info.gender || 'Other')
              setWeight_lbs(data.user_info.weight_lbs || 0)
              setHeight_ft(data.user_info.height_ft || 0)
              setHeight_in(data.user_info.height_in || 0)
              setCurrent_diagnoses(data.user_info.current_diagnoses || '')
              setMedical_history(data.user_info.medical_history || '')
              setInsurance(data.user_info.insurance || '')
            }
          }
        } else {
          navigate('/signin')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        toast.error('Failed to load profile data')
        navigate('/signin')
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleUpdate = async (field: string) => {
    if (!userId) {
      toast.error('User not found')
      return
    }

    let updateData: any = {}
    
    if (field === 'physical') {
      setLoadingPhysical(true)
      updateData = { age, gender, weight_lbs, height_ft, height_in }
    } else if (field === 'medical') {
      setLoadingMedical(true)
      updateData = { current_diagnoses, medical_history }
    } else if (field === 'insurance') {
      setLoadingInsurance(true)
      updateData = { insurance }
    }

    try {
      const response = await AuthService.authenticatedFetch(`/api/user-info/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully!')
        
        if (data.user_info) {
          setAge(data.user_info.age || 0)
          setGender(data.user_info.gender || 'Other')
          setWeight_lbs(data.user_info.weight_lbs || 0)
          setHeight_ft(data.user_info.height_ft || 0)
          setHeight_in(data.user_info.height_in || 0)
          setCurrent_diagnoses(data.user_info.current_diagnoses || '')
          setMedical_history(data.user_info.medical_history || '')
          setInsurance(data.user_info.insurance || '')
        }
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      if (field === 'physical') setLoadingPhysical(false)
      else if (field === 'medical') setLoadingMedical(false)
      else if (field === 'insurance') setLoadingInsurance(false)
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-700 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      <AppNavbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* read only info */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6">
              User Profile
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                <p className="text-gray-900 text-lg font-medium">{userInfo.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                <p className="text-gray-900 text-lg font-medium">{userInfo.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                <p className="text-gray-900 text-lg font-medium">{userInfo.username}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <p className="text-gray-900 text-lg font-medium">{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* editable cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* physical info */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Physical Information</h3>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={weight_lbs}
                      onChange={(e) => setWeight_lbs(parseFloat(e.target.value))}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                    />
                    <span className="ml-3 text-gray-600 font-medium">lbs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
                  <div className="flex space-x-3">
                    <div className="flex items-center flex-1">
                      <input
                        type="number"
                        value={height_ft}
                        onChange={(e) => setHeight_ft(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      />
                      <span className="ml-2 text-gray-600 font-medium">ft</span>
                    </div>
                    <div className="flex items-center flex-1">
                      <input
                        type="number"
                        value={height_in}
                        onChange={(e) => setHeight_in(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      />
                      <span className="ml-2 text-gray-600 font-medium">in</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpdate('physical')}
                disabled={loadingPhysical}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingPhysical ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>

            {/* med info */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Medical Information</h3>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Diagnoses</label>
                  <textarea
                    value={current_diagnoses}
                    onChange={(e) => setCurrent_diagnoses(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                    placeholder="Enter your current diagnoses..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                  <textarea
                    value={medical_history}
                    onChange={(e) => setMedical_history(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                    placeholder="Enter your medical history..."
                  />
                </div>
              </div>

              <button
                onClick={() => handleUpdate('medical')}
                disabled={loadingMedical}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingMedical ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>

            {/* insurance */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Insurance</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Insurance Provider</label>
                <textarea
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                  placeholder="Enter your insurance information..."
                />
              </div>

              <button
                onClick={() => handleUpdate('insurance')}
                disabled={loadingInsurance}
                className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingInsurance ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>

          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  )
}
