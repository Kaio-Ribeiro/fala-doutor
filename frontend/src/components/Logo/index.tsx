import styles from './styles.module.css';

export function Logo() {
  return (
    <div className={styles.logo}>
      <h1 className={styles.h1}>Fala Doutor</h1>
      <p className={styles.p}>Selecione um módulo para gerenciar</p>
    </div>
  )
}