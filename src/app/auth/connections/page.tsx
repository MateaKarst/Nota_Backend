"use client";

import { useState } from "react";

export default function TestConnectionPage() {
    const [userId, setUserId] = useState("");
    const [connectionUserId, setConnectionUserId] = useState(""); // for creating connection
    const [connectionRecordId, setConnectionRecordId] = useState(""); // for deleting connection
    const [response, setResponse] = useState<any>(null);

    const handleSubmit = async () => {
        setResponse(null);

        if (!userId || !connectionUserId) {
            setResponse({ message: "Please provide both User ID and Connection User ID" });
            return;
        }

        const res = await fetch(`/api/connections/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                connection_id: connectionUserId,
            }),
        });

        const data = await res.json();
        setResponse(data);
    };

    const handleDelete = async () => {
        if (!connectionRecordId) {
            setResponse({ message: "Please provide a connection record ID to delete." });
            return;
        }

        setResponse(null);

        const res = await fetch(`/api/connections/${connectionRecordId}`, {
            method: "DELETE",
        });

        const data = await res.json();
        setResponse(data);
    };

    return (
        <div className="p-6 max-w-md mx-auto space-y-8">

            {/* Create Connection Table */}
            <div className="border rounded p-4">
                <h2 className="text-lg font-semibold mb-4">Create Connection</h2>
                <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-3 py-1">User ID</th>
                            <th className="border border-gray-300 px-3 py-1">Connection User ID</th>
                            <th className="border border-gray-300 px-3 py-1">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-3 py-1">
                                <input
                                    type="text"
                                    className="border p-1 w-full"
                                    placeholder="Your User ID"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                />
                            </td>
                            <td className="border border-gray-300 px-3 py-1">
                                <input
                                    type="text"
                                    className="border p-1 w-full"
                                    placeholder="Connection User ID"
                                    value={connectionUserId}
                                    onChange={(e) => setConnectionUserId(e.target.value)}
                                />
                            </td>
                            <td className="border border-gray-300 px-3 py-1 text-center">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Connect (POST)
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Delete Connection Table */}
            <div className="border rounded p-4">
                <h2 className="text-lg font-semibold mb-4">Delete Connection</h2>
                <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-3 py-1">Connection Record ID</th>
                            <th className="border border-gray-300 px-3 py-1">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-3 py-1">
                                <input
                                    type="text"
                                    className="border p-1 w-full"
                                    placeholder="Connection Record ID"
                                    value={connectionRecordId}
                                    onChange={(e) => setConnectionRecordId(e.target.value)}
                                />
                            </td>
                            <td className="border border-gray-300 px-3 py-1 text-center">
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete (DELETE)
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {response && (
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    );
}
