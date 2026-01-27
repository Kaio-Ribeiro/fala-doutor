import { Container } from "../../components/Container";
import { Logo } from "../../components/Logo";
import { Card } from "../../components/Card";
import { useNavigate } from 'react-router-dom';

import styles from './styles.module.css';
import { Stethoscope, Users } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Logo />

      <div className={styles.cardContainer}>
        <Card
          title="Doutores"
          subtitle="Gerencie o cadastro de médicos e seus dados"
          icon={<Stethoscope size={64} color="#2563EB" />}
          bgColor="#DBEAFE"
          accessTextColor="#2563EB"
          onClick={() => navigate('/list/doctors')}
        />

        <Card
          title="Pacientes"
          subtitle="Gerencie o cadastro de pacientes e seus dados"
          icon={<Users size={64} color="#059669" />}
          bgColor="#D1FAE5"
          accessTextColor="#059669"
          onClick={() => navigate('/list/patients')}
        />
      </div>

    </Container>
  );
}