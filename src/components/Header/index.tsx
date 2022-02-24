import styles from "./header.module.scss";
import Link from 'next/link';


export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a >
            <img src="/logo.svg" alt="logo"></img>
          </a>
        </Link>
      </div>
    </header>
  )
}