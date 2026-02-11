import AdultSidebar from './AdultSidebar';
import GeneralSidebar from './GeneralSidebar';
import { getSiteMetadata } from '../../lib/siteConfig';

export default function UnifiedSidebar(props: any) {
  const { site_group } = getSiteMetadata();
  
  // サイトグループに応じて、専用サイドバーを出し分ける
  return site_group === 'adult' 
    ? <AdultSidebar {...props} /> 
    : <GeneralSidebar {...props} />;
}