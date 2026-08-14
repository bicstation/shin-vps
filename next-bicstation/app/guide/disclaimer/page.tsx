import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責事項 | BIC STATION",
  description:
    "BIC STATIONに掲載されている情報および当サイトの利用に関する免責事項をご案内します。",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 text-slate-100 md:px-8 md:py-16">
      <article className="space-y-10">
        <header className="space-y-4 border-b border-slate-700 pb-8">
          <p className="text-sm font-medium text-slate-400">
            BIC STATION
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            免責事項
          </h1>

          <p className="text-sm leading-7 text-slate-300">
            BIC STATIONに掲載されている情報および当サイトの利用に関する
            免責事項をご案内します。
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            1. 掲載情報について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、メーカー、販売事業者その他の情報源から取得した
            商品情報を整理し、利用者の商品選択を支援する目的で掲載しています。
          </p>

          <p className="leading-8 text-slate-300">
            当サイトは掲載情報について可能な限り正確な情報を提供するよう
            努めていますが、その完全性、正確性、最新性または特定の目的への
            適合性を保証するものではありません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            2. 商品情報・仕様について
          </h2>

          <p className="leading-8 text-slate-300">
            商品名、メーカー名、型番、CPU、GPU、メモリ、ストレージ、
            ディスプレイその他の商品仕様は、情報取得時点または掲載時点の
            情報となる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            メーカーによる仕様変更、販売終了、モデル変更その他の事情により、
            当サイトの掲載内容と現在の公式情報が異なる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            商品の購入または利用を検討する場合は、必ずメーカーまたは
            販売事業者の公式サイト等で最新の情報をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            3. 価格・在庫情報について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトに表示される商品価格、在庫状況、販売条件、送料、
            ポイントその他の情報は、取得時点または表示時点の情報です。
          </p>

          <p className="leading-8 text-slate-300">
            これらの情報は販売事業者によって予告なく変更される場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            実際の購入時には、遷移先の販売事業者の公式サイト等に表示される
            最新の情報を必ずご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            4. 商品画像について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトの商品画像は、商品の理解を補助する目的で掲載しています。
          </p>

          <p className="leading-8 text-slate-300">
            商品画像の取得状況等により、実際の商品とは異なるデモ画像または
            代表画像を使用する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            商品の実際の外観、カラー、構成、付属品その他の詳細については、
            メーカーまたは販売事業者の公式サイトをご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            5. 検索・比較・ランキングについて
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、商品情報を検索、比較、ランキングその他の方法で
            整理して表示しています。
          </p>

          <p className="leading-8 text-slate-300">
            これらの表示は、利用者の商品選択を支援するための情報提供を
            目的としたものであり、特定の商品を購入することを推奨、
            保証するものではありません。
          </p>

          <p className="leading-8 text-slate-300">
            ランキング、検索結果その他の表示内容は、利用するデータ、
            条件およびシステムの状態等によって変動する場合があります。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            6. Discover・商品評価情報について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、商品情報を一定の条件や特徴に基づいて整理し、
            商品の発見や比較を支援する情報を提供する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            これらの情報は商品選択を支援するための参考情報であり、
            利用者の用途、環境、予算その他の条件における商品の適合性を
            保証するものではありません。
          </p>

          <p className="leading-8 text-slate-300">
            実際の商品仕様やメーカーによる公式な位置付けについては、
            必ず公式情報をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            7. 外部サイトについて
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトには、メーカー、販売事業者その他の第三者が運営する
            外部サイトへのリンクが含まれる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトへ移動した後のサービス内容、商品情報、価格、
            在庫、販売条件、個人情報の取り扱いその他について、
            当サイトは責任を負いません。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトの利用については、各サイトが定める利用規約、
            プライバシーポリシーその他の条件をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            8. アフィリエイト・広告について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、アフィリエイトプログラムその他の広告サービスを
            利用する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトへのリンクを経由して商品等が購入された場合、
            当サイトが紹介料その他の報酬を受け取る場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            アフィリエイトその他の広告による報酬の有無は、当サイトに掲載する
            商品情報の正確性、商品の性能または利用者にとっての適合性を
            保証するものではありません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            9. 当サイトの利用について
          </h2>

          <p className="leading-8 text-slate-300">
            利用者は、当サイトに掲載されている情報を自己の判断と責任に
            おいて利用するものとします。
          </p>

          <p className="leading-8 text-slate-300">
            当サイトの利用または掲載情報の利用によって生じた損害、
            損失その他の不利益について、法令上認められる範囲において、
            当サイトは責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            10. サービスの変更・停止について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトは、システムメンテナンス、障害、外部サービスの停止、
            天災その他の事情により、予告なくサービスの全部または一部を
            変更、停止または終了する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            これらによって利用者に生じた損害について、法令上認められる
            範囲において、当サイトは責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            11. 免責事項の変更
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトは、サービス内容、掲載情報、関連法令その他の変更に
            応じて、本免責事項を変更する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            変更後の免責事項は、当サイト上に掲載した時点から適用される
            ものとします。
          </p>
        </section>

        <section className="space-y-4 border-t border-slate-700 pt-8">
          <h2 className="text-xl font-bold text-white">
            関連情報
          </h2>

          <div className="flex flex-col gap-3">
            <a
              href="/guide/about"
              className="font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              運営者情報
            </a>

            <a
              href="/guide/guideline"
              className="font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              ご利用ガイドライン
            </a>

            <a
              href="/guide/ads-policy"
              className="font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              広告について
            </a>

            <a
              href="/guide/privacy-policy"
              className="font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              プライバシーポリシー
            </a>
          </div>
        </section>

        <footer className="border-t border-slate-700 pt-8 text-sm text-slate-400">
          <p>制定日：2026年8月14日</p>
          <p className="mt-2">BIC STATION</p>
        </footer>
      </article>
    </main>
  );
}