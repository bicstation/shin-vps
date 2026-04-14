"use client";

/**
 * 🛰️ BIC-SAVING: Privacy Policy (Client Component)
 * ------------------------------------------------------
 * 🔧 修正・最適化ポイント:
 * 1. 個人情報保護法への準拠: 日本国内の法規制に沿った日本語表記。
 * 2. データ収集の透明性: アクセス解析（GA4）やCookieの利用を明記。
 * 3. セキュリティ意識: エンジニア運営サイトとしての安全管理措置への言及。
 */

export const dynamic = "force-dynamic";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    ShieldCheck, 
    Lock, 
    Eye, 
    UserPlus, 
    Database, 
    Mail 
} from 'lucide-react';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

function PrivacyPolicyContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'collection', text: '個人情報の収集方法' },
    { id: 'purpose', text: '個人情報の利用目的' },
    { id: 'cookie', text: 'Cookie（クッキー）の利用' },
    { id: 'third-party', text: '個人情報の第三者提供' },
    { id: 'security', text: '安全管理措置（セキュリティ）' },
    { id: 'contact', text: 'お問い合わせ窓口' },
  ];

  return (
    <StaticPageLayout 
      title="Privacy Policy"
      description="当サイトは、読者の皆様のプライバシーを尊重し、個人情報を適切に保護することをお約束します。"
      lastUpdated="2026年4月14日"
      toc={toc}
    >
      <section id="collection">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="text-emerald-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">1. 個人情報の収集方法</h2>
        </div>
        <p className="leading-relaxed mb-4">
          当サイトでは、お問い合わせフォームの利用やコメントの投稿に際して、お名前（ハンドルネーム）やメールアドレス等の個人情報を入力いただく場合があります。
        </p>
        <p className="leading-relaxed">
          これらの情報は、ユーザーが自発的に提供した場合にのみ収集され、不正な手段によって取得することはありません。
        </p>
      </section>

      <section id="purpose" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="text-blue-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">2. 個人情報の利用目的</h2>
        </div>
        <p className="leading-relaxed mb-4">
          収集した個人情報は、以下の目的でのみ利用し、目的外の利用は行いません。
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>お問い合わせいただいた内容への回答、および必要な情報の提供</li>
          <li>サイトの利便性向上を目的とした統計データの分析</li>
          <li>不正利用やスパム行為の防止</li>
        </ul>
      </section>

      <section id="cookie" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-purple-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">3. Cookie（クッキー）の利用</h2>
        </div>
        <p className="leading-relaxed mb-4">
          当サイトでは、広告配信やアクセス解析のためにCookieを使用しています。
        </p>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
          <p className="text-sm">
            Cookieはサイト利用時にブラウザに保存される識別子ですが、お名前や住所などの個人を特定する情報は一切含まれません。
          </p>
          <p className="text-sm">
            当サイトではGoogleアナリティクスを利用しており、トラフィックデータ収集のためにCookieを使用しています。ブラウザの設定でCookieを無効にすることで、収集を拒否することが可能です。
          </p>
        </div>
      </section>

      <section id="third-party" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-emerald-400 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">4. 個人情報の第三者提供</h2>
        </div>
        <p className="leading-relaxed">
          お預かりした個人情報は、次の場合を除いて第三者に開示することはありません。
        </p>
        <ul className="space-y-2 list-disc pl-5 mt-4">
          <li>ご本人の同意がある場合</li>
          <li>法令に基づき、公的機関から開示を求められた場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
        </ul>
      </section>

      <section id="security" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="text-orange-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">5. 安全管理措置</h2>
        </div>
        <p className="leading-relaxed">
          当サイトは、エンジニアによる運営体制のもと、SSL（Secure Sockets Layer）による通信の暗号化や、サーバー側の適切なアクセス制御を実施し、個人情報の漏洩、滅失、または毀損の防止に努めます。
        </p>
      </section>

      <section id="contact" className="mt-12 border-t border-slate-800 pt-12">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="text-pink-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">6. お問い合わせ窓口</h2>
        </div>
        <p className="leading-relaxed">
          プライバシーポリシーに関するご質問や、個人情報の修正・削除の依頼については、お問い合わせフォームよりご連絡ください。
        </p>
      </section>
    </StaticPageLayout>
  );
}

export default PrivacyPolicyContent;