import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { StudyPage } from './pages/StudyPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh bg-white text-[#1A1A1A]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study/:id" element={<StudyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
