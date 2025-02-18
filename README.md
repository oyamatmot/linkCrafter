
# LinkCrafter

A professional link management and analytics platform.

## Getting Started

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file with required variables (check `.env.example`)

4. Start the development server:
```bash
npm run dev
```

The app will be running on port 5000.

## Deployment Options

### Deploy on Replit (Recommended)

[Replit](https://replit.com)
1. Click "Deploy" in top-right corner
2. Choose deployment type:
   - Autoscale: Best for most apps, scales with traffic
   - Reserved VM: For consistent workloads
3. Configure:
   - Set URL (yourapp.replit.app)
   - Add environment variables in Secrets
   - Build: `npm run build`
   - Start: `npm run start`
4. Click "Deploy"

### Deploy on Render

1. Go to [Render](https://render.com) and sign up/sign in
2. Create new Render account
3. New Web Service
4. Connect GitHub repo
5. Configure:
   - Build: `npm run build`
   - Start: `npm run start`
   - Environment variables
6. Click "Create Web Service"

### Deploy on Vercel

[Vercel](https://vercel.com)
1. Import GitHub repo
2. Configure project:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
3. Add environment variables
4. Deploy

For detailed deployment instructions, check:
- [Replit Docs](https://docs.replit.com/hosting/deployments/about-deployments)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
