# NeelState Client

This is the frontend client for the NeelState real estate application.

## Features

- User authentication with Firebase
- Property listings with image uploads
- Search and filter functionality
- Interactive maps with Mapbox integration
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the client directory with the following variables:

```env
# Firebase configuration (already configured)
# Add your Mapbox access token for map functionality
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

3. Get a Mapbox access token:
- Go to [Mapbox](https://account.mapbox.com/access-tokens/)
- Create an account or sign in
- Generate a new access token
- Add it to your `.env` file

4. Run the development server:
```bash
npm run dev
```

## Mapbox Integration

The application now includes Mapbox integration for displaying property locations on interactive maps. To use this feature:

1. Add your Mapbox access token to the `.env` file
2. When creating or updating listings, you can now add latitude and longitude coordinates
3. The listing detail page will display an interactive map showing the property location

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
