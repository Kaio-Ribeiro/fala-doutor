import styles from './styles.module.css';

export function Logo() {
  return (
    <div className={styles.logo}>
      <h1 className={styles.h1}>Fala Doutor</h1>
      <span className={styles.span}>Selecione um módulo para gerenciar</span>
    </div>
  )
}