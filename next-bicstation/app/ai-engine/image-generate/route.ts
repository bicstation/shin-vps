const handleGenerateVisual = async () => {
  if (!selectedEp) return;
  setIsImageGenerating(true); // ローディング状態開始
  
  try {
    // ポート番号 :8083 は外し、Next.jsの相対パスに変更します
    const response = await fetch('/api/ai/image-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: `Hyper-realistic system architecture, ${selectedEp.title}, cinematic lighting, 8k resolution`,
        episodeId: selectedEp.id 
      }),
    });

    if (!response.ok) throw new Error('API Response Error');

    const data = await response.json();
    if (data.url) {
      setImagePath(data.url); // 生成された画像のURLをセット
    }
  } catch (err) {
    console.error("Visual Generation Error:", err);
    alert("画像生成APIに接続できません。/api/ai/image-generate が存在するか確認してください。");
  } finally {
    setIsImageGenerating(false);
  }
};