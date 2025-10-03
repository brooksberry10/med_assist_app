import AppNavbar from '../components/Navbar'
import AppFooter from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl p-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-8 text-center">
            Med Assist App Home
          </h1>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-8 mb-6 shadow-inner">
            <h2 className="text-2xl font-semibold text-purple-900 mb-4 text-center">
              Some Content Here
            </h2>
            <p className="text-gray-800 text-xl text-center font-medium">Welcome!</p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Welcome to Med Assist - Your comprehensive medical data tracking platform
            </p>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  )
}

