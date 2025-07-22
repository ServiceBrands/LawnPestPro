async function handler({
  client_id,
  image_url,
  identification_result,
  confidence_score,
}) {
  try {
    if (!image_url || !identification_result) {
      return { error: "Image URL and identification result are required" };
    }

    const result = await sql`
      INSERT INTO pest_identifications (client_id, image_url, identification_result, confidence_score)
      VALUES (${client_id || null}, ${image_url}, ${identification_result}, ${
      confidence_score || null
    })
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error("Error creating pest identification:", error);
    return { error: "Failed to create pest identification" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}