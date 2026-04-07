# NeuralVision Engine - Interactive Computer Vision Platform

NeuralVision Engine is an interactive syllabus-based computer vision educational tool. It allows users to upload images and apply various core computer vision algorithms in real-time, adjusting parameters dynamically to visually learn how the algorithms work.

## Features

The platform is structured into modular computer vision topics, currently supporting:

* **Color Space Representation**: Discover how images look in HSV, LAB, and YCrCb color spaces.
* **Fourier Analysis**: Visualize magnitude spectrums and apply High Pass Filtering via Discrete Fourier Transform.
* **Noise Reduction Methods**: Simulate noise injection (Gaussian, Salt & Pepper) and clean it up using Gaussian, Median, and Bilateral filtering.
* **Edge Detection**: Isolate image edges using Canny, Laplacian of Gaussian (LoG), and Difference of Gaussians (DoG).
* **Harris Corner Detection**: Detect significant points and visualize corner responses with dynamic thresholds.
* **Feature Descriptors (ORB)**: Detect and visualize keypoints in the image using the ORB algorithm.

## Tech Stack

* **Frontend**: React, Vite, Axios, Lucide-React
* **Backend**: Python, FastAPI, Uvicorn
* **Computer Vision**: OpenCV (cv2), NumPy

## Project Structure

* `/frontend`: Contains the React web application built with Vite.
* `/backend`: Contains the FastAPI server handling the core computer vision processing pipeline via OpenCV.

## Getting Started

### Prerequisites
* Node.js and npm (for the frontend)
* Python 3.8+ (for the backend)

### 1. Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment (the project includes a `venv`):
   ```bash
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. (Optional) If dependencies are missing, install them:
   ```bash
   pip install fastapi uvicorn opencv-python numpy python-multipart
   ```
4. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   The backend API will be available at `http://localhost:8000`.

### 2. Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (typically `http://localhost:5173`).

## Usage
1. Open the web interface.
2. Upload a test image through the sidebar.
3. Select a computer vision topic from the dropdown syllabus module.
4. Tweak algorithm parameters dynamically to observe the real-time changes in the Visualization Board on the right.
