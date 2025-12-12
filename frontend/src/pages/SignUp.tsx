import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/Navbar'
import AppFooter from '../components/Footer'

export default function SignUp() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: Account Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Step 2: Physical Info
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Other')
  const [weight, setWeight] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  
  // Step 3: Medical Info
  const [currentDiagnoses, setCurrentDiagnoses] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [insurance, setInsurance] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { number: 1, title: 'Account', description: 'Create your account' },
    { number: 2, title: 'Physical', description: 'Basic health info' },
    { number: 3, title: 'Medical', description: 'Medical details' },
  ]

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    
    if (currentStep === 1) {
      if (!firstName.trim()) {
        setError('First name is required')
        return
      }
      if (!username.trim()) {
        setError('Username is required')
        return
      }
      if (!email.trim()) {
        setError('Email is required')
        return
      }
      if (!password) {
        setError('Password is required')
        return
      }
      if (!confirmPassword) {
        setError('Confirm password is required')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    
    if (currentStep === 2) {
      if (age) {
        const ageNum = parseInt(age)
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 130) {
          setError('Age must be between 18 and 130')
          return
        }
      }
      
      if (weight) {
        const weightNum = parseFloat(weight)
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1400) {
          setError('Weight must be between 0 and 1400 lbs')
          return
        }
      }
      
      if (heightFt) {
        const ftNum = parseInt(heightFt)
        if (isNaN(ftNum) || ftNum < 0 || ftNum > 10) {
          setError('Height (feet) must be between 0 and 10')
          return
        }
      }
      
      if (heightIn) {
        const inNum = parseInt(heightIn)
        if (isNaN(inNum) || inNum < 0 || inNum > 11) {
          setError('Height (inches) must be between 0 and 11')
          return
        }
      }
    }
    
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep < 3) {
      handleNext(e)
      return
    }
    
    setLoading(true)
    setError(null)

    const payload: any = {
      first_name: firstName,
      username,
      email,
      password,
      confirm_password: confirmPassword,
    }

    if (lastName) payload.last_name = lastName
    if (age) payload.age = parseInt(age)
    if (gender) payload.gender = gender
    if (weight) payload.weight_lbs = parseFloat(weight)
    if (heightFt) payload.height_ft = parseInt(heightFt)
    if (heightIn) payload.height_in = parseInt(heightIn)
    if (currentDiagnoses) payload.current_diagnoses = currentDiagnoses
    if (medicalHistory) payload.medical_history = medicalHistory
    if (insurance) payload.insurance = insurance

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/signin')
      } else {
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 mb-6">Join Med Assist to track your health journey</p>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-start justify-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-start" style={{ flex: index === 1 ? '0 0 auto' : '1 1 0%' }}>
                    {index > 0 && (
                      <div
                        className={`h-1 mt-5 transition-all ${
                          currentStep > steps[index - 1].number ? 'bg-purple-700' : 'bg-gray-200'
                        }`}
                        style={{ width: '80px', marginRight: '8px' }}
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep >= step.number
                            ? 'bg-gradient-to-r from-purple-700 to-purple-900 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-semibold whitespace-nowrap ${currentStep >= step.number ? 'text-purple-700' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 mt-5 transition-all ${
                          currentStep > step.number ? 'bg-purple-700' : 'bg-gray-200'
                        }`}
                        style={{ width: '80px', marginLeft: '8px' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Account Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="johndoe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <p className="text-gray-500 text-xs mt-1">Must be 8-64 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Physical Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">This information is optional but helps us provide better service.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                        placeholder="25"
                        min="18"
                        max="130"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                        placeholder="150"
                        min="0"
                        step="0.1"
                      />
                      <span className="ml-3 text-gray-600 font-medium">lbs</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Height
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex items-center flex-1">
                        <input
                          type="number"
                          value={heightFt}
                          onChange={(e) => setHeightFt(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                          placeholder="5"
                          min="0"
                          max="10"
                        />
                        <span className="ml-2 text-gray-600 font-medium">ft</span>
                      </div>
                      <div className="flex items-center flex-1">
                        <input
                          type="number"
                          value={heightIn}
                          onChange={(e) => setHeightIn(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                          placeholder="8"
                          min="0"
                          max="11"
                        />
                        <span className="ml-2 text-gray-600 font-medium">in</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Medical Info */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">Optional medical information for better tracking.</p>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Diagnoses
                    </label>
                    <textarea
                      value={currentDiagnoses}
                      onChange={(e) => setCurrentDiagnoses(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                      placeholder="Enter your current diagnoses..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical History
                    </label>
                    <textarea
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                      placeholder="Enter your medical history..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Insurance Provider
                    </label>
                    <textarea
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors resize-none"
                      placeholder="Enter your insurance information..."
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/signin" className="text-purple-700 hover:text-purple-900 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  )
}

