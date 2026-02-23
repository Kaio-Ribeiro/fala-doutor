import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { DoctorsPage } from './pages/Doctors';
import { PatientsPage } from './pages/Patients';
import { PlansPage } from './pages/Plans';
import { AppointmentsPage } from './pages/Appointments';
import { ReportsPage } from './pages/Reports';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
