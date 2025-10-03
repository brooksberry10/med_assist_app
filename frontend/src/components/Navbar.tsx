export default function AppNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* top left text */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent hover:from-purple-800 hover:to-purple-950 transition-all">
              Med Assist
            </a>
          </div>
          
          {/* centered links */}
          <div className="flex-1 flex justify-center items-center space-x-8">
            <a 
              href="#" 
              className="text-gray-700 hover:text-purple-700 px-3 py-2 text-lg font-medium transition-colors"
            >
              Home
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-purple-700 px-3 py-2 text-lg font-medium transition-colors"
            >
              Symptoms
            </a>
          </div>
          
          {/* auth buttons */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <a 
              href="/signin" 
              className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-6 py-2.5 rounded-lg text-lg font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              Sign In
            </a>
            <a 
              href="/register" 
              className="text-purple-700 hover:text-white px-6 py-2.5 rounded-lg text-lg font-medium transition-all border-2 border-purple-700 hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
