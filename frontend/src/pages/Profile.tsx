import { useState, useEffect } from 'react'
import AppNavbar from '../components/Navbar'
import AppFooter from '../components/Footer'
import AuthService from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        if (user) {
          setUserInfo({
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            email: user.email
          })
        } else {
          navigate('/signin')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        navigate('/signin')
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [navigate])

  const [age, setAge] = useState(28)
  const [gender, setGender] = useState('Male')
  const [weight, setWeight] = useState(175)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(10)
  const [diagnoses, setDiagnoses] = useState('Type 2 Diabetes, Hypertension')
  const [medicalHistory, setMedicalHistory] = useState('Appendectomy (2015), Seasonal allergies')
  const [insurance, setInsurance] = useState('Blue Cross Blue Shield - PPO Plan')

  // Loading states for each card
  const [loadingPhysical, setLoadingPhysical] = useState(false)
  const [loadingMedical, setLoadingMedical] = useState(false)
  const [loadingInsurance, setLoadingInsurance] = useState(false)

  const handleUpdate = (field: string) => {
    // Set loading state based on field
    if (field === 'physical') setLoadingPhysical(true)
    else if (field === 'medical') setLoadingMedical(true)
    else if (field === 'insurance') setLoadingInsurance(true)

    // Mock API call with 2 second delay
    setTimeout(() => {
      console.log(`Updated ${field}!`)
      if (field === 'physical') setLoadingPhysical(false)
      else if (field === 'medical') setLoadingMedical(false)
      else if (field === 'insurance') setLoadingInsurance(false)
    }, 2000)
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
                    <option value="Not specified">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
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
                        value={heightFt}
                        onChange={(e) => setHeightFt(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      />
                      <span className="ml-2 text-gray-600 font-medium">ft</span>
                    </div>
                    <div className="flex items-center flex-1">
                      <input
                        type="number"
                        value={heightIn}
                        onChange={(e) => setHeightIn(parseInt(e.target.value))}
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
                    value={diagnoses}
                    onChange={(e) => setDiagnoses(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                    placeholder="Enter your current diagnoses..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
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
