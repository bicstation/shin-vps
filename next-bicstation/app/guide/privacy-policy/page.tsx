import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | BIC STATION",
  description: "BIC STATIONにおける個人情報および個人に関する情報の取り扱いについて。",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <article className="space-y-10">
        <header className="space-y-4 border-b border-gray-200 pb-8">
          <p className="text-sm font-medium text-gray-500">
            BIC STATION
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            プライバシーポリシー
          </h1>

          <p className="text-sm leading-7 text-gray-600">
            BIC STATION（以下「当サイト」といいます。）は、当サイトを
            利用される皆様の個人情報および個人に関する情報を適切に
            取り扱うことを重要な責務と考えています。
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            1. 基本方針
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、個人情報の保護に関する法律その他の関連法令を
            遵守し、取得した情報を適切に管理します。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            2. 取得する情報
          </h2>

          <h3 className="text-lg font-semibold text-gray-900">
            2.1 利用者から提供される情報
          </h3>

          <p className="leading-8 text-gray-700">
            お問い合わせその他の機能の利用に際して、利用者から以下の
            情報をご提供いただく場合があります。
          </p>

          <ul className="list-disc space-y-2 pl-6 leading-8 text-gray-700">
            <li>氏名</li>
            <li>メールアドレス</li>
            <li>お問い合わせ内容</li>
            <li>その他、利用者が任意に提供する情報</li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            2.2 自動的に取得される情報
          </h3>

          <p className="leading-8 text-gray-700">
            当サイトでは、サービスの提供、利用状況の把握、障害対応および
            サイト改善等のため、以下の情報を取得する場合があります。
          </p>

          <ul className="list-disc space-y-2 pl-6 leading-8 text-gray-700">
            <li>IPアドレス</li>
            <li>ブラウザおよび端末に関する情報</li>
            <li>アクセス日時</li>
            <li>閲覧したページ</li>
            <li>リファラ情報</li>
            <li>Cookieその他の端末識別子</li>
            <li>サイト内での利用状況</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            3. 利用目的
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、取得した情報を以下の目的で利用します。
          </p>

          <ol className="list-decimal space-y-2 pl-6 leading-8 text-gray-700">
            <li>当サイトの提供および運営</li>
            <li>
              商品情報、検索、比較、ランキング、Discoverその他の機能の提供
            </li>
            <li>お問い合わせへの対応</li>
            <li>サービスおよびユーザー体験の改善</li>
            <li>サイトの利用状況の分析</li>
            <li>不正利用、障害その他の問題の調査および対応</li>
            <li>システムの安全性および安定性の確保</li>
            <li>当サイトに関する重要なお知らせ</li>
            <li>その他、取得時に明示した目的</li>
          </ol>

          <p className="leading-8 text-gray-700">
            取得した個人情報は、法令により認められる場合を除き、
            利用目的の達成に必要な範囲を超えて利用しません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            4. 商品情報および外部サイトへのリンク
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトでは、メーカー、販売事業者その他の外部情報源から
            取得した商品情報を掲載する場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            商品情報、価格、在庫、仕様、画像その他の情報については、
            掲載時点または取得時点の情報であり、最新かつ正確であることを
            保証するものではありません。
          </p>

          <p className="leading-8 text-gray-700">
            購入その他の取引を行う場合は、遷移先となるメーカーまたは
            販売事業者の公式サイト等において、最新の情報をご確認ください。
          </p>

          <p className="leading-8 text-gray-700">
            また、当サイトには外部サイトへのリンク、アフィリエイトリンク
            その他の外部サービスへの導線が含まれる場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            リンク先の外部サイトにおける個人情報の取り扱いについては、
            それぞれの事業者が定めるプライバシーポリシー等をご確認ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            5. Cookie等の利用
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトでは、サイトの機能提供、利用状況の分析、サービス改善
            その他の目的でCookie等を利用する場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            Cookieは、利用者のブラウザに保存される情報です。
            利用者はブラウザの設定によりCookieの受け入れを拒否することが
            できます。
          </p>

          <p className="leading-8 text-gray-700">
            ただし、Cookieを無効にした場合、当サイトの一部の機能が
            正常に利用できなくなる場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            また、第三者が提供するアクセス解析、広告、SNSその他の
            サービスを利用する場合、当該第三者にCookie等を通じて情報が
            送信される場合があります。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            6. 第三者提供
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、以下の場合を除き、取得した個人情報を本人の同意なく
            第三者へ提供しません。
          </p>

          <ul className="list-disc space-y-2 pl-6 leading-8 text-gray-700">
            <li>本人の同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>
              人の生命、身体または財産の保護のために必要であり、
              本人の同意を得ることが困難な場合
            </li>
            <li>その他、法令上認められる場合</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            7. 委託先の管理
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、サービスの提供、サーバー運用、システム保守、
            アクセス解析その他の業務を行うため、必要な範囲で個人情報の
            取り扱いを外部事業者へ委託する場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            この場合、委託先に対して適切な監督を行います。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            8. 安全管理
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、取得した個人情報について、漏えい、滅失または
            毀損等を防止するため、必要かつ適切な安全管理措置を講じます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            9. 開示・訂正・利用停止等
          </h2>

          <p className="leading-8 text-gray-700">
            本人から、当サイトが保有する本人の個人情報について、
            開示、訂正、追加、削除、利用停止その他の請求を受けた場合、
            法令に従い適切に対応します。
          </p>

          <p className="leading-8 text-gray-700">
            請求方法については、下記のお問い合わせ窓口までご連絡ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            10. 外部サービス
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトでは、サービスの提供または改善のため、第三者が提供する
            サービスを利用する場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            利用する外部サービス、その提供者、取得される情報および利用目的
            については、実際の導入状況に応じて、本ポリシーまたは別途の
            情報提供ページにおいて明示します。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            11. 未成年者について
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、未成年者による利用を想定したサービスについて、
            必要に応じて適切な対応を行います。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            12. プライバシーポリシーの変更
          </h2>

          <p className="leading-8 text-gray-700">
            当サイトは、法令の変更、サービス内容の変更その他必要に応じて、
            本プライバシーポリシーを変更する場合があります。
          </p>

          <p className="leading-8 text-gray-700">
            変更後のプライバシーポリシーは、当サイト上に掲載した時点から
            適用されるものとします。
          </p>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900">
            13. お問い合わせ窓口
          </h2>

          <div className="space-y-2 leading-8 text-gray-700">
            <p>
              <strong>運営者：</strong>
              SHIN COER LINX  渡辺雅勝
            </p>

            <p>
              <strong>所在地：</strong>
              茨城県坂東市大口２５９５－１
            </p>

            <p>
              <strong>お問い合わせ：</strong>
              <a href="https://bicstation.com/contact">こちらから</a>
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-200 pt-8 text-sm text-gray-500">
          <p>制定日：2026年8月14日</p>
          <p className="mt-2">BIC STATION</p>
        </footer>
      </article>
    </main>
  );
}