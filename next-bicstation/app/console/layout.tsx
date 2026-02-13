// ✅ サーバー側で動的レンダリングを強制
export const dynamic = "force-dynamic";

import ConsoleLayoutClient from './ConsoleLayoutClient';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <ConsoleLayoutClient>{children}</ConsoleLayoutClient>;
}