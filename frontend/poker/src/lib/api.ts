import type { EstimationScale, SessionResponse } from "../types";

// Hardcoded for Fly.io deployment
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://agile-planning-poker.fly.dev" : "http://localhost:5000");

export const api = {
  async createSession(scale: EstimationScale, hostName: string): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scale, hostName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create session");
    }

    return response.json();
  },

  async joinSession(code: string, name: string): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${code}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join session");
    }

    return response.json();
  },

  async vote(code: string, participantId: string, value: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${code}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participantId, value }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cast vote");
    }
  },

  async reveal(code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${code}/reveal`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reveal votes");
    }
  },

  async reset(code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${code}/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reset votes");
    }
  },

  async endSession(code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${code}/end`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to end session");
    }
  },
};

export const HUB_URL = `${API_BASE_URL}/hub/planning-poker`;
