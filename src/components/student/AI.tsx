import React, { useState } from 'react';
import { api as API } from "@/lib/api";


export default function AI() {
const [q, setQ] = useState('');
const [resp, setResp] = useState('');
const [loading, setLoading] = useState(false);


async function ask() {
setLoading(true);
try {
const r = await API.post('/ai/question', { question: q });
setResp(r.data.answer || 'No answer');
} catch (err) {
console.error(err);
setResp('Error');
} finally {
setLoading(false);
}
}


return (
<div className="p-6 max-w-3xl mx-auto">
<h2 className="text-2xl font-bold mb-4">AI Tutor</h2>
<textarea className="w-full p-3 rounded border" rows={4} value={q} onChange={(e) => setQ(e.target.value)} />
<div className="mt-3 flex gap-3">
<button onClick={ask} className="px-4 py-2 bg-blue-600 text-white rounded">Ask</button>
<div className="p-3 bg-white dark:bg-gray-800 rounded flex-1">{loading ? 'Thinking...' : resp}</div>
</div>
</div>
);
}