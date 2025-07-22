async function handler() {
  try {
    const services = await sql`
      SELECT * FROM services 
      WHERE is_active = true 
      ORDER BY name ASC
    `;

    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}
export async function POST(request) {
  return handler(await request.json());
}