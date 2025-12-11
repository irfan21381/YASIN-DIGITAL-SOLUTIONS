// src/services/public.service.js

const { chatCompletion } = require("../config/ai");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/* ================================================================
   1️⃣ PUBLIC DOUBT SOLVER (Works with Groq/OpenAI)
================================================================ */
const publicDoubtSolver = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const messages = [
      {
        role: "system",
        content: "You are a helpful AI teaching assistant. Answer clearly.",
      },
      { role: "user", content: question },
    ];

    const answer = await chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    res.json({
      success: true,
      data: { question, answer },
    });
  } catch (error) {
    console.error("Public doubt solver error:", error);
    res.status(500).json({
      success: false,
      message: "AI service failed. Check API key",
    });
  }
};

/* ================================================================
   2️⃣ PUBLIC CODING LAB  (Python / JS / C / C++ / Java / jQuery / HTML)
================================================================ */
const publicCodingLab = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        stderr: "Code is required",
      });
    }

    // Create temp folder if missing
    const tmpDir = path.join(__dirname, "..", "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    let filePath = "";
    let command = "";
    const timestamp = Date.now();

    /* ==================================================================
       LANGUAGE EXECUTION HANDLERS
    ================================================================== */

    // ---------------- PYTHON ----------------
    if (language === "python") {
      filePath = path.join(tmpDir, `temp_${timestamp}.py`);
      fs.writeFileSync(filePath, code);

      command =
        process.platform === "win32"
          ? `python "${filePath}"`
          : `python3 "${filePath}"`;
    }

    // ---------------- JAVASCRIPT ----------------
    else if (["javascript", "js", "node", "nodejs"].includes(language)) {
      filePath = path.join(tmpDir, `temp_${timestamp}.js`);
      fs.writeFileSync(filePath, code);
      command = `node "${filePath}"`;
    }

    // ---------------- C ----------------
    else if (language === "c") {
      filePath = path.join(tmpDir, `temp_${timestamp}.c`);
      const exe = path.join(
        tmpDir,
        `a_${timestamp}${process.platform === "win32" ? ".exe" : ""}`
      );

      fs.writeFileSync(filePath, code);
      command = `gcc "${filePath}" -o "${exe}" && "${exe}"`;
    }

    // ---------------- C++ ----------------
    else if (["cpp", "c++"].includes(language)) {
      filePath = path.join(tmpDir, `temp_${timestamp}.cpp`);
      const exe = path.join(
        tmpDir,
        `a_${timestamp}${process.platform === "win32" ? ".exe" : ""}`
      );

      fs.writeFileSync(filePath, code);
      command = `g++ "${filePath}" -o "${exe}" && "${exe}"`;
    }

    // ---------------- JAVA ----------------
    else if (language === "java") {
      const workDir = path.join(tmpDir, `java_${timestamp}`);
      fs.mkdirSync(workDir, { recursive: true });

      filePath = path.join(workDir, "Main.java");
      fs.writeFileSync(filePath, code);

      command = `cd "${workDir}" && javac Main.java && java Main`;
    }

    // ---------------- HTML ----------------
    else if (["html", "htmlcssjs"].includes(language)) {
      const wrappedHTML = code.includes("<html")
        ? code
        : `
            <!DOCTYPE html>
            <html>
            <head><title>Output</title></head>
            <body>${code}</body>
            </html>
          `;

      return res.json({
        success: true,
        html: true,
        stdout: wrappedHTML,
      });
    }

    // ---------------- SQL → Simulated ----------------
    else if (language === "sql") {
      return res.json({
        success: true,
        stdout:
          "SQL execution requires database connection. Add SQL sandbox config.",
      });
    }

    // ---------------- jQuery (JS + jsdom) ----------------
    else if (language === "jquery") {
      const jqueryWrapper = `
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM('<html><body></body></html>');
        global.window = dom.window;
        global.document = dom.window.document;
        global.$ = require('jquery')(dom.window);
        ${code}
      `;

      filePath = path.join(tmpDir, `temp_${timestamp}.js`);
      fs.writeFileSync(filePath, jqueryWrapper);
      command = `node "${filePath}"`;
    }

    // ---------------- UNSUPPORTED ----------------
    else {
      return res.status(400).json({
        success: false,
        stderr: `Unsupported language: ${language}`,
      });
    }

    /* ==================================================================
       EXECUTE CODE SAFELY
    ================================================================== */

    exec(
      command,
      { timeout: 10000, maxBuffer: 1024 * 500 },
      (err, stdout, stderr) => {
        try {
          if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch {}

        return res.json({
          success: true,
          stdout: stdout || "",
          stderr: stderr || (err ? err.message : ""),
        });
      }
    );
  } catch (error) {
    console.error("Public coding lab error:", error);
    res.status(500).json({
      success: false,
      stderr: "Execution failed",
    });
  }
};

/* ================================================================
   3️⃣ CAREER GUIDANCE (AI)
================================================================ */
const careerGuidance = async (req, res) => {
  try {
    const { interests, skills, education } = req.body;

    const prompt = `
Give career guidance:

Interests: ${interests}
Skills: ${skills}
Education: ${education}

Include:
- Best career paths
- Required skills
- Real resources
- Roadmap
`;

    const guidance = await chatCompletion(
      [
        { role: "system", content: "You are a career counselor." },
        { role: "user", content: prompt },
      ],
      { temperature: 0.8, maxTokens: 1000 }
    );

    res.json({ success: true, data: { guidance } });
  } catch (err) {
    console.error("Career guidance error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate career guidance",
    });
  }
};

/* ================================================================
   4️⃣ SAMPLE PUBLIC QUIZZES
================================================================ */
const getPublicQuizzes = async (req, res) => {
  try {
    const quizzes = [
      {
        id: 1,
        title: "General Knowledge Quiz",
        questions: [
          {
            q: "Capital of India?",
            options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
            correct: 1,
          },
        ],
      },
    ];

    res.json({ success: true, data: quizzes });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get quizzes",
    });
  }
};

module.exports = {
  publicDoubtSolver,
  publicCodingLab,
  careerGuidance,
  getPublicQuizzes,
};
