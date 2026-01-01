# Robostreaks Club Website

The official website for the **Robostreaks** team. This full-stack web application serves as the central hub for club activities, member management, and event showcases.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Live Demo

Check out the live version here: **[https://club-website-gold.vercel.app](https://club-website-gold.vercel.app)**

## 🛠 Tech Stack

The project is built using a modern JavaScript/TypeScript stack:

* **Frontend**: TypeScript (83%), HTML, CSS (Client-side logic located in `/client`)
* **Backend**: Node.js, Express.js (Entry point: `server.js`)
* **Templating**: EJS (Embedded JavaScript templates in `/views`)
* **Database**: MongoDB (Inferred from `/models` and `seed.js`)
* **Deployment**: Vercel (`vercel.json` configured)

## 📂 Project Structure

```bash
├── api/            # Serverless functions / API endpoints
├── client/         # Frontend source code (TypeScript)
├── config/         # Configuration files (DB, Environment)
├── middleware/     # Custom Express middleware
├── models/         # Database models (Mongoose schemas)
├── routes/         # API and view routes
├── views/          # EJS server-side templates
├── server.js       # Main backend entry point
├── seed.js         # Script to seed the database with initial data
└── createSuper.js  # Script to create a superuser/admin
