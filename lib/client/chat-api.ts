"use client";
// api inetefeace
export async function sendChatMessage(message: string, Modename: string) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, Modename }),
    });

    if (response.ok!) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }

}