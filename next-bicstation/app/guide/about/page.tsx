import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運営者情報 | BIC STATION",
  description: "BIC STATIONの運営者情報をご案内します。",
};

const operatorInfo = {
  name: "{{OPERATOR_NAME}}",
  representative: "{{OPERATOR_REPRESENTATIVE}}",
  address: "{{OPERATOR_ADDRESS}}",
  contact: "{{OPERATOR_CONTACT}}",
  email: "{{OPERATOR_EMAIL}}",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 text-slate-100 md:px-8 md:py-16">
      <article className="space-y-10">
        <header className="space-y-4 border-b border-slate-700 pb-8">
          <p className="text-sm font-medium text-slate-400">
            BIC STATION
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            運営者情報
          </h1>

          <p className="text-sm leading-7 text-slate-300">
            BIC STATIONの運営者情報をご案内します。
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">
            運営者情報
          </h2>

          <dl className="divide-y divide-slate-700 border-y border-slate-700">
            <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-white">
                運営者
              </dt>
              <dd className="text-slate-300">
                {operatorInfo.name}
              </dd>
            </div>

            <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-white">
                代表者
              </dt>
              <dd className="text-slate-300">
                {operatorInfo.representative}
              </dd>
            </div>

            <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-white">
                所在地
              </dt>
              <dd className="whitespace-pre-line text-slate-300">
                {operatorInfo.address}
              </dd>
            </div>

            <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-white">
                お問い合わせ
              </dt>
              <dd className="text-slate-300">
                {operatorInfo.contact}
              </dd>
            </div>

            <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-white">
                メールアドレス
              </dt>
              <dd className="text-slate-300">
                {operatorInfo.email}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            BIC STATIONについて
          </h2>

          <p className="leading-8 text-slate-300">
            BIC STATIONは、パソコンに関する商品情報や比較情報を提供し、
            利用者の商品選択をサポートする情報サイトです。
          </p>

          <p className="leading-8 text-slate-300">
            掲載されている商品情報、価格、在庫、仕様その他の情報については、
            各メーカーおよび販売事業者等の公式情報をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            外部サイトについて
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトでは、メーカー、販売事業者その他の外部サイトへの
            リンクを掲載する場合があります。
          </p>

          <p className="leading-8 text-slate-300">
            外部サイトにおける商品情報、価格、在庫、販売条件および
            個人情報の取り扱いについては、各外部サイトをご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            プライバシーポリシー
          </h2>

          <p className="leading-8 text-slate-300">
            当サイトにおける個人情報および個人に関する情報の取り扱いについては、
            プライバシーポリシーをご確認ください。
          </p>

          <a
            href="/guide/privacy-policy"
            className="inline-flex font-medium text-slate-200 underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            プライバシーポリシー
          </a>
        </section>

        <footer className="border-t border-slate-700 pt-8 text-sm text-slate-400">
          <p>制定日：2026年8月14日</p>
          <p className="mt-2">BIC STATION</p>
        </footer>
      </article>
    </main>
  );
}