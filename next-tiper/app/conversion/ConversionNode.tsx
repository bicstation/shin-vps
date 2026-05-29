import Link from "next/link";
import styles from "./ConversionHub.module.css";
import type { ConversionNodeConfig } from "./conversion.config";

type Props = {
node: ConversionNodeConfig;
};

export default function ConversionNode({
node,
}: Props) {
return ( <article className={styles.card}> <header className={styles.cardHeader}> <span className={styles.terminal}>
{node.terminal} </span> </header>


  <div className={styles.cardBody}>
    <h3 className={styles.mission}>
      {node.mission}
    </h3>

    <p className={styles.cardDescription}>
      {node.description}
    </p>
  </div>

  <footer className={styles.cardFooter}>
    <Link
      href={node.href}
      className={styles.enterButton}
    >
      {node.cta}
    </Link>
  </footer>
</article>


);
}
