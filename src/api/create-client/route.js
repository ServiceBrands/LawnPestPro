async function handler({
  name,
  email,
  phone,
  address,
  property_size,
  notes,
  lawn_type,
  irrigation_system,
  pet_friendly_required,
  current_pest_issues,
  preferred_treatment_schedule,
  soil_type,
  sun_exposure,
  special_instructions,
}) {
  try {
    if (!name || !name.trim()) {
      return { error: "Name is required" };
    }

    const result = await sql`
      INSERT INTO clients (
        name, 
        email, 
        phone, 
        address, 
        property_size, 
        notes,
        lawn_type,
        irrigation_system,
        pet_friendly_required,
        current_pest_issues,
        preferred_treatment_schedule,
        soil_type,
        sun_exposure,
        special_instructions
      )
      VALUES (
        ${name.trim()}, 
        ${email || null}, 
        ${phone || null}, 
        ${address || null}, 
        ${property_size || null}, 
        ${notes || null},
        ${lawn_type || null},
        ${irrigation_system || false},
        ${pet_friendly_required || false},
        ${current_pest_issues || null},
        ${preferred_treatment_schedule || null},
        ${soil_type || null},
        ${sun_exposure || null},
        ${special_instructions || null}
      )
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client: " + error.message };
  }
}
export async function POST(request) {
  return handler(await request.json());
}