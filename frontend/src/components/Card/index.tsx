import styles from './styles.module.css';

type CardProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  bgColor?: string;
  accessTextColor?: string;
};

export function Card({ title, subtitle, icon, bgColor, accessTextColor }: CardProps) {
  return (
    <div className={styles.cardContent}>
        <div className={styles.card}>
            <div className={styles.icon} style={{backgroundColor: bgColor}}>
                {icon}
            </div>
            <h2 className={styles.h2}>{title}</h2>
            <p className={styles.p}>{subtitle}</p>
            <div className={styles.accessDiv} style={{backgroundColor: bgColor, color: accessTextColor}}>
                <span className={styles.accessText}>Acessar →</span>
            </div>
        </div>
    </div>
  )
}