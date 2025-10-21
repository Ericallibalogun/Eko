<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EKO Navigation App

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/10dyVT_Cp5c55_ZJHGqC8wbSvTt1UglUp

## Run Locally

**Prerequisites:** Node.js, MongoDB

### Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Make sure MongoDB is running:

   ```bash
   mongod
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Create a `.env` file in the backend directory with:

```env
MONGODB_URI=mongodb://localhost:27017/eko-navigation
JWT_SECRET=your_jwt_secret_here
PORT=5000
```
