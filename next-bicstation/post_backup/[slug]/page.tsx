// @ts-nocheck

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  fetchPostData,
  fetchPostList,
} from '@/shared/lib/api/django/posts';

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import UnifiedProductCard
from '@/shared/components/organisms/cards/UnifiedProductCard';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function NewsDetailPage({
  params,
}: PageProps) {

  const { slug } = params;

  const host = 'bicstation.com';

  const siteData =
    getSiteMetadata(host);

  const rawProject =
    siteData?.site_name ||
    'bicstation';

  const currentProject =
    rawProject
      .replace(/\s+/g, '')
      .toLowerCase();

  const post =
    await fetchPostData(
      slug,
      currentProject
    );

  if (!post || !post.id) {
    return notFound();
  }

  const relatedResponse =
    await fetchPostList(
      4,
      0,
      currentProject
    );

  const relatedPosts =
    relatedResponse?.results
      ?.filter((p) => p.slug !== slug)
      .slice(0, 3) || [];

  const {
    title,
    image,
    content,
  } = post;

  return (
    <div className="min-h-screen bg-[#06080f] text-gray-300">

      <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">

        <header className="mb-24">

          <h1 className="text-5xl text-white mb-10">
            {title}
          </h1>

          {image && (
            <img
              src={image}
              alt={title}
            />
          )}

        </header>

        <main className="prose prose-invert max-w-none">

          <div
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />

        </main>

        {relatedPosts.length > 0 && (
          <section className="mt-20">

            <div className="grid md:grid-cols-3 gap-6">

              {relatedPosts.map((relPost) => (
                <UnifiedProductCard
                  key={relPost.id}
                  data={relPost}
                  siteConfig={siteData}
                />
              ))}

            </div>

          </section>
        )}

        <footer className="mt-20 text-center">

          <Link href="/post">
            戻る
          </Link>

        </footer>

      </article>

    </div>
  );
}