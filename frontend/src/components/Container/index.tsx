import styles from './styles.module.css';

type ContainerProps = {
  children: React.ReactNode;
  background?: string;
};

export function Container({ children, background = '#f8f9fa' }: ContainerProps) {
  return (
    <>
        <div className={styles.container} style={{ background }}>
            <div className={styles.content}>{children}</div>
        </div>
    </>
  );
}