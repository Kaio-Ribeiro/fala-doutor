// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Fala Doutor API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});