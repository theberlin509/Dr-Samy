<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dr Samy - AI Medical Pre-diagnosis Assistant

This contains everything you need to run your app locally and deploy it to Vercel.

View your app in AI Studio: https://ai.studio/apps/drive/1dQ4zPesw4Jg1OC4lrP54wqACsVDSeZg4

## Environment Variable Setup

This project requires your Google Gemini API key to function.

### For Local Development

1.  Create a file named `.env.local` in the root of your project.
2.  Add the following variable to the file, replacing the placeholder value with your actual key:

    ```bash
    # Your Google Gemini API Key (used by the backend)
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

### For Vercel Deployment

When you deploy your project to Vercel, you must configure your Gemini API key in the project settings.

1.  Go to your project's dashboard on Vercel.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add the `API_KEY` variable with your Google Gemini API key as the value. This is a secret key and will be encrypted by Vercel.
4.  Redeploy your project for the changes to take effect.

## Run Locally

**Prerequisites:** Node.js

1.  Set up your `.env.local` file as described above.
2.  Install dependencies:
   `npm install`
3.  Run the app:
   `npm run dev`