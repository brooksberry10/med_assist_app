import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Treatments from './pages/Treatments'
import Symptoms from './pages/Symptoms'
import FoodLogs from './pages/FoodLogs'

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/food-logs" element={<FoodLogs />} />
        </Routes>
      </Router>
    </HeroUIProvider>
  )
}

export default App
