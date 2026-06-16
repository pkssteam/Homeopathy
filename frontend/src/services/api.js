// Dynamic Service Gateway: backend REST API client with local localStorage fallback
const BASE_URL = 'http://localhost:8000/api';

const LOCAL_STORAGE_KEY = 'hms_db';
const defaultDb = {
  hospitals: [
    { id: 1, name: 'Homepathy Central Clinic', location: 'Downtown', status: 'Active', rooms: 12, phone: '+1 555-0199' },
    { id: 2, name: 'Healing Touch Dispensary', location: 'Northside', status: 'Active', rooms: 5, phone: '+1 555-0123' },
    { id: 3, name: 'Vitality Wellness Center', location: 'West End', status: 'Inactive', rooms: 8, phone: '+1 555-0145' }
  ],
  doctors: [
    { id: 1, name: 'Dr. Amit Patel', specialty: 'Chronic Care & Rheumatology', status: 'Active', phone: '+1 555-0101', email: 'doctor@homepathy.com', appointmentsToday: 8 },
    { id: 2, name: 'Dr. Sarah Collins', specialty: 'Pediatric Homeopathy', status: 'Active', phone: '+1 555-0102', email: 'sarah.c@homepathy.com', appointmentsToday: 6 },
    { id: 3, name: 'Dr. Rajesh Sharma', specialty: 'Dermatological Treatment', status: 'Active', phone: '+1 555-0103', email: 'rajesh.s@homepathy.com', appointmentsToday: 9 },
    { id: 4, name: 'Dr. Emily Watson', specialty: 'Gastroenterology & Constitutional Care', status: 'Active', phone: '+1 555-0104', email: 'emily.w@homepathy.com', appointmentsToday: 4 }
  ],
  patients: [
    { id: 1, name: 'Suresh Kumar', age: 34, gender: 'Male', phone: '+91 98765 43210', lastVisit: '2026-06-10', condition: 'Chronic Sinusitis' },
    { id: 2, name: 'Anita Sharma', age: 28, gender: 'Female', phone: '+91 98765 00112', lastVisit: '2026-06-12', condition: 'Eczema' },
    { id: 3, name: 'Rohan Verma', age: 45, gender: 'Male', phone: '+91 99887 76655', lastVisit: '2026-06-14', condition: 'Osteoarthritis' },
    { id: 4, name: 'Priya Patel', age: 9, gender: 'Female', phone: '+91 99112 23344', lastVisit: '2026-06-15', condition: 'Allergic Asthma' },
    { id: 5, name: 'Vikram Singh', age: 60, gender: 'Male', phone: '+91 88776 65544', lastVisit: '2026-06-15', condition: 'Insomnia' }
  ],
  appointments: [
    { id: 'APT-101', patientName: 'Anita Sharma', doctorName: 'Dr. Amit Patel', time: '10:00 AM', date: '2026-06-16', type: 'Consultation', status: 'In Queue' },
    { id: 'APT-102', patientName: 'Suresh Kumar', doctorName: 'Dr. Amit Patel', time: '10:30 AM', date: '2026-06-16', type: 'Follow-Up', status: 'Consulting' },
    { id: 'APT-103', patientName: 'Priya Patel', doctorName: 'Dr. Sarah Collins', time: '11:15 AM', date: '2026-06-16', type: 'Consultation', status: 'Scheduled' },
    { id: 'APT-104', patientName: 'Rohan Verma', doctorName: 'Dr. Rajesh Sharma', time: '11:45 AM', date: '2026-06-16', type: 'First Visit', status: 'Scheduled' },
    { id: 'APT-105', patientName: 'Vikram Singh', doctorName: 'Dr. Amit Patel', time: '02:00 PM', date: '2026-06-16', type: 'Consultation', status: 'Scheduled' }
  ],
  inventory: [
    { id: 'INV-001', name: 'Arnica Montana 200C', category: 'Dilutions', stock: 120, unit: 'Vials', price: 12.50, status: 'In Stock' },
    { id: 'INV-002', name: 'Nux Vomica 30C', category: 'Dilutions', stock: 15, unit: 'Vials', price: 10.00, status: 'Low Stock' },
    { id: 'INV-003', name: 'Belladonna 200C', category: 'Dilutions', stock: 85, unit: 'Vials', price: 11.20, status: 'In Stock' },
    { id: 'INV-004', name: 'Thuja Occidentalis 1M', category: 'Dilutions', stock: 3, unit: 'Vials', price: 15.00, status: 'Out of Stock' },
    { id: 'INV-005', name: 'Calendula Officinalis Ointment', category: 'Ointments', stock: 45, unit: 'Tubes', price: 8.50, status: 'In Stock' },
    { id: 'INV-006', name: 'Rhus Toxicodendron 30C', category: 'Dilutions', stock: 60, unit: 'Vials', price: 10.50, status: 'In Stock' }
  ],
  prescriptions: [
    { id: 'PR-201', patientName: 'Suresh Kumar', doctorName: 'Dr. Amit Patel', date: '2026-06-16', medicine: 'Arnica Montana 200C', dosage: '4 pills, 3 times a day', duration: '7 Days', status: 'Dispensed' },
    { id: 'PR-202', patientName: 'Anita Sharma', doctorName: 'Dr. Amit Patel', date: '2026-06-16', medicine: 'Nux Vomica 30C', dosage: '5 drops at bedtime', duration: '14 Days', status: 'Pending' },
    { id: 'PR-203', patientName: 'Rohan Verma', doctorName: 'Dr. Rajesh Sharma', date: '2026-06-14', medicine: 'Rhus Tox 30C', dosage: '4 pills, twice a day', duration: '10 Days', status: 'Dispensed' }
  ],
  billing: [
    { billNo: 'BIL-501', patientName: 'Suresh Kumar', date: '2026-06-16', total: 45.00, status: 'Paid', method: 'Cash' },
    { billNo: 'BIL-502', patientName: 'Anita Sharma', date: '2026-06-16', total: 35.00, status: 'Unpaid', method: '-' },
    { billNo: 'BIL-503', patientName: 'Rohan Verma', date: '2026-06-14', total: 60.50, status: 'Paid', method: 'Card' }
  ],
  notifications: [
    { id: 1, title: 'Low Stock Alert', message: 'Nux Vomica 30C has dropped below 20 vials.', time: '10 mins ago', type: 'warning' },
    { id: 2, title: 'New Appointment', message: 'Anita Sharma booked an appointment with Dr. Patel.', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Bill Paid', message: 'Bill BIL-503 of Rohan Verma has been cleared.', time: '2 hours ago', type: 'success' }
  ],
  followups: [
    { id: 'FU-801', name: 'Anita Sharma', condition: 'Eczema recovery', nextDate: '2026-06-23', status: 'Pending Call', phone: '+91 98765 00112', doctorName: 'Dr. Amit Patel' },
    { id: 'FU-802', name: 'Suresh Kumar', condition: 'Sinusitis follow-up', nextDate: '2026-06-25', status: 'Scheduled', phone: '+91 98765 43210', doctorName: 'Dr. Amit Patel' }
  ],
  reports: [
    { id: 'REP-701', title: 'Constitutional Treatment Analysis', date: '2026-06-10', doctorName: 'Dr. Amit Patel', status: 'Final' },
    { id: 'REP-652', title: 'Allergic Hypersensitivity Report', date: '2026-05-14', doctorName: 'Dr. Sarah Collins', status: 'Final' }
  ]
};

if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDb));
}

