import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "広告について | BIC STATION",
  description:
    "BIC STATIONにおける広告、アフィリエイトプログラムおよび広告表示についてご案内します。",
};

export default function AdsPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 text-slate-100 md:px-8 md:py-16">
    <article className="space-y-10">
        <header className="space-y-4 border-b border-slate-700 pb-8">
        <p className="text-sm font-medium text-slate-400">
            BIC STATION
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            広告について
        </h1>

        <p className="text-sm leading-7 text-slate-300">
            BIC STATIONにおける広告、アフィリエイトプログラムおよび
            広告表示についてご案内します。
        </p>
        </header>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            1. 広告について
        </h2>

        <p className="leading-8 text-slate-300">
            BIC STATIONでは、サイトの運営およびサービスの提供を継続するため、
            広告サービスおよびアフィリエイトプログラムを利用する場合があります。
        </p>

        <p className="leading-8 text-slate-300">
            当サイトに掲載される広告や商品へのリンクには、広告または
            アフィリエイトによるものが含まれる場合があります。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            2. アフィリエイトプログラムについて
        </h2>

        <p className="leading-8 text-slate-300">
            当サイトでは、第三者が提供するアフィリエイトプログラムを
            利用する場合があります。
        </p>

        <p className="leading-8 text-slate-300">
            当サイトに掲載されたリンクを経由して商品やサービスが購入、
            申込みその他の条件を満たした場合、当サイトが紹介料その他の
            報酬を受け取ることがあります。
        </p>

        <p className="leading-8 text-slate-300">
            これらの報酬は、当サイトの運営およびコンテンツの提供に
            利用されます。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            3. 広告と商品情報の関係
        </h2>

        <p className="leading-8 text-slate-300">
            BIC STATIONでは、広告またはアフィリエイト報酬の有無にかかわらず、
            商品情報を利用者にとって分かりやすく提供することを基本方針としています。
        </p>

        <p className="leading-8 text-slate-300">
            広告掲載やアフィリエイト報酬の存在だけを理由として、
            商品の仕様、性能、価格その他の商品情報を変更するものではありません。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            4. 広告表示について
        </h2>

        <p className="leading-8 text-slate-300">
            当サイトでは、広告サービスの仕組みにより、利用者の閲覧状況や
            利用環境等に応じて表示される広告の内容が異なる場合があります。
        </p>

        <p className="leading-8 text-slate-300">
            広告の表示、配信および計測にCookieその他の技術が使用される
            場合があります。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            5. 外部サイトへのリンク
        </h2>

        <p className="leading-8 text-slate-300">
            BIC STATIONには、メーカー、販売事業者、広告主その他の
            外部サイトへのリンクが含まれる場合があります。
        </p>

        <p className="leading-8 text-slate-300">
            外部サイトへ移動した後の商品の販売条件、価格、在庫、
            サービス内容および個人情報の取り扱いについては、
            各外部サイトをご確認ください。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            6. 商品選択について
        </h2>

        <p className="leading-8 text-slate-300">
            BIC STATIONは、広告やアフィリエイトを通じて得られる報酬を
            目的として、利用者に特定の商品を購入するよう強制するものではありません。
        </p>

        <p className="leading-8 text-slate-300">
            商品の購入を検討される際は、価格、仕様、用途、販売条件その他の
            情報をご自身で確認したうえで判断してください。
        </p>
        </section>

        <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
            7. 広告情報の変更
        </h2>

        <p className="leading-8 text-slate-300">
            広告サービス、アフィリエイトプログラムその他の利用状況に
            応じて、本ページの内容を変更する場合があります。
        </p>

        <p className="leading-8 text-slate-300">
            変更後の内容は、当サイト上に掲載した時点から適用されます。
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
            href="/guide/disclaimer"
            className="font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
            免責事項
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