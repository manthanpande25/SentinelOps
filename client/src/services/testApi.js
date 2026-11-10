import api from "./api";

export const testBackend = async () => {
  try {
    const response = await api.get("/health");
    console.log("Backend connected:", response.data);
  } catch (error) {
    console.error("Backend connection failed:", error.message);
  }
};