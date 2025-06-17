# Branding Services Landing Page

A modern landing page for branding services with backend integration using Node.js and SQLite.

## Features

- Responsive design for all devices
- Contact form with backend integration
- SQLite database for storing contact information
- Carousel for showcasing services
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. Open `index.html` in your browser or serve it using a local server

## API Endpoints

- `POST /api/contact` - Submit contact form
  - Required fields: name, email
  - Optional fields: phone, message

- `GET /api/contacts` - Retrieve all contact submissions
  - Returns all submissions ordered by creation date

## Database

The application uses SQLite for data storage. The database file (`branding.db`) will be created automatically when you first run the server.

## Project Structure

- `index.html` - Main landing page
- `style.css` - Stylesheet
- `script.js` - Frontend JavaScript
- `server.js` - Backend server
- `package.json` - Project configuration and dependencies
- `branding.db` - SQLite database (created automatically) 