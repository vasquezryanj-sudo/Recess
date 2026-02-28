export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(q)}&type=boardgame&exact=0`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Recess App/1.0' } });
    if (!res.ok) throw new Error('BGG fetch failed');
    const text = await res.text();
    const items = [...text.matchAll(/<item type="boardgame" id="(\d+)"[\s\S]*?<name type="primary" sortindex="\d+" value="([^"]+)"[\s\S]*?(?:<yearpublished value="(\d+)")?/g)];
    const results = items.slice(0, 12).map(m => ({ id: m[1], name: m[2], year: m[3] || null }));
    return Response.json({ results });
  } catch (e) {
    return Response.json({ results: [], error: e.message });
  }
}
