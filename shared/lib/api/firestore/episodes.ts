import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function saveEpisode(
  db: any,
  appId: string,
  id: string,
  data: any
) {
  const ref = doc(db, 'artifacts', appId, 'public', 'data', 'episodes', id);

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}