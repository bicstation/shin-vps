import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ご利用ガイドライン | BIC STATION",
  description:
    "BIC STATIONをご利用いただく際の基本的なガイドラインをご案内します。",
};

export default function GuidelinePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 text-slate-100 md:px-8 md:py-16">
      <article className="space-y-10">
        <header className="space-y-4 border-b border-slate-700 pb-8">
          <p className="text-sm font-medium text-slate-400">
            BIC STATION
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            ご利用ガイドライン
          </h1>

          <p className="text-sm leading-7 text-slate-300">
            BIC STATIONをご利用いただく際の基本的な考え方、
            掲載情報の取り扱いおよび商品情報をご確認いただく際の
            注意事項をご案内します。
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            1. BIC STATIONについて
          </h2>

          <p className="leading-8 text-slate-300">
            BIC STATIONは、パソコンに関する商品情報を整理し、
            商品の比較、検索、ランキング、Discoverその他の
            Product Experienceを通じて、利用者の商品選択を
            サポートする情報サイトです。
          </p>

          <p className="leading-8 text-slate-300">
            当サイトは、利用者が商品を理解し、自分に適した商品を
            探すための情報を提供することを目的としています。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            2. 商品情報について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、メーカー、販売事業者その他の情報源から
            取得した商品情報を掲載しています。
          </p>

          <p className="leading-8 text-slate-300">
            商品名、メーカー名、仕様、価格、在庫状況、画像その他の
            情報は、情報取得時点または掲載時点の内容となる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            商品情報は変更される場合がありますので、購入を検討される際は、
            必ずメーカーまたは販売事業者等の公式サイトで最新の情報を
            ご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            3. 商品価格について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトに表示される価格は、取得時点または表示時点における
            情報です。
          </p>

          <p className="leading-8 text-slate-300">
            販売価格、セール価格、ポイント、送料、在庫状況その他の
            販売条件は、販売事業者によって変更される場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            実際に購入される際には、遷移先の販売事業者の公式サイト等で
            最終的な価格および販売条件をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            4. 商品画像について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトの商品画像は、商品情報の理解を補助する目的で
            掲載しています。
          </p>

          <p className="leading-8 text-slate-300">
            商品画像が掲載できない場合や、デモ用の画像を使用している
            場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            商品画像と実際の商品外観、仕様または構成が異なる場合があります。
            実際の商品については、メーカーまたは販売事業者の公式サイトで
            ご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            5. 検索・比較・ランキングについて
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、商品情報を検索、比較、ランキングその他の
            方法で整理して表示しています。
          </p>

          <p className="leading-8 text-slate-300">
            これらの表示は、利用者の商品選択を支援するための情報提供を
            目的としたものであり、特定の商品について購入を強制または
            保証するものではありません。
          </p>

          <p className="leading-8 text-slate-300">
            ランキング、検索結果その他の表示内容は、使用するデータ、
            条件およびRuntime等により変動する場合があります。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            6. Discoverについて
          </h2>

          <p className="leading-8 text-slate-300">
            Discoverでは、商品情報を一定の意味や特徴に基づいて整理し、
            利用者が自分に適した商品を発見するための情報を提供します。
          </p>

          <p className="leading-8 text-slate-300">
            Discoverで表示される分類、説明、理由その他の情報は、
            商品選択を支援するための参考情報です。
          </p>

          <p className="leading-8 text-slate-300">
            実際の商品仕様やメーカーによる公式な位置付けについては、
            必ずメーカー等の公式情報をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            7. 商品選択について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトは、利用者の商品選択を支援するための情報を提供しますが、
            利用者ごとの用途、環境、予算その他の条件によって適切な商品は
            異なります。
          </p>

          <p className="leading-8 text-slate-300">
            当サイトに掲載される情報だけで購入を判断せず、必要に応じて
            メーカーまたは販売事業者の公式情報をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            8. 外部サイトについて
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトには、メーカー、販売事業者その他の外部サイトへの
            リンクが含まれる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトへ移動した後のサービス内容、商品情報、価格、
            在庫、販売条件、個人情報の取り扱いその他については、
            各外部サイトの規約およびプライバシーポリシー等をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            9. アフィリエイトおよび広告について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、サービスの運営および情報提供のため、
            アフィリエイトプログラムその他の広告サービスを利用する
            場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトへのリンクを経由して商品等が購入された場合、
            当サイトが紹介料その他の報酬を受け取る場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            これらの報酬の有無が、当サイトに掲載される商品情報の
            正確性を保証するものではありません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            10. 情報の正確性について
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトは、掲載する情報について可能な限り正確な情報を
            提供するよう努めています。
          </p>

          <p className="leading-8 text-slate-300">
            ただし、情報源側の更新、仕様変更、価格変更、販売終了その他の
            理由により、掲載情報と現在の情報が異なる場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            当サイトは、掲載情報の完全性、正確性、最新性または
            特定の目的への適合性を保証するものではありません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            11. 利用者へのお願い
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトをご利用の際は、以下の点をご確認ください。
          </p>

          <ul className="list-disc space-y-2 pl-6 leading-8 text-slate-300">
            <li>
              商品の購入前にメーカーまたは販売事業者の公式情報を確認すること
            </li>
            <li>
              価格、在庫、販売条件等を購入時点で確認すること
            </li>
            <li>
              商品画像だけで商品の仕様や構成を判断しないこと
            </li>
            <li>
              利用者自身の用途、予算、環境等を考慮して商品を選択すること
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            12. ガイドラインの変更
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトは、サービス内容の変更、掲載情報の変更その他必要に
            応じて、本ガイドラインを変更する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            変更後のガイドラインは、当サイト上に掲載した時点から
            適用されるものとします。
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