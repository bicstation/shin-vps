import styles from "./ConversionHub.module.css";
import { conversionNodes } from "./conversion.config";
import ConversionNode from "./ConversionNode";

export default function ConversionHub() {
return ( <section className={styles.section}> <div className={styles.container}> <header className={styles.header}> <span className={styles.kicker}>
CONVERSION HUB </span>


      <h2 className={styles.title}>
        Choose Your Mission
      </h2>

      <p className={styles.description}>
        次に進むべきルートを選択してください。
        TIPERは比較・判断・行動を支援します。
      </p>
    </header>

    <div className={styles.grid}>
      {conversionNodes.map((node) => (
        <ConversionNode
          key={node.id}
          node={node}
        />
      ))}
    </div>
  </div>
</section>


);
}