const getLocalData = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
const saveLocalData = (data) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

async function request(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    return null;
  }
}

export const api = {
  // Hospitals
  getHospitals: async () => {
    const data = await request('/hospitals/');
    if (data) return data;
    return getLocalData().hospitals;
  },
  createHospital: async (hospital) => {
    const data = await request('/hospitals/', {
      method: 'POST',
      body: JSON.stringify(hospital)
    });
    if (data) return data;
    
    const db = getLocalData();
    const newH = { id: db.hospitals.length + 1, ...hospital, status: 'Active' };
    db.hospitals.push(newH);
    saveLocalData(db);
    return newH;
  },

  // Doctors
  getDoctors: async () => {
    const data = await request('/doctors/');
    if (data) return data;
    return getLocalData().doctors;
  },
  createDoctor: async (doctor) => {
    const data = await request('/doctors/', {
      method: 'POST',
      body: JSON.stringify(doctor)
    });
    if (data) return data;

    const db = getLocalData();
    const newD = { id: db.doctors.length + 1, ...doctor, status: 'Active', appointmentsToday: 0 };
    db.doctors.push(newD);
    saveLocalData(db);
    return newD;
  },

  // Patients
  getPatients: async () => {
    const data = await request('/patients/');
    if (data) return data;
    return getLocalData().patients;
  },
  createPatient: async (patient) => {
    const data = await request('/patients/', {
      method: 'POST',
      body: JSON.stringify(patient)
    });
    if (data) return data;

    const db = getLocalData();
    const newP = { id: db.patients.length + 1, ...patient, lastVisit: new Date().toISOString().split('T')[0] };
    db.patients.push(newP);
    saveLocalData(db);
    return newP;
  },

  // Appointments
  getAppointments: async () => {
    const data = await request('/appointments/');
    if (data) return data;
    return getLocalData().appointments;
  },
  bookAppointment: async (appointment) => {
    const data = await request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
    if (data) return data;

    const db = getLocalData();
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      status: 'In Queue',
      ...appointment
    };
    db.appointments.push(newApt);
    saveLocalData(db);
    return newApt;
  },
  updateAppointmentStatus: async (id, status) => {
    const data = await request(`/appointments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data) return data;

    const db = getLocalData();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      saveLocalData(db);
    }
    return apt;
  },

  // Inventory
  getInventory: async () => {
    const data = await request('/inventory/');
    if (data) return data;
    return getLocalData().inventory;
  },
  updateStock: async (id, quantity) => {
    const data = await request(`/inventory/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ stock: quantity })
    });
    if (data) return data;

    const db = getLocalData();
    const item = db.inventory.find(i => i.id === id);
    if (item) {
      item.stock = quantity;
      if (item.stock === 0) item.status = 'Out of Stock';
      else if (item.stock < 20) item.status = 'Low Stock';
      else item.status = 'In Stock';
      saveLocalData(db);
    }
    return item;
  },

  // Prescriptions
  getPrescriptions: async () => {
    const data = await request('/prescriptions/');
    if (data) return data;
    return getLocalData().prescriptions;
  },
  createPrescription: async (prescription) => {
    const data = await request('/prescriptions/', {
      method: 'POST',
      body: JSON.stringify(prescription)
    });
    if (data) return data;

    const db = getLocalData();
    const newPr = {
      id: `PR-${Math.floor(200 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...prescription
    };
    db.prescriptions.push(newPr);
    saveLocalData(db);
    return newPr;
  },
  updatePrescriptionStatus: async (id, status) => {
    const data = await request(`/prescriptions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data) return data;

    const db = getLocalData();
    const pr = db.prescriptions.find(p => p.id === id);
    if (pr) {
      pr.status = status;
      saveLocalData(db);
    }
    return pr;
  },

  // Billing
  getBills: async () => {
    const data = await request('/billing/');
    if (data) return data;
    return getLocalData().billing;
  },
  createBill: async (bill) => {
    const data = await request('/billing/', {
      method: 'POST',
      body: JSON.stringify(bill)
    });
    if (data) return data;

    const db = getLocalData();
    const newBill = {
      billNo: `BIL-${Math.floor(500 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...bill
    };
    db.billing.push(newBill);
    saveLocalData(db);
    return newBill;
  },

  // Follow ups
  getFollowUps: async () => {
    const data = await request('/followups/');
    if (data) return data;
    return getLocalData().followups;
  },

  // Reports list
  getReports: async () => {
    const data = await request('/reports/');
    if (data) return data;
    return getLocalData().reports;
  },

  // Notifications
  getNotifications: async () => {
    const data = await request('/notifications/');
    if (data) return data;
    return getLocalData().notifications;
  }
};
