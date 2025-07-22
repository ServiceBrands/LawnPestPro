async function handler({
  name,
  base_price,
  per_1000_sqft_price,
  description,
  is_active,
}) {
  try {
    if (!name || !name.trim()) {
      return { error: "Service name is required" };
    }

    if (base_price === undefined || base_price === null || base_price < 0) {
      return { error: "Base price is required and must be non-negative" };
    }

    if (
      per_1000_sqft_price === undefined ||
      per_1000_sqft_price === null ||
      per_1000_sqft_price < 0
    ) {
      return {
        error: "Per 1000 sq ft price is required and must be non-negative",
      };
    }

    const result = await sql`
      INSERT INTO services (name, base_price, per_1000_sqft_price, description, is_active)
      VALUES (${name.trim()}, ${base_price}, ${per_1000_sqft_price}, ${
      description || null
    }, ${is_active !== false})
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: "Failed to create service" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}