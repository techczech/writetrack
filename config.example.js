// =================================================================================
// WriteTrack Application Configuration
// =================================================================================
//
// This file provides the necessary API keys and configuration for the application.
//
// --- INSTRUCTIONS ---
// 1. Make a copy of this file and rename it to `config.js`.
// 2. Fill in the placeholder values (`"PASTE_YOUR_..._HERE"`) with your actual keys.
// 3. Make sure the `config.js` file is included in your deployment, but DO NOT
//    commit it to your public GitHub repository. The `.gitignore` file is already
//    set up to ignore `config.js` for you.
//
// =================================================================================

window.APP_CONFIG = {
  // --- Google Gemini API Key ---
  // This key is for the AI features like title generation and summaries.
  // You can get this from Google AI Studio.
  API_KEY: "PASTE_YOUR_GEMINI_API_KEY_HERE",

  // --- Firebase Configuration ---
  // Copy these values directly from the firebaseConfig object in your
  // Firebase project settings.
  FIREBASE_API_KEY: "PASTE_YOUR_apiKey_HERE",
  FIREBASE_AUTH_DOMAIN: "PASTE_YOUR_authDomain_HERE",
  FIREBASE_PROJECT_ID: "PASTE_YOUR_projectId_HERE",
  FIREBASE_STORAGE_BUCKET: "PASTE_YOUR_storageBucket_HERE",
  FIREBASE_MESSAGING_SENDER_ID: "PASTE_YOUR_messagingSenderId_HERE",
  FIREBASE_APP_ID: "PASTE_YOUR_appId_HERE",
};
