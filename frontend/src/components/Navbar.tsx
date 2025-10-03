import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AuthService from '../utils/auth'

export default function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = AuthService.isAuthenticated()
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const user = await AuthService.getCurrentUser()
        if (user) {
          setUsername(user.username)
        }
      } else {
        setUsername('')
      }
    }

    checkAuth()
  }, [location.pathname])

  const handleLogout = async () => {
    await AuthService.logout()
    setIsAuthenticated(false)
    setUsername('')
    navigate('/signin')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent hover:from-purple-800 hover:to-purple-950 transition-all">
                Med Assist
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-purple-700 px-3 py-2 text-lg font-medium transition-colors"
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-purple-700 px-3 py-2 text-lg font-medium transition-colors"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 px-3 py-2 text-lg font-medium">
                  Welcome, <span className="text-purple-700 font-semibold">{username}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-2.5 rounded-lg text-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-2.5 rounded-lg text-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="text-purple-700 hover:text-white px-6 py-2.5 rounded-lg text-lg font-medium transition-all border-2 border-purple-700 hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
