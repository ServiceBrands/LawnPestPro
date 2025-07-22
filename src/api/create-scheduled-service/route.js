async function handler({
  client_id,
  service_id,
  scheduled_date,
  notes,
  assigned_tech_id,
}) {
  try {
    if (!client_id || !service_id || !scheduled_date) {
      return {
        error: "Client ID, service ID, and scheduled date are required",
      };
    }

    const result = await sql`
      INSERT INTO scheduled_services (client_id, service_id, scheduled_date, notes, assigned_tech_id, status)
      VALUES (${client_id}, ${service_id}, ${scheduled_date}, ${
      notes || null
    }, ${assigned_tech_id || null}, 'scheduled')
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error("Error creating scheduled service:", error);
    return { error: "Failed to create scheduled service" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}