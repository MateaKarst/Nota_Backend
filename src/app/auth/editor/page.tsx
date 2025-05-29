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

interface TrackEditResponse {
    message: string;
    track?: any;
    song?: any;
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
    const [editResponse, setEditResponse] = useState<any | null>(null);

    //Edit song
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCoverImage, setEditCoverImage] = useState("");

    // Track Edit states
    const [editTrackId, setEditTrackId] = useState("");
    const [editTrackData, setEditTrackData] = useState(`{
    "url": "https://example.com/new-audio.mp3",
    "volume": 0.8,
    "instruments": ["guitar", "bass"]
    }`);

    const [editTrackResponse, setEditTrackResponse] = useState<TrackEditResponse | null>(null);


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
            const newSongId = data.song.id;
            setSongId(newSongId);
        }

        await fetch(`/api/songs/${songId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "New Title",
                description: "Updated description",
                cover_image: "https://example.com/image.jpg"
            })
        });

    };

    const deleteSong = async () => {
        if (!songId) {
            alert("Please enter a Song ID to delete.");
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete song ID: ${songId}?`);
        if (!confirmed) return;

        const res = await fetch(`/api/songs/${songId}`, {
            method: "DELETE",
        });

        const data = await res.json();
        alert(data.message || "Delete request sent.");
        console.log("Delete response:", data);
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
        formData.append("start_position", "0");

        const res = await fetch("/api/tracks", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setTrackResponse(data);
    };

    const editSong = async () => {
        if (!songId) {
            alert("Missing song ID.");
            return;
        }

        const res = await fetch(`/api/songs/${songId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: editTitle,
                description: editDescription,
                cover_image: editCoverImage,
            }),
        });

        const data = await res.json();
        setEditResponse(data);
    };

    const editTrack = async () => {
        if (!editTrackId) {
            alert("Please enter the Track ID to edit.");
            return;
        }

        let parsedBody;
        try {
            parsedBody = JSON.parse(editTrackData);
        } catch (err) {
            alert("Invalid JSON data.");
            return;
        }

        const res = await fetch(`/api/tracks/${editTrackId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(parsedBody),
        });

        const data = await res.json();
        setEditTrackResponse(data);
    };



    return (
        <>

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

                <hr style={{ margin: "30px 0" }} />
                <h2>Edit Song</h2>
                <input
                    placeholder="New Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                />
                <br />
                <input
                    placeholder="Song ID"
                    value={songId}
                    onChange={e => setSongId(e.target.value)}
                />
                <br />
                <input
                    placeholder="New Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                />
                <br />
                <input
                    placeholder="New Cover Image URL"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                />
                <br />
                <button onClick={editSong} style={{ marginTop: 10 }}>Edit Song</button>

                {editResponse && (
                    <pre style={{ background: "#f3f3f3", padding: 10, marginTop: 10 }}>
                        {JSON.stringify(editResponse, null, 2)}
                    </pre>
                )}

                <hr style={{ margin: "30px 0" }} />
                <h2>Edit Track</h2>
                <input
                    placeholder="Track ID"
                    value={editTrackId}
                    onChange={(e) => setEditTrackId(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <textarea
                    value={editTrackData}
                    onChange={(e) => setEditTrackData(e.target.value)}
                    rows={10}
                    style={{ width: "100%", fontFamily: "monospace", marginBottom: 10 }}
                />
                <br />
                <button onClick={editTrack}>Edit Track</button>

                {editTrackResponse && (
                    <pre style={{ background: "#f3f3f3", padding: 10, marginTop: 10, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(editTrackResponse, null, 2)}
                    </pre>
                )}

                <hr style={{ margin: "30px 0" }} />
                <h2>Delete Song</h2>
                <input
                    placeholder="Song ID"
                    value={songId}
                    onChange={e => setSongId(e.target.value)}
                />
                <br />
                <button onClick={deleteSong} style={{ marginTop: 10, backgroundColor: "#e74c3c", color: "#fff" }}>
                    Delete Song
                </button>

            </div>
        </>
    );
};

export default Tester;
