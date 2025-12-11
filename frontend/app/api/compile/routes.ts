import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Language IDs for Judge0 CE
    const languageMap: any = {
      python: 71,
      javascript: 63,
      java: 62,
      c: 50,
      sql: 82,
    };

    const langId = languageMap[language];
    if (!langId) {
      return NextResponse.json({ message: "Invalid language" }, { status: 400 });
    }

    const subRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": process.env.RAPID_API_KEY!,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: code,
        stdin: "",
      })
    });

    const data = await subRes.json();
    return NextResponse.json({ output: data.stdout || data.stderr || data.compile_output || "No output" });

  } catch (error) {
    return NextResponse.json(
      { message: "Compilation failed", error },
      { status: 500 }
    );
  }
}
