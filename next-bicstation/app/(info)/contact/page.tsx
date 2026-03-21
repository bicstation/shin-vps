// app/(info)/contact/page.tsx

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー部分 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            お問い合わせ
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            BICSTATIONへのご意見・ご質問はこちらのフォームよりお願いいたします。
          </p>
        </div>

        {/* フォーム本体 */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLScFrjjEYGs9IGpx-80r-3YHjGJqEDVJIvgItvapjZfQq4VP_A/viewform?embedded=true"
            width="100%"
            height="800"
            className="w-full border-none"
            title="お問い合わせフォーム"
          >
            読み込んでいます…
          </iframe>
        </div>

        {/* 補足メッセージ */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ※通常3営業日以内にご返信いたします。
        </p>
      </div>
    </main>
  )
}