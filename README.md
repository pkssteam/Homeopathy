# Homepathy Hospital Management System (HMS)

This project is structured into separate, corporate-level frontend and backend directories.

---

## 📁 Workspace Directory Structure

*   **`frontend/`**: The React + Vite + Tailwind CSS client application.
*   **`backend/`**: The Django REST Framework application handling authentication, clinics, appointments, inventory, and billing.

---

## 🚀 How to Run the Project

### 1. Running the Frontend Client

Ensure that any previous Vite server running in the root folder is stopped. You must run the frontend server from within the `frontend/` directory so that dependencies and relative paths resolve correctly.

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies if they are missing
npm install

# Start the Vite HMR development server
npm run dev
```

The frontend will run at `http://localhost:5173/`.

### 2. Running the Django Backend

```bash
# Navigate to the backend folder
cd backend

# (Optional) Create and activate a Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django local development server
python manage.py runserver
```

The API endpoints will be accessible at `http://localhost:8000/api/`.
