# API Deployment Guide

## Deploying Backend API to Render

### Prerequisites
- Render account
- MongoDB database (MongoDB Atlas recommended)
- Stripe account (for payments)
- Environment variables ready

### Steps

1. **Connect your repository to Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the deployment**
   - **Name**: `neelstate-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `api` (if your API is in a subdirectory)

3. **Set Environment Variables**
   Add these environment variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or let Render assign automatically)
   - `MONGODB_URL`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your API

### Environment Variables Setup

#### MongoDB URL
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/neelstate?retryWrites=true&w=majority
```

#### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Stripe Secret Key
Get this from your Stripe Dashboard under Developers → API Keys

### API Endpoints

Your API will be available at:
- `https://your-api-name.onrender.com`

Key endpoints:
- `GET /api/listing/get` - Get listings
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/payment/create-payment-intent` - Create payment
- `GET /api/user/:id` - Get user details

### Troubleshooting

1. **Build fails**: Check if all dependencies are in package.json
2. **Database connection fails**: Verify MongoDB URL and network access
3. **Environment variables**: Ensure all required vars are set in Render
4. **Port issues**: Let Render assign the port automatically

### Testing the API

Once deployed, test your API:
```bash
curl https://your-api-name.onrender.com/api/listing/get
```

### Update Frontend

After deploying the API, update your frontend's `VITE_API_URL` environment variable to point to your new API URL. 