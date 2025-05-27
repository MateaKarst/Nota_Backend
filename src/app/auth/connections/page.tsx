"use client";

import { useState } from "react";

export default function TestConnectionPage() {
    const [userId, setUserId] = useState("");
    const [connectionId, setConnectionId] = useState("");
    const [response, setResponse] = useState<any>(null);

    const handleSubmit = async () => {
        setResponse(null);

        const res = await fetch(`/api/connections/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                connection_id: connectionId
            })
        });

        const data = await res.json();
        setResponse(data);
    };

    return (
        <div className="p-6 max-w-md mx-auto space-y-4">
            <h1 className="text-xl font-semibold">Test Connection API</h1>
            <input
                type="text"
                className="border p-2 w-full"
                placeholder="Your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="text"
                className="border p-2 w-full"
                placeholder="Connection User ID"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Connect
            </button>
            {response && (
                <pre className="bg-gray-100 p-4 mt-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    );
}
