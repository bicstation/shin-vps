/* eslint-disable @next/next/no-img-element */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import styles from "./layout.module.css";

import '@/shared/styles/globals.css';

import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper';
import RouteProgressBar from '@/shared/components/atoms/RouteProgressBar';

import { constructMetadata } from '@/shared/lib/utils/metadata';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  console.log("🔥 [LAYOUT] generateMetadata");

  const host = "tiper.live";

  return constructMetadata({
    manualHost: host
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  console.log("🔥 [LAYOUT] RootLayout START");

  const host = "tiper.live";

  const site = getSiteMetadata(host);

  const siteName = site?.site_name || "Tiper";
  const themeColor = getSiteColor(host);

  console.log("🔥 [LAYOUT] SITE:", {
    host,
    siteName,
    themeColor,
  });

  const BG_COLOR = "#06060a";

  console.log("🔥 [LAYOUT] BEFORE RENDER");

  return (
    <html lang="ja" style={{ height: '100%', backgroundColor: BG_COLOR }}>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: BG_COLOR,
          color: "#ffffff",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
        }}
      >

        {console.log("🔥 [LAYOUT] BODY RENDER")}

        {/* Progress */}
        {console.log("🔥 [LAYOUT] RouteProgressBar")}
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>

        {console.log("🔥 [LAYOUT] SYSTEM GRID")}
        <div className={styles.systemGrid} />

        {/* Header */}
        {console.log("🔥 [LAYOUT] HEADER")}
        <Header />

        {/* Ad */}
        {console.log("🔥 [LAYOUT] AD BLOCK")}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            <span className={styles.prLabel}>【PR】</span>
            本サイトはアフィリエイト広告を利用しています。
            {site?.site_group === 'adult' && (
              <span className={styles.ageLimit}>
                ※18歳未満の閲覧は禁止されています。
              </span>
            )}
          </div>
        </div>

        {/* Layout */}
        {console.log("🔥 [LAYOUT] MAIN LAYOUT START")}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutWrapper}>

            {/* Sidebar */}
            {console.log("🔥 [LAYOUT] SIDEBAR START")}
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={<div />}>
                  {console.log("🔥 [LAYOUT] SidebarWrapper RENDER")}
                  <SidebarWrapper />
                </Suspense>
              </div>
            </aside>

            {/* Main */}
            {console.log("🔥 [LAYOUT] MAIN CONTENT START")}
            <main className={styles.mainContent}>
              <Suspense fallback={<div>Loading...</div>}>
                {console.log("🔥 [LAYOUT] CHILDREN RENDER", children)}
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* Footer */}
        {console.log("🔥 [LAYOUT] FOOTER")}
        <Footer />

      </body>
    </html>
  );
}