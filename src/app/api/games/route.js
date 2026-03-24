import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const games = await sql`
      SELECT * FROM games ORDER BY played_at DESC LIMIT 100
    `;
    return Response.json(games);
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, players, scores } = await req.json();

    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    const playerData = sorted.map(p => ({
      name: p.name,
      animal_id: p.animal?.id || p.animal_id,
      score: scores[p.id] || 0,
    }));

    const [game] = await sql`
      INSERT INTO games (title, players, scores)
      VALUES (${title}, ${JSON.stringify(playerData)}, ${JSON.stringify(scores)})
      RETURNING *
    `;

    return Response.json(game);
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to save game' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    await sql`DELETE FROM games WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
