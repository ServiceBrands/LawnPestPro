async function handler({
  client_id,
  property_size,
  total_amount,
  notes,
  services,
}) {
  try {
    if (
      !client_id ||
      !property_size ||
      !total_amount ||
      !services ||
      !Array.isArray(services)
    ) {
      return {
        error:
          "Missing required fields: client_id, property_size, total_amount, and services array",
      };
    }

    if (services.length === 0) {
      return { error: "At least one service must be selected" };
    }

    const estimateQuery = sql`
      INSERT INTO estimates (client_id, property_size, total_amount, notes, status)
      VALUES (${client_id}, ${property_size}, ${total_amount}, ${
      notes || null
    }, 'draft')
      RETURNING *
    `;

    const serviceQueries = services.map((service) => {
      if (!service.service_id || !service.unit_price || !service.total_price) {
        throw new Error(
          "Each service must have service_id, unit_price, and total_price"
        );
      }

      return sql`
        INSERT INTO estimate_services (estimate_id, service_id, quantity, unit_price, total_price)
        VALUES (${service.estimate_id}, ${service.service_id}, ${
        service.quantity || 1
      }, ${service.unit_price}, ${service.total_price})
        RETURNING *
      `;
    });

    const [estimateResult, ...serviceResults] = await sql.transaction([
      estimateQuery,
      ...serviceQueries,
    ]);

    const estimate = estimateResult[0];

    const updatedServiceQueries = services.map((service) => {
      return sql`
        INSERT INTO estimate_services (estimate_id, service_id, quantity, unit_price, total_price)
        VALUES (${estimate.id}, ${service.service_id}, ${
        service.quantity || 1
      }, ${service.unit_price}, ${service.total_price})
        RETURNING *
      `;
    });

    const finalServiceResults = await sql.transaction(updatedServiceQueries);

    return {
      estimate,
      services: finalServiceResults.flat(),
    };
  } catch (error) {
    console.error("Error creating estimate:", error);
    return { error: "Failed to create estimate" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}