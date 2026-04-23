import { generateArticle } from '@/lib/api/aiEngine';
import { validateArticle } from '@/lib/autopilot/validation';
import { saveEpisode } from '@/lib/firestore/episodes';

type Params = {
  db: any;
  appId: string;
  episodes: any[];
  getPrompt: (ep: any) => string;
};

export async function runAutoPilot({
  db,
  appId,
  episodes,
  getPrompt,
}: Params) {
  const targets = episodes.filter(ep => !ep.content);

  for (const ep of targets) {
    try {
      let article = await generateArticle(getPrompt(ep));

      let check = validateArticle(article);
      let retry = 0;

      while (!check.ok && retry < 2) {
        article = await generateArticle(
          `修正してください: ${check.reason}\n\n${article}`
        );
        check = validateArticle(article);
        retry++;
      }

      if (!check.ok) {
        console.warn(`SKIP: ${ep.title}`);
        continue;
      }

      await saveEpisode(db, appId, ep.id, {
        content: article,
        status: 'published',
      });

    } catch (err) {
      console.error(`ERROR: ${ep.title}`, err);
      continue;
    }
  }
}