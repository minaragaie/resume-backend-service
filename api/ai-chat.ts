import { VercelRequest, VercelResponse } from '@vercel/node';

// Define interfaces for type safety
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  response: string;
  error: string | null;
}

interface HuggingFaceResponse {
  generated_text: string;
  error?: string;
}

// AI Chat endpoint for Hugging Face integration
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      response: null,
      error: 'Method not allowed. Use POST.'
    });
  }

  console.log('🤖 AI Chat endpoint called');
  console.log('📝 Request body:', req.body);

  try {
    const { message, conversationHistory = [] }: { message: string; conversationHistory: ChatMessage[] } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        response: null,
        error: 'Message is required and must be a string'
      });
    }

    // Check if Hugging Face API key is available
    if (!process.env.HUGGINGFACE) {
      console.error('❌ HUGGINGFACE environment variable not set');
      return res.status(500).json({
        response: null,
        error: 'AI service not configured'
      });
    }

    console.log('🔑 API Key exists:', process.env.HUGGINGFACE ? 'Yes' : 'No');
    console.log('🔑 API Key length:', process.env.HUGGINGFACE?.length);
    console.log('🔑 API Key starts with hf_:', process.env.HUGGINGFACE?.startsWith('hf_'));
    console.log('🌐 Calling Hugging Face API...');

    // Prepare conversation context for DialoGPT
    const pastUserInputs = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .slice(-5); // Keep last 5 user messages

    const generatedResponses = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content)
      .slice(-5); // Keep last 5 assistant responses

    // Call Hugging Face API
    const huggingFaceResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: pastUserInputs,
          generated_responses: generatedResponses,
          text: message
        },
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    console.log('📡 Hugging Face response status:', huggingFaceResponse.status);

    if (!huggingFaceResponse.ok) {
      const errorText = await huggingFaceResponse.text();
      console.error('❌ Hugging Face API error:', errorText);
      
      // Return fallback response instead of error
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        response: fallbackResponse,
        error: null
      });
    }

    const aiData: HuggingFaceResponse = await huggingFaceResponse.json();
    console.log('✅ Hugging Face response:', aiData);

    // Format response for terminal display
    const formattedResponse = formatForTerminal(aiData.generated_text || '');
    
    res.json({
      response: formattedResponse,
      error: null
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    
    // Return fallback response instead of error
    const fallbackResponse = getFallbackResponse(req.body?.message || 'Hello');
    res.json({
      response: fallbackResponse,
      error: null
    });
  }
}

// Helper function to format AI response for terminal
function formatForTerminal(text: string): string {
  if (!text) return 'I apologize, but I couldn\'t generate a response. Please try again.';
  
  return text
    .replace(/\n+/g, '\n') // Replace multiple newlines with single
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim()
    .substring(0, 500); // Limit length
}

