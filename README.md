# Pludo Coder

AI-powered website generation with instant Vercel deployment. A streamlined code generation tool powered by Gemini 2.0 Flash.

## Features

- **AI-Powered Generation**: Uses Google's Gemini 2.0 Flash for fast, intelligent code generation
- **Instant Deployment**: Automatically deploys to Vercel for immediate preview
- **Clean UI**: Modern, responsive interface with real-time code display
- **No Server Configuration**: Users provide their own API keys through the UI
- **Production Ready**: Generates clean, modern HTML/CSS/JavaScript

## Setup

1. **Clone & Install**
```bash
git clone <your-repo-url>
cd pludo-coder
npm install
```

2. **Run Development Server**
```bash
npm run dev
```

3. **Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

## User Configuration

When users first open the application, they will be prompted to provide:

1. **Gemini 2.0 Flash API Key**
   - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Free tier available

2. **Vercel API Token**
   - Get your token from [Vercel Account Settings](https://vercel.com/account/tokens)
   - Required for deployment

API keys are stored securely in the browser's localStorage and are never sent to the server.

## How It Works

1. User enters a description of the website they want to build
2. Gemini 2.0 Flash generates HTML, CSS, and JavaScript code
3. Generated code is displayed in a syntax-highlighted editor
4. User can deploy to Vercel with one click
5. Live preview appears in an iframe once deployed

## Project Structure

```
pludo-coder/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── generation/
│   │   └── page.tsx               # Code generation & preview page
│   └── api/
│       ├── generate-code/         # Gemini AI code generation
│       └── deploy-vercel/         # Vercel deployment
├── components/
│   └── ApiKeyManager.tsx          # API key configuration UI
└── config/
    └── app.config.ts              # Application configuration
```

## Technologies

- **Frontend**: Next.js 15, React 19, TailwindCSS, Framer Motion
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **Deployment**: Vercel Deployment API
- **Syntax Highlighting**: React Syntax Highlighter

## Build for Production

```bash
npm run build
npm start
```

## License

MIT
