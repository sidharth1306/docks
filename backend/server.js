const express = require("express");
const cors = require("cors");
const { runCode } = require("./runner");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Docks API is running" });
});

/**
 * POST /execute
 * Body: { language: "python" | "cpp", code: "..." }
 * Response: { stdout, stderr, exitCode }
 */
app.post("/execute", async (req, res) => {
  const { language, code } = req.body;

  // Basic validation
  if (!language || !code) {
    return res.status(400).json({ error: "Missing 'language' or 'code' in request body." });
  }

  if (!["python", "cpp"].includes(language)) {
    return res.status(400).json({ error: "Unsupported language. Use 'python' or 'cpp'." });
  }

  if (code.length > 10000) {
    return res.status(400).json({ error: "Code too long (max 10,000 characters)." });
  }

  try {
    console.log(`[${new Date().toISOString()}] Executing ${language} code...`);
    const result = await runCode(language, code);
    console.log(`[${new Date().toISOString()}] Done. Exit code: ${result.exitCode}`);
    res.json(result);
  } catch (err) {
    console.error("Execution error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Docks backend running on http://localhost:${PORT}`);
});
