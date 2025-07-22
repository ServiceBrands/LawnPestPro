async function handler() {
  try {
    const scheduledServices = await sql`
      SELECT 
        ss.id,
        ss.client_id,
        ss.service_id,
        ss.scheduled_date,
        ss.status,
        ss.assigned_tech_id,
        ss.notes,
        ss.created_at,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address,
        c.property_size as client_property_size,
        s.name as service_name,
        s.description as service_description,
        s.base_price as service_base_price,
        s.per_1000_sqft_price as service_per_1000_sqft_price,
        u.name as tech_name,
        u.email as tech_email
      FROM scheduled_services ss
      LEFT JOIN clients c ON ss.client_id = c.id
      LEFT JOIN services s ON ss.service_id = s.id
      LEFT JOIN users u ON ss.assigned_tech_id = u.id
      ORDER BY ss.scheduled_date ASC, ss.created_at DESC
    `;

    return scheduledServices;
  } catch (error) {
    console.error("Error fetching scheduled services:", error);
    return [];
  }
}
export async function POST(request) {
  return handler(await request.json());
}