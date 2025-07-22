async function handler({ name, email, phone, address, property_size, notes }) {
  try {
    if (!name) {
      return { error: "Name is required" };
    }

    const result = await sql`
      INSERT INTO clients (name, email, phone, address, property_size, notes)
      VALUES (${name}, ${email || null}, ${phone || null}, ${
      address || null
    }, ${property_size || null}, ${notes || null})
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}