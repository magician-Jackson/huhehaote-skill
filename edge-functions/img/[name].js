const IMAGE_SOURCES = {
  'hero-dazhao': 'https://commons.wikimedia.org/wiki/Special:FilePath/Hohhot%20Dazhao%20temple.mur.jpg?width=1800',
  'airport-metro': 'https://commons.wikimedia.org/wiki/Special:FilePath/Exterior%20of%20Bayan%20%28Airport%29%20Station%2C%20Hohhot%20Metro.jpg?width=1600',
  'inner-mongolia-museum': 'https://commons.wikimedia.org/wiki/Special:FilePath/Inner%20Mongolia%20Museum%202017%20A.jpg?width=1600',
  'huitengxile': 'https://commons.wikimedia.org/wiki/Special:FilePath/Huitengxile%20wind%20farm%20873472543.jpg?width=1600',
  'xilitu-zhao': 'https://commons.wikimedia.org/wiki/Special:FilePath/Xilitu%20Zhao%20%2853724498277%29.jpg?width=1600',
  'huanghuagou': 'https://commons.wikimedia.org/wiki/Special:FilePath/Huanghuogou.jpg?width=1600',
  'ulanhada-volcano': 'https://commons.wikimedia.org/wiki/Special:FilePath/Wulanhadavolcaniccluster2019.jpg?width=1600',
  'xiangshawan-vehicle': 'https://commons.wikimedia.org/wiki/Special:FilePath/Desert%20vehicle%20Xiangshawan.jpg?width=1600',
  'inner-mongolia-desert': 'https://commons.wikimedia.org/wiki/Special:FilePath/Desert%20-%20Inner%20Mongolia%20edit.jpg?width=1600',
  'dazhao-bell-tower': 'https://commons.wikimedia.org/wiki/Special:FilePath/Hohhot%20Dazhao%20temple.bell%20tower.jpg?width=1600',
  'zhaojun-museum': 'https://commons.wikimedia.org/wiki/Special:FilePath/Zhaojun%20Bowuyuan.jpg?width=1600',
  'five-pagoda-temple': 'https://commons.wikimedia.org/wiki/Special:FilePath/Five%20Pagoda%20Temple%2C%20Huhhot%2C%20Inner%20Mongolia.JPG?width=1600',
  'great-mosque': 'https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Mosque%20of%20Hohhot%20front%20view%20202509.jpg?width=1600',
};

export async function onRequestGet(context) {
  const imageName = context.params.name;
  const sourceUrl = IMAGE_SOURCES[imageName];

  if (!sourceUrl) {
    return new Response('Image not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const cache = await caches.open('huhehaote-images-v1');
  const cacheKey = new Request(context.request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const upstream = await fetch(sourceUrl, {
    headers: {
      'Accept': 'image/avif,image/webp,image/jpeg,image/*',
      'User-Agent': 'HuhehaoteTravelGuide/1.0',
    },
    redirect: 'follow',
  });

  if (!upstream.ok) {
    return new Response('Image source unavailable', {
      status: 502,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.delete('Set-Cookie');

  const response = new Response(upstream.body, {
    status: 200,
    headers,
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
