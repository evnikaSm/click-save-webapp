# Click & Save

> A lightweight notes web app for saving, managing, and organizing your ideas — with Google Authentication, Supabase integration, and a Chrome Extension.

**Click & Save** is a full-featured notes application built with **HTML, CSS, and vanilla JavaScript**.
The project combines a responsive web interface with authentication, cloud data storage, CRUD operations, and a Chrome Extension that makes saving notes quick and convenient.

The project was created as a hands-on practice of modern web development concepts, including **authentication, database integration, API communication, responsive UI, and browser extension development**.

---

## 🚀 Features

* 🔐 **Google OAuth Authentication** — secure sign-in with Google
* 🗑️ **Delete notes** — remove notes you no longer need
* ☁️ **Supabase Database** — store and manage notes in the cloud
* 🔄 **CRUD Operations** — complete Create, Read, Update, Delete functionality
* 🧩 **Chrome Extension Integration** — save content directly from the browser
* 📱 **Responsive Design** — comfortable experience across different screen sizes
* 🎨 **Clean UI** — simple interface focused on usability
* 🔌 **API Integration** — communication between the frontend and external services

---

## 🛠️ Tech Stack

| Technology               | Purpose                             |
| ------------------------ | ----------------------------------- |
| **HTML5**                | Application structure               |
| **CSS3**                 | Styling and responsive layout       |
| **JavaScript**           | Application logic and interactivity |
| **Supabase**             | Database and authentication         |
| **Google OAuth**         | User authentication                 |
| **Chrome Extension API** | Browser integration                 |

---

## 📂 Project Structure

```text
click-save-webapp/
│
├── index.html              # Main application page
├── style.css               # Application styles
├── app.js                  # Main application logic
│
└── my-notes-extension/    # Chrome Extension
    └── ...
```

---

## 🔐 Authentication

The application uses **Google OAuth** for user authentication.

Users can sign in with their Google account and access their personal notes. Authentication is handled through Supabase, allowing the application to connect users with their stored data securely.

---

## ☁️ Database

**Supabase** is used as the backend database for storing notes.

The application demonstrates the complete CRUD workflow:

```text
Create  →  Add a new note
Read    →  Load saved notes
Update  →  Edit an existing note
Delete  →  Remove a note
```

Each user's notes are associated with their authenticated account.

---

## 🧩 Chrome Extension

One of the main features of the project is its **Chrome Extension integration**.

The extension is designed to make saving information from the browser more convenient, allowing users to capture content without manually switching to the web application.

This part of the project provided practical experience with:

* Chrome Extension structure
* Browser APIs
* Communication between the extension and web application
* Handling user interactions inside the browser
* Integrating a browser extension with an external web service

---

## 🧩 Installing the Chrome Extension

To install the extension locally in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `my-notes-extension` directory
5. The extension will appear in your Chrome extensions list

You can then use the extension to interact with the Click & Save application directly from the browser.

---

## 📚 What I Practiced

This project was built to gain practical experience with:

### Frontend Development

* Semantic HTML
* CSS layouts
* Responsive design
* DOM manipulation
* Event handling
* Client-side application logic

### Authentication

* OAuth 2.0 concepts
* Google authentication
* User sessions
* Authentication state management

### Backend & Database

* Supabase
* Database queries
* CRUD operations
* User-specific data
* API integration

### Browser Extensions

* Chrome Extension architecture
* Browser APIs
* Extension-to-web-app integration
* Working with browser permissions

### Software Development

* Organizing a small web application
* Connecting multiple services
* Debugging frontend/backend interactions
* Building a complete feature from UI to database

---

## 🔮 Possible Improvements

Some features that could be added in the future:

* 🔎 Search and filter notes
* 🔮 edit notes
* 🏷️ Tags and categories
* 📌 Pin important notes
* 🌙 Dark mode
* 📤 Export notes
* 📱 Improved mobile experience
  
---

## 📸 Screenshots ( //to do )

```md
![Main page](screenshots/main-page.png)
![Notes](screenshots/notes.png)
![Chrome Extension](screenshots/extension.png)
```

---
