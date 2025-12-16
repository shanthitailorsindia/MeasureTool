# Shanthi Tailors - Measurement Tool

A digital guide for taking accurate dance costume measurements.

## ⚠️ Important Deployment Instruction

**DO NOT DELETE YOUR AUDIO FOLDER.**

If you are uploading files manually to GitHub, please ensure your folder structure looks like this:

```
/ (Root of repository)
├── public/               <-- CREATE THIS FOLDER
│   └── audio/            <-- MOVE YOUR AUDIO FOLDER HERE
│       ├── waist.wav
│       ├── ...
├── src/
├── package.json
└── vite.config.ts
```

**Why?**
Vite (the build tool) requires static assets like audio files to be placed inside a `public` directory. When the site is built for Netlify, the contents of `public` are copied to the root of the website.

If you leave `audio` at the root (next to `package.json`), it will **not** be included in the final website, resulting in "File Missing" errors.

## Features

- **Interactive Guide:** Step-by-step instructions with diagrams.
- **Audio Assistance:** Voice instructions (requires `public/audio` files).
- **AI Analysis:** Checks measurement proportions using Google Gemini API.
- **PDF Generation:** Downloads a summary for the tailor.
- **WhatsApp Integration:** Pre-fills a message to send the PDF.

## Development

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`
