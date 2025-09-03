# Native\_BookStore

A cross-platform mobile bookstore app built with React Native (Expo), complete with a supporting backend to manage book listings, user accounts, and more.

---

## 📚 Features

* **User Authentication**: Sign up, login, and manage user sessions.
* **Book Catalog**: Browse books by categories, search, and apply filters.
* **Book Details**: View detailed information about each book, including title, author, description, cover image, and price.
* **Wishlist & Cart**: Add books to wishlist or shopping cart for future purchase.
* **Order Management**: Place orders and view order history.
* **User Profile**: Manage personal information and view past orders.
---

## ⚙️ Tech Stack

* **Frontend**: React Native (Expo)
* **Backend**: Node.js with Express.js
* **Database**: MongoDB
* **Authentication**: JWT (JSON Web Tokens)
* **State Management**: Zustand
* **UI Components**: React Navigation, React Nativewind ,LinearGradient

---

## 🖼️ Preview

![WhatsApp Image 2025-09-03 at 18 49 26_3871f38d](https://github.com/user-attachments/assets/ae03d647-cabd-4541-b673-f18a60f319f0)

![WhatsApp Image 2025-09-03 at 18 49 26_119adc46](https://github.com/user-attachments/assets/67a9cd2d-aee0-4331-ac0d-27ce44d7a6aa)

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v14 or higher)
* Expo CLI (`npm install -g expo-cli`)
* MongoDB Atlas account (for cloud database) or local MongoDB setup

### Installation

1. Clone the repository:([GitHub][5])

   ```bash
   git clone https://github.com/Zaidshaikh2811/Native_BookStore.git
   cd Native_BookStore
   ```



2. Install frontend dependencies:

   ```bash
   cd mobile
   npm install
   ```



3. Install backend dependencies:

   ```bash
   cd ../backend
   npm install
   ```



### Configuration

1. Create a `.env` file in the `backend` directory and add the following:

   ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    NODE_ENV=development
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    JWT_EXPIRES_IN=your_jwt_expiration_time
    CLOUDINARY_CLOUD_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    API_URL=your_backend_url
    EMAIL_USER=your_email
    EMAIL_PASS=your_email_password
    EMAIL_HOST=your_email_host
    EMAIL_PORT=your_email_port

   ```



*Replace `your_mongodb_connection_string` with your MongoDB URI and `your_jwt_secret_key` with a secret key for JWT.*

2. (Optional) Set up Firebase or another service for social authentication if implemented.

### Running the App

1. Start the backend server:([GitHub][2])

   ```bash
   cd backend
   npm start
   ```



2. Start the frontend app:

   ```bash
   cd mobile
   expo start
   ```



*Scan the QR code with the Expo Go app on your mobile device to run the app.*

---

## 🗂️ Project Structure

```
Native_BookStore/
├── backend/                 # Backend server (Node.js + Express)
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Middleware functions
│   └── server.js            # Entry point
└── mobile/                  # Frontend app (React Native)
    ├── assets/              # Images and fonts
    ├── components/          # Reusable components
    ├── navigation/          # React Navigation setup
    ├── screens/             # App screens
    └── App.js               # Entry point
```



---

## 🧪 Usage

* **Authentication**: Users can register and log in using their email and password.
* **Browsing**: Navigate through categories and apply filters to find books.
* **Wishlist & Cart**: Add books to your wishlist or cart for future purchase.
* **Orders**: Place orders and view order history in your profile.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-name`).
6. Create a new Pull Request.

---

## 📞 Contact

* **GitHub**: [@Zaidshaikh2811](https://github.com/Zaidshaikh2811)
* **Email**: [zaidshaikh2811@gmail.com](mailto:zaidshaikh2811@gmail.com)

---
