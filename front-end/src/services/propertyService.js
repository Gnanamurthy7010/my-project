import API_BASE_URL from "../config/api"; // e.g., http://localhost:5000/api

// ------------------- ADD PROPERTY -------------------
export const addProperty = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/properties/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to add property");
    }

    return await res.json();
  } catch (err) {
    console.error("addProperty error:", err);
    return null; // prevent white screen
  }
};

// ------------------- FETCH ALL PROPERTIES -------------------
export const fetchProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.type && filters.type !== "all") params.append("type", filters.type);

    const res = await fetch(`${API_BASE_URL}/properties?${params.toString()}`);

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to fetch properties");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : []; // fallback if data is invalid
  } catch (err) {
    console.error("fetchProperties error:", err);
    return []; // prevent white screen
  }
};

// Alias for backward compatibility
export const getProperties = fetchProperties;

// ------------------- FETCH PROPERTY BY ID -------------------
export const fetchPropertyById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to fetch property");
    }
    return await res.json();
  } catch (err) {
    console.error("fetchPropertyById error:", err);
    return null; // prevent white screen
  }
};

// ------------------- DELETE PROPERTY -------------------
// ------------------- DELETE PROPERTY -------------------
export const deleteProperty = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Log details to debug
    const responseText = await res.text();
    console.log("DELETE status:", res.status);
    console.log("DELETE response:", responseText);

    if (!res.ok) {
      let errorMessage;
      try {
        const parsed = JSON.parse(responseText);
        errorMessage = parsed.message || parsed;
      } catch {
        errorMessage = responseText;
      }
      throw new Error(errorMessage || "Failed to delete property");
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (err) {
    console.error("deleteProperty error:", err.message);
    alert(`Delete failed: ${err.message}`); // show actual reason to user
    return null;
  }
};

// ------------------- UPDATE PROPERTY -------------------
export const updateProperty = async (id, formData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // DO NOT set Content-Type manually for FormData
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to update property");
    }

    return await res.json();
  } catch (err) {
    console.error("updateProperty error:", err);
    return null;
  }
};
