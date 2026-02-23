import { useState, useEffect } from 'react';

interface UseAvailableTimeParams {
  doctorId: number;
  patientId: number;
  date: string;
  appointmentId?: number;
}

interface UseAvailableTimeReturn {
  availableTimeSlots: string[];
}

export function useAvailableTime({
  doctorId,
  patientId,
  date,
  appointmentId
}: UseAvailableTimeParams): UseAvailableTimeReturn {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    // Reset em caso de parâmetros inválidos
    if (!doctorId || doctorId <= 0 || !patientId || patientId <= 0 || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    const fetchAvailableTimes = async () => {
      try {
        const params = new URLSearchParams();
        params.append('doctor_id', doctorId.toString());
        params.append('patient_id', patientId.toString());
        params.append('date', date);
        
        if (appointmentId && appointmentId > 0) {
          params.append('appointment_id', appointmentId.toString());
        }

        const response = await fetch(`http://localhost:3000/api/appointments/available-times?${params}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const times: string[] = await response.json();
        setAvailableTimeSlots(times);
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        setAvailableTimeSlots([]);
      }
    };

    fetchAvailableTimes();
  }, [doctorId, patientId, date, appointmentId]);

  return {
    availableTimeSlots
  };
}
