# Native RealEstate

A full-stack real estate mobile application built with React Native. This application allows users to browse property listings, view property details, and save their favorite properties. It features a clean and modern user interface and is built with a focus on performance and user experience.

## Features

  * **User Authentication:** Secure user sign-in using Google Authentication.
  * **Home Page:** Displays the latest and recommended properties with powerful search and filter functionality.
  * **Explore Page:** Allows users to browse all types of properties with a clean and intuitive interface.
  * **Property Details Page:** Provides comprehensive information about individual properties, including images and key details.
  * **Profile Page:** Customizable user settings and profile management.
  * **Saved Properties:** Users can save their favorite properties to view later.
  * **Dynamic Routing:** Seamless navigation between screens.
  * **Clean Code and Scalable Architecture:** Built with modern tools and best practices for a maintainable and scalable application.

## Tech Stack

  * **Frontend:** React Native, Expo
  * **Backend:** Appwrite / Firebase
  * **Styling:** Tailwind CSS
  * **Language:** TypeScript, JavaScript

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js
  * npm
  * Expo CLI

### Installation

1.  Clone the repo

    ```sh
    git clone https://github.com/Zaidshaikh2811/Native_RealEstate.git
    ```

2.  Install NPM packages

    ```sh
    npm install
    ```

3.  Set up your environment variables. Create a `.env` file in the root of the project and add the following:

    ```
    # Add your Appwrite/Firebase credentials here
    ```

### Running the Application

1.  Start the Expo development server
    ```sh
    npx expo start
    ```
2.  Follow the instructions in the terminal to run the app on an Android emulator, iOS simulator, or on your physical device using the Expo Go app.

## Project Structure

```
.
├── app                 # Main application code
│   ├── (tabs)          # Tab navigation setup
│   ├── (modals)        # Modal screens
│   └── index.tsx       # Entry point
├── components          # Reusable components
├── assets              # Images, fonts, and other assets
├── lib                 # Helper functions and utilities
├── app.json            # Expo configuration
└── package.json        # Project dependencies
```

## Screenshots

*Add screenshots of your application here.*

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
