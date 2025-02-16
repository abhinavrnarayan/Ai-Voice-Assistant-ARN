import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MicOff, Send, User, Bot, Volume2, VolumeX, Image as ImageIcon, Copy, Check, Plus, Menu, X, MessageSquare } from 'lucide-react';
import type { Message, VoiceAssistantProps } from '../types';

export default function VoiceAssistant({ apiKey }: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('currentChat');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: string; messages: Message[]; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const genAI = new GoogleGenerativeAI(apiKey);
  const synth = window.speechSynthesis;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    localStorage.setItem('currentChat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const speakText = (text: string) => {
    if (!isSpeakerOn) return;
    
    synth.cancel();
    const cleanedText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = synth.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    synth.speak(utterance);
  };

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, 'Code block omitted in speech')
      .replace(/`(.*?)`/g, '$1');
  };

  const cleanResponse = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

  const extractCodeFromMessage = (content: string) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const inlineCodeRegex = /`[^`]+`/g;
    
    const codeBlocks = content.match(codeBlockRegex) || [];
    const inlineCodes = content.match(inlineCodeRegex) || [];
    
    const extractedCode = [...codeBlocks, ...inlineCodes]
      .map(code => code.replace(/^```[\s\n]*|```$/g, '').replace(/^`|`$/g, ''))
      .join('\n\n');
      
    return extractedCode || content;
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    resetTranscript();
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = cleanResponse(response.text());

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      
      speakText(text);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      setInput('');
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn) {
      synth.cancel();
    }
  };

  const handleCopy = (content: string, index: number) => {
    const codeToCopy = extractCodeFromMessage(content);
    navigator.clipboard.writeText(codeToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: `[Uploaded Image]`,
          image: imageUrl
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasCodeBlock = (content: string) => {
    return content.includes('```') || content.includes('`');
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const newChatHistory = {
        id: Date.now().toString(),
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      setChatHistory(prev => [newChatHistory, ...prev]);
    }
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const loadChat = (chat: { messages: Message[] }) => {
    setMessages(chat.messages);
    setIsSidebarOpen(false);
  };

  const getPreviewText = (messages: Message[]) => {
    if (!messages || messages.length === 0) return "Empty chat";
    const firstMessage = messages[0];
    return firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? "..." : "");
  };

  const generateMessageKey = (message: Message, index: number) => {
    return `message-${index}-${message.role}-${message.content.substring(0, 20)}`;
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Chat History</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => loadChat(chat)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getPreviewText(chat.messages)}
                  </p>
                  <p className="text-xs text-gray-500">{chat.timestamp}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex items-center p-4 bg-white shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">AI Assistant</h1>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <div 
            ref={chatContainerRef}
            className="h-full overflow-y-auto space-y-6 bg-white rounded-lg shadow-lg p-4"
          >
            {messages.map((message, index) => (
              <div
                key={generateMessageKey(message, index)}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-800'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded content" 
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                  <div className="relative">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.role === 'assistant' && hasCodeBlock(message.content) && (
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="absolute top-0 right-0 p-1 text-gray-500 hover:text-gray-700"
                        title="Copy code"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="bg-gray-50 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-white shadow-lg">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full transition-colors ${
                listening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {listening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`p-3 rounded-full transition-colors ${
                isSpeakerOn
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={isSpeakerOn ? 'Turn off text-to-speech' : 'Turn on text-to-speech'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={handleImageUpload}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
              title="Upload image"
            >
              <ImageIcon className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message or speak..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}