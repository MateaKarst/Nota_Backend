"use client";

import React, { useState } from "react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

interface PostResponse {
  status: number | "Error";
  data: {
    id?: string;
    sender_id?: string;
    receiver_id?: string;
    text?: string;
    created_at?: string;
    message?: string;
    error?: string;
    [key: string]: unknown;
  } | string;
}

interface GetResponse {
  status: number | "Error";
  data: Message[] | { message: string } | string;
}

interface DeleteResponse {
  status: number | "Error";
  data: { message: string } | string;
}

interface PatchResponse {
  status: number | "Error";
  data: Message | { message: string } | string;
}

export default function TestChatPage() {
  // POST form states
  const [senderId, setSenderId] = useState<string>("");
  const [receiverId, setReceiverId] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [postResponse, setPostResponse] = useState<PostResponse | null>(null);
  const [postLoading, setPostLoading] = useState<boolean>(false);

  // GET form states
  const [authUserId, setAuthUserId] = useState<string>("");
  const [chatWithId, setChatWithId] = useState<string>("");
  const [getResponse, setGetResponse] = useState<GetResponse | null>(null);
  const [getLoading, setGetLoading] = useState<boolean>(false);

  // DELETE form states
  const [deleteMessageId, setDeleteMessageId] = useState<string>("");
  const [deleteResponse, setDeleteResponse] = useState<DeleteResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // PATCH (update) form states
  const [updateMessageId, setUpdateMessageId] = useState<string>("");
  const [updateText, setUpdateText] = useState<string>("");
  const [patchResponse, setPatchResponse] = useState<PatchResponse | null>(null);
  const [patchLoading, setPatchLoading] = useState<boolean>(false);

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostLoading(true);
    setPostResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, text }),
      });

      const data = await res.json();
      setPostResponse({ status: res.status, data });
    } catch (error) {
      setPostResponse({
        status: "Error",
        data: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setPostLoading(false);
    }
  }

  async function handleGetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGetLoading(true);
    setGetResponse(null);

    try {
      const res = await fetch(`/api/chat/${chatWithId}`, {
        method: "GET",
        headers: { "x-user-id": authUserId },
      });

      const data = await res.json();
      setGetResponse({ status: res.status, data });
    } catch (error) {
      setGetResponse({
        status: "Error",
        data: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setGetLoading(false);
    }
  }

  async function handleDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteResponse(null);

    try {
      const res = await fetch(`/api/chat/${deleteMessageId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setDeleteResponse({ status: res.status, data });
    } catch (error) {
      setDeleteResponse({
        status: "Error",
        data: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handlePatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPatchLoading(true);
    setPatchResponse(null);

    try {
      const res = await fetch(`/api/chat/${updateMessageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updateText }),
      });

      const data = await res.json();
      setPatchResponse({ status: res.status, data });
    } catch (error) {
      setPatchResponse({
        status: "Error",
        data: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setPatchLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Test Chat API</h1>

      {/* POST form */}
      <form onSubmit={handlePostSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
        <h2>Send a Message</h2>
        <label>
          Sender ID:
          <input
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Receiver ID:
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Text:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit" disabled={postLoading}>
          {postLoading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {postResponse && (
        <section style={{ marginBottom: "3rem", whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "1rem" }}>
          <h3>Send Message Response (Status: {postResponse.status})</h3>
          <code>{typeof postResponse.data === "string" ? postResponse.data : JSON.stringify(postResponse.data, null, 2)}</code>
        </section>
      )}

      {/* GET form */}
      <form onSubmit={handleGetSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
        <h2>Get Conversation</h2>
        <label>
          Your User ID (x-user-id header):
          <input
            type="text"
            value={authUserId}
            onChange={(e) => setAuthUserId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Chat with User ID (in URL param):
          <input
            type="text"
            value={chatWithId}
            onChange={(e) => setChatWithId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit" disabled={getLoading}>
          {getLoading ? "Loading..." : "Get Conversation"}
        </button>
      </form>

      {getResponse && (
        <section style={{ marginBottom: "3rem", whiteSpace: "pre-wrap", background: "#e9f7ff", padding: "1rem" }}>
          <h3>Get Conversation Response (Status: {getResponse.status})</h3>
          <code>{typeof getResponse.data === "string" ? getResponse.data : JSON.stringify(getResponse.data, null, 2)}</code>
        </section>
      )}

      {/* DELETE form */}
      <form onSubmit={handleDeleteSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
        <h2>Delete Message</h2>
        <label>
          Message ID to delete:
          <input
            type="text"
            value={deleteMessageId}
            onChange={(e) => setDeleteMessageId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit" disabled={deleteLoading}>
          {deleteLoading ? "Deleting..." : "Delete Message"}
        </button>
      </form>

      {deleteResponse && (
        <section style={{ marginBottom: "3rem", whiteSpace: "pre-wrap", background: "#ffe6e6", padding: "1rem" }}>
          <h3>Delete Message Response (Status: {deleteResponse.status})</h3>
          <code>{typeof deleteResponse.data === "string" ? deleteResponse.data : JSON.stringify(deleteResponse.data, null, 2)}</code>
        </section>
      )}

      {/* PATCH form */}
      <form onSubmit={handlePatchSubmit} style={{ display: "grid", gap: "1rem" }}>
        <h2>Update Message Text</h2>
        <label>
          Message ID to update:
          <input
            type="text"
            value={updateMessageId}
            onChange={(e) => setUpdateMessageId(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          New Text:
          <textarea
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            required
            rows={3}
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit" disabled={patchLoading}>
          {patchLoading ? "Updating..." : "Update Message"}
        </button>
      </form>

      {patchResponse && (
        <section style={{ marginTop: "2rem", whiteSpace: "pre-wrap", background: "#e6ffe6", padding: "1rem" }}>
          <h3>Update Message Response (Status: {patchResponse.status})</h3>
          <code>{typeof patchResponse.data === "string" ? patchResponse.data : JSON.stringify(patchResponse.data, null, 2)}</code>
        </section>
      )}
    </main>
  );
}
