import AdultProductGallery
  from '@shared/components/organisms/cards/AdultProductGallery';

import styles from '../page.module.css';

type SampleMovieData = {
  url: string;
  preview_image?: string;
};

type Props = {
  images: string[];
  title: string;
  apiSource?: string;
  sampleMovieData?: SampleMovieData | null;
};

export function ProductGallery({
  images,
  title,
  apiSource,
  sampleMovieData,
}: Props) {
  return (
    <section className={styles.gallerySection}>

      <AdultProductGallery
        images={images}
        title={title}
        apiSource={apiSource}
        // sampleMovieData={sampleMovieData}
      />

    </section>
  );
}