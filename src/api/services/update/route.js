async function handler({
  id,
  name,
  base_price,
  per_1000_sqft_price,
  description,
  is_active,
}) {
  try {
    if (!id) {
      return { error: "Service ID is required" };
    }

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
      UPDATE services 
      SET 
        name = ${name.trim()},
        base_price = ${base_price},
        per_1000_sqft_price = ${per_1000_sqft_price},
        description = ${description || null},
        is_active = ${is_active !== false}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return { error: "Service not found" };
    }

    return result[0];
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}