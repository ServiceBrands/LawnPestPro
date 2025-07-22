async function handler() {
  try {
    const estimates = await sql`
      SELECT 
        e.id,
        e.client_id,
        e.total_amount,
        e.property_size,
        e.status,
        e.notes,
        e.created_at,
        e.updated_at,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address
      FROM estimates e
      LEFT JOIN clients c ON e.client_id = c.id
      ORDER BY e.created_at DESC
    `;

    const estimateServices = await sql`
      SELECT 
        es.estimate_id,
        es.service_id,
        es.quantity,
        es.unit_price,
        es.total_price,
        s.name as service_name,
        s.description as service_description
      FROM estimate_services es
      LEFT JOIN services s ON es.service_id = s.id
      ORDER BY es.estimate_id, s.name
    `;

    const estimatesWithServices = estimates.map((estimate) => ({
      ...estimate,
      services: estimateServices.filter(
        (service) => service.estimate_id === estimate.id
      ),
    }));

    return estimatesWithServices;
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return [];
  }
}
export async function POST(request) {
  return handler(await request.json());
}