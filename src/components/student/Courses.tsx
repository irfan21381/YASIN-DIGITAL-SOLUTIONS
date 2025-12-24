import React, { useEffect, useState } from 'react';
import { api as API } from "@/lib/api";


export default function Courses() {
const [courses, setCourses] = useState<any[]>([]);
const [loading, setLoading] = useState(true);


useEffect(() => {
(async () => {
try {
const res = await API.get('/student/courses');
setCourses(res.data || []);
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
})();
}, []);


return (
<div className="p-6 max-w-6xl mx-auto">
<h2 className="text-2xl font-bold mb-4">My Courses</h2>
{loading ? (
<div>Loading...</div>
) : (
<div className="grid md:grid-cols-3 gap-4">
{courses.map((c) => (
<div key={c._id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
<h3 className="font-semibold">{c.title}</h3>
<p className="text-sm text-gray-500">{c.description}</p>
</div>
))}
</div>
)}
</div>
);
}