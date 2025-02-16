export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export interface VoiceAssistantProps {
  apiKey: string;
}