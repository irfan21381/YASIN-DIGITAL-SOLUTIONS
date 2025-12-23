// Test API endpoints
const axios = require("axios");

const BASE = "http://localhost:5000";
const API = BASE + "/api";

const testEndpoints = async () => {
  console.log("🧪 Testing API Endpoints...\n");

  const tests = [
    {
      name: "Health Check",
      method: "GET",
      url: `${BASE}/health-check`,
      auth: false,
    },
    {
      name: "Send OTP",
      method: "POST",
      url: `${API}//api/auth/send-otp`,
      data: { email: "test@example.com" },
      auth: false,
    },
    {
      name: "Public Doubt Solver",
      method: "POST",
      url: `${API}/public/doubt-solver`,
      data: { question: "What is AI?" },
      auth: false,
    },
    {
      name: "Public Coding Lab",
      method: "POST",
      url: `${API}/public/coding-lab`,
      data: {
        code: "print('Hello world')",
        language: "python",
      },
      auth: false,
    },
    {
      name: "Public Quizzes",
      method: "GET",
      url: `${API}/public/quizzes`,
      auth: false,
    },
  ];

  for (const test of tests) {
    console.log(`🔹 Running: ${test.name}`);
    try {
      const config = {
        method: test.method,
        url: test.url,
        headers: { "Content-Type": "application/json" },
      };

      if (test.data) config.data = test.data;

      const response = await axios(config);

      console.log(`   ✅ Success: ${response.status} ${response.statusText}`);
      console.log(
        `   📌 Response: ${JSON.stringify(response.data).substring(0, 150)}...\n`
      );
    } catch (error) {
      if (error.response) {
        console.log(
          `   ⚠️ Failed: ${error.response.status} - ${error.response.statusText}`
        );
        console.log(`   Message: ${error.response.data?.message}\n`);
      } else {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  }

  console.log("🎉 API testing completed!\n");
};

testEndpoints().catch(console.error);
