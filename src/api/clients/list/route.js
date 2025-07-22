async function handler() {
  try {
    const clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}
export async function POST(request) {
  return handler(await request.json());
}