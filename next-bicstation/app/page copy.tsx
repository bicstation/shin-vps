/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import Link from 'next/link';

// ❌ headers削除

import { 
    Activity, ShieldCheck, Zap, BarChart3, 
    ChevronRight, Cpu, Terminal,
    Layers, ArrowUpRight, Globe, Gauge,
    History, Database, HardDrive, Binary,
    Monitor, BookOpen, Briefcase, GraduationCap,
    Bot, Layout, Crown, ShieldAlert
} from 'lucide-react';

import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
import { fetchPostList } from '@/shared/lib/api/django/posts';             
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'; 

import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

async function safeFetch<T>(fetcher: any, args: any[], fallback: T): Promise<T> {
    try {
        if (typeof fetcher !== 'function') return fallback;
        const data = await fetcher(...args);
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [FETCH_ERROR]:`, e);
        return fallback;
    }
}

export async function generateMetadata() {
    const host = "bicstation.com"; // ✅ 固定
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 44年の知見が導くPC・AI解析の極致`,
        description: `14歳のマシン語から始まった44年のエンジニア履歴。`,
        manualHost: host // ✅ 修正
    });
}

export default async function HomePageMain() {

    const IS_ADSENSE_REVIEW = true; 

    const host = "bicstation.com"; // ✅ 固定
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag || 'bicstation';

    const [wpLogs, djangoPosts, scoreRank] = await Promise.all([
        safeFetch(fetchWPTechInsights, [6], []),
        safeFetch(fetchPostList, [3, 0, siteTag], { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking, ['score', host], []),
    ]);

    const satelliteLogs = Array.isArray(wpLogs) ? wpLogs : [];
    const corePosts = Array.isArray(djangoPosts?.results) ? djangoPosts.results : [];
    const aiTop3 = Array.isArray(scoreRank) ? scoreRank.slice(0, 3) : [];

    return (
        <div className={styles.mainWrapper}>
            {/* UIはそのままでOK */}
        </div>
    );
}