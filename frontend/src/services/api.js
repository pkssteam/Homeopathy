const BASE_URL = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hms_access_token');
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token has expired, logout and clear session
    localStorage.removeItem('hms_access_token');
    localStorage.removeItem('hms_refresh_token');
    localStorage.removeItem('hms_session');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Collect specific field errors if present
    let errorMsg = errorData.detail || errorData.message || 'API request failed';
    if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
      errorMsg = Object.entries(errorData)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join(' | ');
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Store tokens and session locally
    localStorage.setItem('hms_access_token', data.access);
    localStorage.setItem('hms_refresh_token', data.refresh);
    localStorage.setItem('hms_session', JSON.stringify(data.user));
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('hms_access_token');
    localStorage.removeItem('hms_refresh_token');
    localStorage.removeItem('hms_session');
    // Clear session skipped profile flags so next login prompts it
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('profile_skipped_')) {
        sessionStorage.removeItem(key);
      }
    });
  },

  // Hospitals
  getHospitals: async () => {
    return await request('/hospitals/');
  },

  createHospital: async (hospitalData) => {
    return await request('/hospitals/', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
  },

  updateHospital: async (id, hospitalData) => {
    return await request(`/hospitals/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(hospitalData),
    });
  },

  patchHospital: async (id, hospitalData) => {
    return await request(`/hospitals/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(hospitalData),
    });
  },

  deleteHospital: async (id) => {
    return await request(`/hospitals/${id}/`, {
      method: 'DELETE',
    });
  },

  deleteAllHospitals: async () => {
    return await request('/hospitals/delete_all/', {
      method: 'DELETE',
    });
  },

  // Users Management
  getUsers: async (role = '') => {
    const query = role ? `?role=${role}` : '';
    return await request(`/users/${query}`);
  },

  createUser: async (userData) => {
    return await request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return await request(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return await request('/users/me/');
  },

  updateCurrentUser: async (userData) => {
    return await request('/users/me/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteAllUsers: async (role = '') => {
    const query = role ? `?role=${role}` : '';
    return await request(`/users/delete_all/${query}`, {
      method: 'DELETE',
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return await request('/users/change_password/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
  },

  activateUser: async (id) => {
    return await request(`/users/${id}/activate/`, {
      method: 'POST',
    });
  },

  deactivateUser: async (id) => {
    return await request(`/users/${id}/deactivate/`, {
      method: 'POST',
    });
  },

  deleteUser: async (id) => {
    return await request(`/users/${id}/`, {
      method: 'DELETE',
    });
  },

  // Appointments Management
  getAppointments: async (params = {}) => {
    let query = '';
    const searchParams = new URLSearchParams();
    if (params.date) searchParams.append('date', params.date);
    if (params.status) searchParams.append('status', params.status);
    const queryString = searchParams.toString();
    if (queryString) query = `?${queryString}`;
    return await request(`/appointments/${query}`);
  },

  createAppointment: async (apptData) => {
    return await request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(apptData),
    });
  },

  updateAppointment: async (id, apptData) => {
    return await request(`/appointments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(apptData),
    });
  },

  approveAppointment: async (id) => {
    return await request(`/appointments/${id}/approve/`, {
      method: 'POST',
    });
  },

  cancelAppointment: async (id) => {
    return await request(`/appointments/${id}/cancel/`, {
      method: 'POST',
    });
  },

  deleteAppointment: async (id) => {
    return await request(`/appointments/${id}/`, {
      method: 'DELETE',
    });
  },

  deleteAllAppointments: async () => {
    return await request('/appointments/delete_all/', {
      method: 'DELETE',
    });
  },

  // Queue Management
  getQueue: async (params = {}) => {
    let query = '';
    const searchParams = new URLSearchParams();
    if (params.date) searchParams.append('date', params.date);
    if (params.status) searchParams.append('status', params.status);
    if (params.doctor_id) searchParams.append('doctor_id', params.doctor_id);
    const queryString = searchParams.toString();
    if (queryString) query = `?${queryString}`;
    return await request(`/queue/${queryString ? '?' + queryString : ''}`);
  },

  callPatient: async (id) => {
    return await request(`/queue/${id}/call/`, {
      method: 'POST',
    });
  },

  startConsultation: async (id) => {
    return await request(`/queue/${id}/start_consultation/`, {
      method: 'POST',
    });
  },

  completeQueue: async (id) => {
    return await request(`/queue/${id}/complete/`, {
      method: 'POST',
    });
  },

  deleteQueue: async (id) => {
    return await request(`/queue/${id}/`, {
      method: 'DELETE',
    });
  },

  updateQueue: async (id, queueData) => {
    return await request(`/queue/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(queueData),
    });
  },

  deleteAllQueue: async () => {
    return await request('/queue/delete_all/', {
      method: 'DELETE',
    });
  },

  // ─── Doctor Profile ───────────────────────────────────────────────────────
  getDoctors: async () => {
    return await request('/doctors/');
  },

  getDoctorProfile: async () => {
    return await request('/doctors/me/');
  },

  completeDoctorProfile: async (profileData) => {
    return await request('/doctors/complete_profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  setDoctorConsultationFee: async (doctorProfileId, fee) => {
    return await request(`/doctors/${doctorProfileId}/set_fee/`, {
      method: 'POST',
      body: JSON.stringify({ consultation_fee: fee }),
    });
  },

  // ─── Patient Profile ──────────────────────────────────────────────────────
  getPatients: async () => {
    return await request('/patients/');
  },

  getPatientProfile: async () => {
    return await request('/patients/me/');
  },

  completePatientProfile: async (profileData) => {
    return await request('/patients/complete_profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // ─── Inventory Management ───
  getInventory: async () => {
    return await request('/inventory/');
  },

  createInventoryItem: async (itemData) => {
    const isFormData = itemData instanceof FormData;
    return await request('/inventory/', {
      method: 'POST',
      body: isFormData ? itemData : JSON.stringify(itemData),
    });
  },

  updateInventoryItem: async (id, itemData) => {
    const isFormData = itemData instanceof FormData;
    return await request(`/inventory/${id}/`, {
      method: isFormData ? 'PATCH' : 'PUT',
      body: isFormData ? itemData : JSON.stringify(itemData),
    });
  },

  updateStock: async (id, stock) => {
    return await request(`/inventory/${id}/adjust_stock/`, {
      method: 'POST',
      body: JSON.stringify({ stock }),
    });
  },

  deleteInventoryItem: async (id) => {
    return await request(`/inventory/${id}/`, {
      method: 'DELETE',
    });
  },

  deleteAllInventory: async () => {
    return await request('/inventory/delete_all/', {
      method: 'DELETE',
    });
  },

  // ─── Consultation & Prescriptions ───
  getPrescriptions: async () => {
    return await request('/prescriptions/');
  },

  updatePrescriptionStatus: async (id, status) => {
    return await request(`/prescriptions/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  deleteAllPrescriptions: async () => {
    return await request('/prescriptions/delete_all/', {
      method: 'DELETE',
    });
  },

  getConsultations: async (params = {}) => {
    let query = '';
    const searchParams = new URLSearchParams();
    if (params.patient_id) searchParams.append('patient_id', params.patient_id);
    if (params.doctor_id) searchParams.append('doctor_id', params.doctor_id);
    if (params.appointment_id) searchParams.append('appointment_id', params.appointment_id);
    const queryString = searchParams.toString();
    if (queryString) query = `?${queryString}`;
    return await request(`/consultations/${query}`);
  },

  createConsultation: async (consultationData) => {
    return await request('/consultations/', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  },

  uploadConsultationReport: async (consultationId, formData) => {
    return await request(`/consultations/${consultationId}/upload_report/`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteConsultation: async (id) => {
    return await request(`/consultations/${id}/`, {
      method: 'DELETE',
    });
  },

  deleteAllConsultations: async () => {
    return await request('/consultations/delete_all/', {
      method: 'DELETE',
    });
  },
};
