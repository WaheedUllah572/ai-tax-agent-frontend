import React, {
  useState,
  useRef,
  useEffect,
} from "react";

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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const sendMessageRef = useRef(null);

  // =========================================================
  // 🚗 LIVE GPS TRACKING REFS
  // =========================================================

  const gpsWatchIdRef = useRef(null);
  const lastGpsUploadRef = useRef(0);
  const gpsTrackingRef = useRef(false);

  // =========================================================
  // 🔊 REMOVE EMOJIS + MARKDOWN BEFORE SPEECH
  // =========================================================

  const cleanForSpeech = (text) =>
    text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/•/g, "")
      .replace(/\n/g, ". ");

  // =========================================================
  // 📍 GET CURRENT GPS LOCATION
  // =========================================================

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error(
          "GPS NOT SUPPORTED BY BROWSER"
        );

        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          };

          console.log(
            "GPS LOCATION RECEIVED:",
            location
          );

          resolve(location);
        },

        (error) => {
          console.error(
            "GPS LOCATION ERROR:",
            error
          );

          resolve(null);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  // =========================================================
  // 🚗 SEND LIVE GPS POINT TO BACKEND
  // =========================================================

  const sendGpsPointToBackend = async (
    position
  ) => {
    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        console.error(
          "GPS UPLOAD ERROR: NO ACCESS TOKEN"
        );

        return;
      }

      const location = {
        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude,

        accuracy:
          position.coords.accuracy,
      };

      console.log(
        "========== GPS POINT RECEIVED =========="
      );

      console.log(
        "LATITUDE:",
        location.latitude
      );

      console.log(
        "LONGITUDE:",
        location.longitude
      );

      console.log(
        "ACCURACY:",
        location.accuracy
      );

      console.log(
        "========================================"
      );

      const response =
        await axios.post(
          "https://ai-tax-agent-backend-1.onrender.com/mileage/location",

          {
            location: location,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "GPS BACKEND STATUS:",
        response.status
      );

      console.log(
        "GPS BACKEND RESPONSE:",
        response.data
      );

      if (response.data) {
        console.log(
          "GPS TOTAL MILES:",
          response.data.total_miles
        );

        console.log(
          "GPS ADDED MILES:",
          response.data.added_miles
        );
      }
    } catch (error) {
      console.error(
        "GPS UPLOAD ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =========================================================
  // 🚗 START CONTINUOUS GPS TRACKING
  // =========================================================

  const startLiveGpsTracking = () => {
    if (!navigator.geolocation) {
      console.error(
        "LIVE GPS NOT SUPPORTED BY BROWSER"
      );

      return;
    }

    if (
      gpsWatchIdRef.current !== null
    ) {
      console.log(
        "LIVE GPS TRACKING ALREADY RUNNING"
      );

      return;
    }

    console.log(
      "========== STARTING LIVE GPS =========="
    );

    gpsTrackingRef.current = true;

    lastGpsUploadRef.current = 0;

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          if (
            !gpsTrackingRef.current
          ) {
            return;
          }

          const now = Date.now();

          // -------------------------------------------------
          // Upload at most once every 5 seconds
          // -------------------------------------------------

          if (
            lastGpsUploadRef.current !==
              0 &&
            now -
                lastGpsUploadRef.current <
              5000
          ) {
            console.log(
              "GPS POINT SKIPPED: Upload throttle"
            );

            return;
          }

          lastGpsUploadRef.current =
            now;

          await sendGpsPointToBackend(
            position
          );
        },

        (error) => {
          console.error(
            "LIVE GPS ERROR:",
            error
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

    gpsWatchIdRef.current =
      watchId;

    console.log(
      "LIVE GPS WATCH ID:",
      watchId
    );
  };

  // =========================================================
  // 🛑 STOP CONTINUOUS GPS TRACKING
  // =========================================================

  const stopLiveGpsTracking = () => {
    console.log(
      "========== STOPPING LIVE GPS =========="
    );

    gpsTrackingRef.current = false;

    if (
      gpsWatchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(
        gpsWatchIdRef.current
      );

      gpsWatchIdRef.current = null;
    }

    lastGpsUploadRef.current = 0;

    console.log(
      "========== LIVE GPS STOPPED =========="
    );
  };

  // =========================================================
  // 🚗 DETECT MILEAGE COMMAND
  // =========================================================

  const isStartMileageCommand = (
    message
  ) => {
    const lowerMessage =
      message.toLowerCase();

    const startPatterns = [
      "start mileage",
      "start my mileage",
      "start trip",
      "start my trip",
      "start a trip",
      "start my journey",
      "begin trip",
      "begin my trip",
      "begin a trip",
      "begin mileage",
      "begin my mileage",
      "track mileage",
      "track my mileage",
      "track this trip",
      "start tracking",
      "start tracking mileage",
      "i'm driving",
      "i am driving",
      "driving to",
      "heading to",
      "headed to",
      "going to",
      "i'm going to",
      "i am going to",
      "on my way",
      "leaving for",
      "leave for",
    ];

    return startPatterns.some(
      (pattern) =>
        lowerMessage.includes(
          pattern
        )
    );
  };

  const isStopMileageCommand = (
    message
  ) => {
    const lowerMessage =
      message.toLowerCase();

    const stopPatterns = [
      "stop trip",
      "stop mileage",
      "end trip",
      "finish trip",
      "trip finished",
      "arrived",
      "i'm here",
      "i am here",
      "finished driving",
      "done driving",
    ];

    return stopPatterns.some(
      (pattern) =>
        lowerMessage.includes(
          pattern
        )
    );
  };

  // =========================================================
  // 🚀 SEND MESSAGE
  // =========================================================

  const sendMessage = async (
    customMessage = null
  ) => {
    const messageToSend =
      customMessage || input;

    if (!messageToSend.trim()) {
      return;
    }

    const timestamp =
      new Date().toLocaleTimeString();

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
      const token =
        localStorage.getItem(
          "access_token"
        );

      // =====================================================
      // 📍 DETECT MILEAGE COMMAND
      // =====================================================

      let startLocation = null;
      let endLocation = null;

      const startMileage =
        isStartMileageCommand(
          messageToSend
        );

      const stopMileage =
        isStopMileageCommand(
          messageToSend
        );

      // =====================================================
      // 🛑 STOP LIVE GPS BEFORE FINAL GPS
      // =====================================================

      if (stopMileage) {
        console.log(
          "STOP MILEAGE COMMAND DETECTED"
        );

        stopLiveGpsTracking();
      }

      // =====================================================
      // 📍 GET GPS FOR START / STOP
      // =====================================================

      if (
        startMileage ||
        stopMileage
      ) {
        console.log(
          "MILEAGE COMMAND DETECTED - REQUESTING GPS..."
        );

        const currentLocation =
          await getCurrentLocation();

        if (startMileage) {
          startLocation =
            currentLocation;

          console.log(
            "START LOCATION:",
            startLocation
          );
        }

        if (stopMileage) {
          endLocation =
            currentLocation;

          console.log(
            "END LOCATION:",
            endLocation
          );
        }
      }

      // =====================================================
      // 📡 SEND MESSAGE TO BACKEND
      // =====================================================

      const res = await axios.post(
        "https://ai-tax-agent-backend-1.onrender.com/chat",

        {
          message: messageToSend,

          mode: mode,

          session_id:
            "user-session-1",

          // GPS for mileage start
          start_location:
            startLocation,

          // GPS for mileage stop
          end_location:
            endLocation,
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const reply =
        res.data.reply ||
        "No reply received.";

      // =====================================================
      // 🚗 START CONTINUOUS GPS AFTER SUCCESSFUL START
      // =====================================================

      if (
        startMileage &&
        startLocation
      ) {
        console.log(
          "========== MILEAGE START SUCCESS =========="
        );

        console.log(
          "Starting continuous GPS tracking..."
        );

        startLiveGpsTracking();
      }

      // =====================================================
      // 📋 PENDING CONFIRMATION
      // =====================================================

      const pending =
        mode === "tax"
          ? res.data.context
              ?.pending_trip_confirmation
          : null;

      setHistory((prev) => {
        const newHistory = [
          ...prev,
        ];

        newHistory[
          newHistory.length - 1
        ] = {
          ...newHistory[
            newHistory.length - 1
          ],

          bot: reply,

          pendingConfirmation:
            pending || null,
        };

        return newHistory;
      });

      // =====================================================
      // 🔊 SPEECH
      // =====================================================

      if (
        micEnabled &&
        reply &&
        reply !== "typing..."
      ) {
        const utterance =
          new SpeechSynthesisUtterance(
            cleanForSpeech(reply)
          );

        utterance.lang =
          "en-US";

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
          utterance
        );
      }
    } catch (error) {
      console.error(
        "CHAT REQUEST ERROR:",
        error
      );

      // If a start request failed,
      // make sure GPS watcher does not remain active.
      if (startMileage) {
        stopLiveGpsTracking();
      }

      setHistory((prev) => {
        const newHistory = [
          ...prev,
        ];

        if (
          newHistory.length > 0
        ) {
          newHistory[
            newHistory.length - 1
          ].bot =
            "Error connecting to server.";
        }

        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  sendMessageRef.current =
    sendMessage;

  // =========================================================
  // 🎤 MICROPHONE
  // =========================================================

  const toggleMic = async () => {
    if (!listening) {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        const recorder =
          new MediaRecorder(
            stream
          );

        mediaRecorderRef.current =
          recorder;

        audioChunksRef.current =
          [];

        recorder.ondataavailable = (
          event
        ) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };

        recorder.onstart = () => {
          setListening(true);
        };

        recorder.onstop =
          async () => {
            setListening(false);

            const mimeType =
              mediaRecorderRef
                .current?.mimeType ||
              audioChunksRef
                .current[0]?.type ||
              "audio/webm";

            const extension =
              mimeType.includes(
                "mp4"
              )
                ? "mp4"
                : mimeType.includes(
                    "mpeg"
                  )
                ? "mp3"
                : mimeType.includes(
                    "ogg"
                  )
                ? "ogg"
                : mimeType.includes(
                    "wav"
                  )
                ? "wav"
                : "webm";

            const audioBlob =
              new Blob(
                audioChunksRef.current,
                {
                  type: mimeType,
                }
              );

            const formData =
              new FormData();

            formData.append(
              "audio",
              audioBlob,
              `voice.${extension}`
            );

            try {
              const token =
                localStorage.getItem(
                  "access_token"
                );

              const res =
                await axios.post(
                  "https://ai-tax-agent-backend-1.onrender.com/transcribe",

                  formData,

                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,

                      "Content-Type":
                        "multipart/form-data",
                    },
                  }
                );

              setInput(
                res.data.text || ""
              );
            } catch (err) {
              console.error(
                "SPEECH TRANSCRIPTION ERROR:",
                err
              );

              alert(
                "Speech transcription failed."
              );
            }

            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );
          };

        recorder.start();
      } catch (err) {
        console.error(
          "MICROPHONE ERROR:",
          err
        );

        alert(
          "Unable to access microphone."
        );
      }
    } else {
      mediaRecorderRef.current?.stop();
    }
  };

  // =========================================================
  // ⌨️ ENTER KEY
  // =========================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !loading
    ) {
      sendMessage();
    }
  };

  // =========================================================
  // 🧹 CLEAR CHAT
  // =========================================================

  const clearChat = () => {
    setHistory([]);
  };

  // =========================================================
  // 📜 AUTO SCROLL
  // =========================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [history]);

  // =========================================================
  // 🧹 CLEANUP GPS WATCHER
  // =========================================================

  useEffect(() => {
    return () => {
      stopLiveGpsTracking();
    };
  }, []);

  // =========================================================
  // 🎨 UI
  // =========================================================

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
              onClick={() =>
                setMicEnabled(
                  (prev) => !prev
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition ${
                micEnabled
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >

              {micEnabled ? (
                <>
                  <MicrophoneIcon className="h-5 w-5" />
                  Mic On
                </>
              ) : (
                <>
                  <SpeakerXMarkIcon className="h-5 w-5" />
                  Mic Off
                </>
              )}

            </button>

            <button
              onClick={clearChat}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md hover:scale-105 transition"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Clear
            </button>

          </div>

        </div>

        {/* Modes */}

        <div className="flex gap-3 mb-4">

          <button
            onClick={() =>
              setMode("tax")
            }
            className={`px-4 py-2 rounded-full shadow ${
              mode === "tax"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tax Expert
          </button>

          <button
            onClick={() =>
              setMode("help")
            }
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

          {history.map(
            (h, idx) => (

              <div
                key={idx}
                className="space-y-3"
              >

                <div className="flex justify-end">

                  <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl shadow-lg max-w-[80%] text-sm">
                    {h.user}
                  </div>

                </div>

                <div className="flex justify-start">

                  <div className="px-5 py-3 bg-white/90 border border-gray-200 text-gray-800 rounded-3xl shadow-md max-w-lg text-sm">

                    {h.bot ===
                    "typing..." ? (
                      <div className="flex gap-1">

                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>

                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>

                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>

                      </div>
                    ) : (
                      <ReactMarkdown>
                        {h.bot}
                      </ReactMarkdown>
                    )}

                    {/* Confirmation Buttons */}

                    {mode ===
                      "tax" &&
                      h.pendingConfirmation && (
                        <div className="mt-4 flex gap-3">

                          <button
                            onClick={() =>
                              sendMessage(
                                "CONFIRM"
                              )
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-full text-xs shadow hover:scale-105 transition"
                          >
                            ✓ Confirm Trip
                          </button>

                          <button
                            onClick={() =>
                              sendMessage(
                                "EDIT"
                              )
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs shadow hover:scale-105 transition"
                          >
                            ✏ Edit Details
                          </button>

                        </div>
                      )}

                  </div>

                </div>

              </div>
            )
          )}

          <div ref={chatEndRef}></div>

        </div>

        {/* Input Area */}

        <div className="flex items-center mt-4 bg-white/90 border border-gray-200 rounded-full px-4 py-2 shadow-lg gap-3">

          <input
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
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
            onClick={() =>
              sendMessage()
            }
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center gap-2"
          >

            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />

            {loading
              ? "Sending..."
              : "Send"}

          </button>

        </div>

      </div>

    </div>
  );
}