
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonthlyPlan = async (groupName: string, groupDescription: string): Promise<Partial<Task>[]> => {
  try {
    const response = await ai.models.generateContent({
      // Fixed: Using the recommended gemini-3-flash-preview for basic text tasks
      model: "gemini-3-flash-preview",
      contents: `Generate 5 key monthly tasks for a team group named "${groupName}". 
      Context: ${groupDescription}. 
      The tasks should be actionable, specific, and suitable for a professional environment.
      Set them as recurring monthly by default.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              isRecurring: { type: Type.BOOLEAN },
              recurringFrequency: { type: Type.STRING, enum: ["monthly"] },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"] }
            },
            required: ["title", "isRecurring", "priority"]
          }
        }
      }
    });

    const tasks = JSON.parse(response.text || "[]");
    return tasks;
  } catch (error) {
    console.error("Failed to generate tasks:", error);
    return [];
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      // Fixed: Using the recommended gemini-3-flash-preview for simple text tasks
      model: "gemini-3-flash-preview",
      contents: `Break down the task "${taskTitle}" into 3-5 smaller, actionable sub-steps. Return only the steps as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to generate subtasks:", error);
    return [];
  }
};