// Fallback responses when AI is unavailable
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `╭─────────────────────────────────────────╮
│                HELLO THERE!                │
╰─────────────────────────────────────────╯

Hello! Welcome to my portfolio terminal! 👋

I'm Mina, a Senior Full-Stack Developer with 5+ years 
of experience in modern web technologies.

Quick Commands:
• 'help' - See all available commands
• 'about' - Learn about my background
• 'ls' - Browse my portfolio files
• 'whoami' - See my basic info

Feel free to ask me anything about my work, 
experience, or projects!`;
  }
  
  if (lowerMessage.includes('help')) {
    return `╭─────────────────────────────────────────╮
│                HELP MENU                   │
╰─────────────────────────────────────────╯

Available Commands:
• help - Show this help menu
• about - Learn about my background
• experience - View my work experience
• projects - See my projects
• skills - View my technical skills
• contact - Get in touch
• resume - Download my resume
• github - View my GitHub profile
• clear - Clear the terminal
• whoami - Show basic info
• pwd - Show current directory
• ls - List files
• date - Show current date
• version - Show terminal version

You can also ask me questions about:
• My experience and skills
• Specific projects I've worked on
• Technology recommendations
• Career advice
• General programming questions`;
  }
  
  if (lowerMessage.includes('about') || lowerMessage.includes('who are you')) {
    return `╭─────────────────────────────────────────╮
│                ABOUT MINA                  │
╰─────────────────────────────────────────╯

I'm Mina Youaness, a Senior Full-Stack Developer 
with 5+ years of experience building modern web 
applications.

🎯 Specializations:
• Frontend: React, Next.js, TypeScript, Angular
• Backend: Node.js, Express, Python, FastAPI
• Cloud: AWS, Vercel, Docker, Kubernetes
• Databases: PostgreSQL, MongoDB, Redis
• Mobile: React Native, Flutter

🚀 Current Focus:
• Building scalable web applications
• Implementing modern DevOps practices
• Mentoring junior developers
• Contributing to open source projects

I'm passionate about creating efficient, maintainable 
code and solving complex technical challenges.`;
  }
  
  if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
    return `╭─────────────────────────────────────────╮
│              WORK EXPERIENCE               │
╰─────────────────────────────────────────╯

🏢 Senior Full-Stack Developer (5+ years)
• Led development of multiple web applications
• Implemented modern CI/CD pipelines
• Mentored junior developers
• Built scalable microservices architecture

🛠️ Key Technologies:
• Frontend: React, Next.js, TypeScript, Angular
• Backend: Node.js, Express, Python, FastAPI
• Cloud: AWS, Vercel, Docker, Kubernetes
• Databases: PostgreSQL, MongoDB, Redis

💼 Notable Projects:
• E-commerce platforms with 100k+ users
• Real-time collaboration tools
• Mobile applications with React Native
• API integrations and microservices

Ask me about specific projects or technologies!`;
  }
  
  if (lowerMessage.includes('projects') || lowerMessage.includes('portfolio')) {
    return `╭─────────────────────────────────────────╮
│                MY PROJECTS                 │
╰─────────────────────────────────────────╯

🚀 Featured Projects:

1. **E-commerce Platform**
   • Built with React, Node.js, PostgreSQL
   • Handles 100k+ users with real-time features
   • Integrated payment processing and inventory

2. **Real-time Collaboration Tool**
   • WebSocket-based real-time editing
   • Built with Next.js and Socket.io
   • Supports multiple users simultaneously

3. **Mobile App (React Native)**
   • Cross-platform mobile application
   • Integrated with backend APIs
   • Published on app stores

4. **Portfolio Website**
   • This very website you're using!
   • Built with Next.js and TypeScript
   • Features AI chat and interactive terminals

Ask me about any specific project for more details!`;
  }
  
  if (lowerMessage.includes('skills') || lowerMessage.includes('technologies')) {
    return `╭─────────────────────────────────────────╮
│              TECHNICAL SKILLS              │
╰─────────────────────────────────────────╯

💻 Programming Languages:
• JavaScript/TypeScript (Expert)
• Python (Advanced)
• Java (Intermediate)
• C# (Intermediate)

🌐 Frontend Technologies:
• React, Next.js, Angular
• HTML5, CSS3, Sass/SCSS
• Redux, Context API, Zustand
• Material-UI, Tailwind CSS

⚙️ Backend Technologies:
• Node.js, Express, FastAPI
• RESTful APIs, GraphQL
• Microservices Architecture
• Serverless Functions

☁️ Cloud & DevOps:
• AWS (EC2, S3, Lambda, RDS)
• Vercel, Netlify
• Docker, Kubernetes
• CI/CD Pipelines

🗄️ Databases:
• PostgreSQL, MongoDB
• Redis, Elasticsearch
• Database Design & Optimization

Ask me about any specific technology!`;
  }
  
  // Default fallback
  return `I'm here to help! You can ask me about:
• My experience and skills
• Projects I've worked on
• Technology recommendations
• Career advice
• Or just say 'help' for available commands

What would you like to know?`;
}
