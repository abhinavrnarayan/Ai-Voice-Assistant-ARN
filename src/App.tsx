import React from "react";
import VoiceAssistant from "./components/VoiceAssistant";

function App() {
  // Replace with your actual Google Gemini API key
  const GEMINI_API_KEY = "YOUR API KEY HERE";

  return (
    <div className="min-h-screen bg-gray-100">
      <VoiceAssistant apiKey={GEMINI_API_KEY} />
    </div>
  );
}

export default App;
