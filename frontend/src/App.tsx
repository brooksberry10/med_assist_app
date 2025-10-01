import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState("loading...")

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.text())
      .then(setText)
      .catch((e) => setText("error: " + e.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Med Assist
        </h1>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700 text-center">{text}</p>
        </div>
      </div>
    </div>
  )
}

export default App
