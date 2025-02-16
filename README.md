# AI Voice Assistant

A modern, interactive AI voice assistant built with React and powered by Google's Gemini AI. This application provides a seamless conversational interface with both voice and text input capabilities.

![AI Assistant Screenshot](https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1200)

## Features

- 🎙️ Voice Recognition
- 🔊 Text-to-Speech
- 📸 Image Upload Support
- 💬 Chat History
- 📋 Code Snippet Copy
- 🎨 Beautiful UI/UX
- 📱 Responsive Design

## Technology Stack

### Core Technologies

- **React (^18.3.1)**

  - Chosen for its robust component-based architecture and efficient rendering
  - Provides excellent developer experience and extensive ecosystem

- **TypeScript**

  - Ensures type safety and better code maintainability
  - Improves development experience with better IDE support

- **Vite**
  - Offers lightning-fast development server and build times
  - Provides excellent hot module replacement (HMR)

### AI & Voice Features

- **Google Generative AI (^0.2.1)**

  - Powers the conversational AI capabilities
  - Provides natural and context-aware responses

- **React Speech Recognition (^3.10.0)**
  - Enables voice input functionality
  - Provides easy-to-use hooks for speech recognition

### UI Components

- **Tailwind CSS**

  - Utility-first CSS framework for rapid UI development
  - Provides consistent design system and responsive layouts

- **Lucide React**
  - Modern icon library with clean, consistent design
  - Lightweight and easy to use

### Development Tools

- **ESLint**
  - Ensures code quality and consistency
  - Configured with TypeScript and React specific rules

## Project Structure

```
src/
├── components/
│   └── VoiceAssistant.tsx    # Main voice assistant component
├── types/
│   └── index.ts              # TypeScript type definitions
├── App.tsx                   # Root application component
└── main.tsx                 # Application entry point
```

## Features in Detail

### Voice Recognition

The application uses the Web Speech API through react-speech-recognition to enable voice input. Users can toggle voice input with a microphone button.

### Text-to-Speech

Implements browser-native speech synthesis for reading AI responses aloud, with controls to enable/disable this feature.

### Chat History

- Persistent chat history using localStorage
- Ability to start new conversations
- Browse and load previous conversations

### Image Support

Users can upload images to enhance their conversations with the AI assistant.

### Code Handling

- Special formatting for code blocks
- One-click code copying functionality
- Syntax highlighting for better readability

## Best Practices

- **Responsive Design**: Fully responsive layout that works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Comprehensive error handling for API calls and voice features
- **State Management**: Efficient state management using React hooks
- **Type Safety**: Full TypeScript implementation for better code reliability

## Output

![alt text](<Screenshot 2025-02-16 124811.png>) ![alt text](<Screenshot 2025-02-16 124906.png>) ![alt text](<Screenshot 2025-02-16 124930.png>)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Google Gemini API key to `App.tsx`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
