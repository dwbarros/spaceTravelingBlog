import styles from "./header.module.scss";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <a href="/">
          <img src="/img/logo.svg"></img>
        </a>
      </div>
    </header>
  )
}
