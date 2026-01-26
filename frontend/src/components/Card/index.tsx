import styles from './style.module.css';
import { Stethoscope, Users } from 'lucide-react';

export function Card() {
  return (
    <div className={styles.cardContainer}>
        <div className={styles.cardContent}>
            <div className={styles.card}>
                <div className={styles.icon} style={{backgroundColor: '#DBEAFE'}}>
                    <Stethoscope size={64} color="#2563EB" />
                </div>
                <h2 className={styles.h2}>Doutores</h2>
                <p className={styles.p}>Gerencie o cadastro de médicos e seus dados</p>

                <div className={styles.accessDiv} style={{backgroundColor: '#DBEAFE', color: '#2563EB'}}>
                    <span className={styles.accessText}>Acessar →</span>
                </div>
            </div>
        </div>

        <div className={styles.cardContent}>
            <div className={styles.card}>
                <div className={styles.icon} style={{backgroundColor: '#D1FAE5'}}>
                    <Users size={64} color="#059669" />
                </div>
                <h2 className={styles.h2}>Pacientes</h2>
                <p className={styles.p}>Gerencie o cadastro de pacientes e seus dados</p>
                
                <div className={styles.accessDiv} style={{backgroundColor: '#D1FAE5', color: '#059669'}}>
                    <span className={styles.accessText}>Acessar →</span>
                </div>
            </div>
        </div>
    </div>
  )
}