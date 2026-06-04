import JourneyLayer from "./journey/JourneyLayer";
import ConversionHub from "./conversion/ConversionHub";

/*

* 既存実装
* プロジェクト内の実際のコンポーネント名へ置換
  */
//   import JourneyRanking from "./ranking/JourneyRanking";
//   import LatestReports from "./post/LatestReports";
//   import ArchiveSection from "./videos/ArchiveSection";

export default async function HomePage() {
return (
<>
{/* HERO */} <section>
{/* 既存Hero */} </section>


  {/* JOURNEY */}
  <JourneyLayer />

  {/* CONVERSION HUB */}
  <ConversionHub />

    {/* Phase 2 */}
    {/* <JourneyRanking /> */}

    {/* Phase 3 */}
    {/* <LatestReports /> */}

    {/* Phase 4 */}
    {/* <ArchiveSection /> */}
</>


);
}
