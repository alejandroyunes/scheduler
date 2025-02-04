import './app.css'

import { Header } from './components/header'
import { Scheduling } from './components/scheduler'

function App() {

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <Header />
          <Scheduling />
        </div>
      </div>
    </div>
  )
}

export default App
