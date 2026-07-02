import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data_db.json");

// Parse JSON request bodies
app.use(express.json());

// Lazy database initializer
function getDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { articles: [], schedules: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading database file, resetting:", error);
    const initialData = { articles: [], schedules: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function saveDatabase(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Lazy Gemini API Client initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes: Status / Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API Routes: Fetch Articles
app.get("/api/articles", (req, res) => {
  const db = getDatabase();
  res.json(db.articles || []);
});

// API Routes: Create / Save Article
app.post("/api/articles", (req, res) => {
  const db = getDatabase();
  const newArticle = {
    id: "art_" + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.articles = [newArticle, ...(db.articles || [])];
  saveDatabase(db);
  res.status(201).json(newArticle);
});

// API Routes: Delete Article
app.delete("/api/articles/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialLength = db.articles?.length || 0;
  db.articles = (db.articles || []).filter((art: any) => art.id !== id);
  // Also filter/cancel scheduled posts associated with this article
  db.schedules = (db.schedules || []).map((sch: any) => {
    if (sch.articleId === id) {
      return { ...sch, status: "cancelled" };
    }
    return sch;
  });
  saveDatabase(db);
  res.json({ success: true, deleted: (initialLength - db.articles.length) > 0 });
});

// API Routes: Fetch Schedules
app.get("/api/schedules", (req, res) => {
  const db = getDatabase();
  res.json(db.schedules || []);
});

// API Routes: Create Schedule
app.post("/api/schedules", (req, res) => {
  const db = getDatabase();
  const newSchedule = {
    id: "sch_" + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    status: "scheduled",
    ...req.body,
  };
  db.schedules = [newSchedule, ...(db.schedules || [])];
  saveDatabase(db);
  res.status(201).json(newSchedule);
});

// API Routes: Update Schedule Status
app.post("/api/schedules/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = getDatabase();
  let updated = false;
  db.schedules = (db.schedules || []).map((sch: any) => {
    if (sch.id === id) {
      updated = true;
      return { ...sch, status };
    }
    return sch;
  });
  if (updated) {
    saveDatabase(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Schedule not found" });
  }
});

// API Routes: Delete/Cancel Schedule
app.delete("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialLength = db.schedules?.length || 0;
  db.schedules = (db.schedules || []).filter((sch: any) => sch.id !== id);
  saveDatabase(db);
  res.json({ success: true, deleted: (initialLength - db.schedules.length) > 0 });
});

// Helper function to retry generation with multiple model fallbacks and progressive backoff
async function generateContentWithRetry(ai: GoogleGenAI, contents: string, config: any) {
  // Use gemini-2.5-flash as the primary, fallback to gemini-1.5-flash, gemini-2.5-pro, and gemini-1.5-pro
  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Attempting model ${model} (Attempt ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: config,
        });

        if (response && response.text) {
          console.log(`[Gemini] Successfully generated content using model: ${model}`);
          return response;
        }
      } catch (err: any) {
        console.warn(`[Gemini] Error on model ${model} (Attempt ${attempt}/2):`, err.message || err);
        lastError = err;
        
        if (attempt < 2) {
          const waitTime = attempt * 1000;
          console.log(`[Gemini] Retrying in ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }

  throw lastError || new Error("All fallback models failed.");
}

// API Routes: Generate HR Article via Gemini
app.post("/api/generate", async (req, res) => {
  const { topic, tone, length, audience, keywords, customTopic } = req.body;

  if (!topic && !customTopic) {
    return res.status(400).json({ error: "Topic or Custom Topic is required." });
  }

  try {
    const ai = getGeminiClient();

    const selectedTopic = customTopic || topic;
    const wordCountRange = 
      length === "short" ? "300 to 500 words" :
      length === "medium" ? "600 to 900 words" :
      "1000 to 1500 words";

    const prompt = `Write a high-quality blog post about Human Resources.
Topic: "${selectedTopic}"
Desired Tone: "${tone || 'professional'}"
Target Length: ${wordCountRange} (${length || 'medium'} format)
Target Audience: "${audience || 'HR Professionals, Managers, and Business Leaders'}"
Key Keywords to seamlessly integrate: ${keywords && keywords.length > 0 ? keywords.join(", ") : "none specified"}

Instructions for structure:
1. Provide a highly engaging, professional SEO title.
2. Structure the blog post with rich, beautiful Markdown (use H2, H3 headers, bullet points, blockquotes, and bold text for visual reading rhythm).
3. The post must address the chosen HR topic with deep strategic insight, practical action steps, and high empathy for both employees and management.
4. Conclude with an inspiring summary and a professional call-to-action (CTA).
5. Generate highly tailored social media promotion posts (blurby summaries) with specific hashtags and emojis for each of these channels:
   - LinkedIn (professional, inspiring, networking-focused)
   - Twitter/X (catchy, concise, high-impact)
   - Facebook (friendly, conversational, community-building)
   - Slack (informative, actionable, team-focused)`;

    console.log("Generating HR blog post with prompt:", prompt);

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: "You are an elite Human Resources leader, chief people officer, and a gifted HR publisher. You excel at translating complex organizational challenges into engaging, clear, compassionate, and highly actionable business literature.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A highly compelling and click-worthy SEO title or headline."
          },
          content: {
            type: Type.STRING,
            description: "The complete body text of the blog post, structured beautifully with markdown. Must include clear headings, bullet points, and actionable take-aways."
          },
          suggestedBlurbs: {
            type: Type.ARRAY,
            description: "Four highly tailored social promotion posts promoting this specific article.",
            items: {
              type: Type.OBJECT,
              properties: {
                platform: {
                  type: Type.STRING,
                  description: "Must be exactly 'LinkedIn', 'Twitter/X', 'Facebook', or 'Slack'."
                },
                text: {
                  type: Type.STRING,
                  description: "Tailored caption text for social sharing, with emojis and popular HR hashtags."
                }
              },
              required: ["platform", "text"]
            }
          }
        },
        required: ["title", "content", "suggestedBlurbs"]
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text returned from the Gemini API.");
    }

    const result = JSON.parse(responseText);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate article with Gemini API.",
      details: error.stack 
    });
  }
});

// Vite Middleware & Production Routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
