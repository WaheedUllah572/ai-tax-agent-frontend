import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("tax");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 🔊 REMOVE EMOJIS + MARKDOWN BEFORE SPEECH
  const cleanForSpeech = (text) => {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/•/g, "")
      .replace(/\n/g, ". ");
  };

  // 🎤 Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  // 🚀 Send Message
  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString();

    setHistory((prev) => [
      ...prev,
      {
        user: messageToSend,
        bot: "typing...",
        time: timestamp,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

const res = await axios.post(
  "https://ai-tax-agent-backend-1.onrender.com/chat",
  {
    message: messageToSend,
    mode: mode,
    session_id: "user-session-1",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const reply = res.data.reply || "No reply received.";
      const pending =
  mode === "tax"
    ? res.data.context?.pending_trip_confirmation
    : null;

      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          ...newHistory[newHistory.length - 1],
          bot: reply,
          pendingConfirmation: pending || null,
        };
        return newHistory;
      });

      // 🔊 SPEECH
      if (micEnabled && reply && reply !== "typing...") {
        const utterance = new SpeechSynthesisUtterance(
          cleanForSpeech(reply)
        );
        utterance.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot =
          "Error connecting to server.";
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  const clearChat = () => setHistory([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex justify-center items-center p-6 font-sans">
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-200 p-6 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="RefundPilot"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Max
    </h1>

    <p className="text-gray-500 text-sm">
      Your RefundPilot AI Assistant
    </p>
  </div>
</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setMicEnabled((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition ${
                micEnabled
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {micEnabled ? (
                <>
                  <MicrophoneIcon className="h-5 w-5" /> Mic On
                </>
              ) : (
                <>
                  <SpeakerXMarkIcon className="h-5 w-5" /> Mic Off
                </>
              )}
            </button>

            <button
              onClick={clearChat}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md hover:scale-105 transition"
            >
              <ArrowPathIcon className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-4">

  <button
    onClick={() => setMode("tax")}
    className={`px-4 py-2 rounded-full shadow ${
      mode === "tax"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Tax Expert
  </button>

  <button
    onClick={() => setMode("help")}
    className={`px-4 py-2 rounded-full shadow ${
      mode === "help"
        ? "bg-purple-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    RefundPilot Help
  </button>

</div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner space-y-6">
          {history.map((h, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-end">
                <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl shadow-lg max-w-[80%] text-sm">
                  {h.user}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="px-5 py-3 bg-white/90 border border-gray-200 text-gray-800 rounded-3xl shadow-md max-w-lg text-sm">
                  {h.bot === "typing..." ? (
  <div className="flex gap-1">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
  </div>
) : (
  <ReactMarkdown>{h.bot}</ReactMarkdown>
)}

                  {/* ✅ Confirmation Buttons */}
                  
                  {mode === "tax" && h.pendingConfirmation && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => sendMessage("CONFIRM")}
                        className="px-4 py-2 bg-green-600 text-white rounded-full text-xs shadow hover:scale-105 transition"
                      >
                        ✓ Confirm Trip
                      </button>

                      <button
                        onClick={() => sendMessage("EDIT")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs shadow hover:scale-105 transition"
                      >
                        ✏ Edit Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="flex items-center mt-4 bg-white/90 border border-gray-200 rounded-full px-4 py-2 shadow-lg gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-700 text-sm"
            placeholder={
  listening
    ? "Listening..."
    : mode === "help"
    ? "Ask how to use RefundPilot features..."
    : "Ask Max anything about your business..."
}
          />

          <button
            onClick={toggleMic}
            className={`p-2 rounded-full transition ${
              listening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            }`}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center gap-2"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}