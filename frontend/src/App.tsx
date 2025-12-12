import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Treatments from './pages/Treatments'
import Symptoms from './pages/Symptoms'
import FoodLogs from './pages/FoodLogs'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/treatments" element={<ProtectedRoute><Treatments /></ProtectedRoute>} />
          <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
          <Route path="/food-logs" element={<ProtectedRoute><FoodLogs /></ProtectedRoute>} />
        </Routes>
      </Router>
    </HeroUIProvider>
  )
}

export default App
