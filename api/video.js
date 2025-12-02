// pages/api/video.js
// ŞİMDİLİK DEMO MODU:
// Gerçek bir video AI servisine bağlanmıyor.
// Sadece sabit bir test videosu URL'si döndürüyor.

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res
      .status(405)
      .json({ message: 'Sadece POST istekleri destekleniyor.' });
  }

  // Burada prompt/lang vs. kullanmıyoruz, sadece test için sabit video dönüyoruz.
  const videoUrl =
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';

  return res.status(200).json({
    message: 'Test videosu hazır (demo).',
    url: videoUrl,
    filename: 'inspireapp-demo-video.mp4',
  });
}
