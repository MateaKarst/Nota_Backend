"use client";

import React, { useState } from "react";

interface SongResponse {
    message: string;
    song?: {
        id: string;
        title: string;
        user_id: string;
        description?: string;
        cover_image?: string;
        compiled_path?: string;
    };
    error?: string;
}

interface TrackResponse {
    message: string;
    track?: {
        id: string;
        song_id: string;
        url: string;
        storage_path: string;
    };
    error?: string;
}

const Tester = () => {
    // Song state
    const [title, setTitle] = useState("");
    const [userId, setUserId] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");

    // Track state
    const [songId, setSongId] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // Responses
    const [songResponse, setSongResponse] = useState<SongResponse | null>(null);
    const [trackResponse, setTrackResponse] = useState<TrackResponse | null>(null);

    const createSong = async () => {
        if (!title || !userId) {
            alert("Title and User ID are required.");
            return;
        }

        const res = await fetch("/api/songs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, user_id: userId, description, cover_image: coverImage }),
        });

        const data = await res.json();
        setSongResponse(data);

        if (data.song?.id) {
            setSongId(data.song.id);
        }
    };

    const uploadTrack = async () => {
        if (!songId || !file) {
            alert("Missing song ID or file.");
            return;
        }

        if (!file.type.includes("audio")) {
            alert("Please upload an audio file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("song_id", songId);
        formData.append("start_position", "0"); // or customize as needed

        const res = await fetch("/api/tracks", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setTrackResponse(data);
    };

    return (
        <div style={{ padding: 20, maxWidth: 600 }}>
            <h2>Create a Song</h2>
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <br />
            <input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
            <br />
            <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <br />
            <input placeholder="Cover Image URL" value={coverImage} onChange={e => setCoverImage(e.target.value)} />
            <br />
            <button onClick={createSong} style={{ marginTop: 10 }}>Create Song</button>

            {songResponse && (
                <pre style={{ background: "#f3f3f3", padding: 10, marginTop: 10 }}>
                    {JSON.stringify(songResponse, null, 2)}
                </pre>
            )}

            <hr style={{ margin: "30px 0" }} />

            <h2>Upload a Track</h2>
            <input
                placeholder="Song ID"
                value={songId}
                onChange={e => setSongId(e.target.value)}
            />
            <br />
            <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            <br />
            <button onClick={uploadTrack} style={{ marginTop: 10 }}>Upload Track</button>

            {trackResponse && (
                <pre style={{ background: "#f3f3f3", padding: 10, marginTop: 10 }}>
                    {JSON.stringify(trackResponse, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default Tester;
