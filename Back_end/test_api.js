const axios = require('axios');

async function testApi() {
  const BASE_URL = 'http://localhost:3000';

  try {
    console.log('=== GET /health ===');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(health.data);

    console.log('\n=== POST /api/auth/login ===');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@cuidabem.com.br',
      password: 'Admin@123456'
    });
    console.log(login.data);
    const token = login.data.data.token;

    if (!token) throw new Error('Token not found');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    console.log('\n=== GET /api/auth/me ===');
    const me = await axios.get(`${BASE_URL}/api/auth/me`, config);
    console.log(me.data);

    console.log('\n=== GET /api/patients/current ===');
    const currentPatient = await axios.get(`${BASE_URL}/api/patients/current`, config);
    console.log(currentPatient.data);

    const patientId = currentPatient.data.data.id;

    console.log('\n=== GET /api/guides ===');
    const guides = await axios.get(`${BASE_URL}/api/guides`, config);
    console.log(`Loaded ${guides.data.data.length} guides.`);

    console.log('\n=== GET /api/tutorial-videos ===');
    const videos = await axios.get(`${BASE_URL}/api/tutorial-videos`, config);
    console.log(`Loaded ${videos.data.data.length} videos.`);

    console.log('\n=== GET /api/exercises ===');
    const exercises = await axios.get(`${BASE_URL}/api/exercises`, config);
    console.log(`Loaded ${exercises.data.data.length} exercises.`);

    console.log('\n=== GET /api/emergency-contacts ===');
    const emergencies = await axios.get(`${BASE_URL}/api/emergency-contacts`, config);
    console.log(`Loaded ${emergencies.data.data.length} emergency contacts.`);

    console.log(`\n=== GET /api/support-contacts?patientId=${patientId} ===`);
    const supports = await axios.get(`${BASE_URL}/api/support-contacts?patientId=${patientId}`, config);
    console.log(`Loaded ${supports.data.data.length} support contacts.`);

    console.log(`\n=== GET /api/tasks?patientId=${patientId} ===`);
    const tasks = await axios.get(`${BASE_URL}/api/tasks?patientId=${patientId}`, config);
    console.log(`Loaded ${tasks.data.data.length} tasks.`);

    console.log(`\n=== GET /api/activity-logs?patientId=${patientId} ===`);
    const logs = await axios.get(`${BASE_URL}/api/activity-logs?patientId=${patientId}`, config);
    console.log(`Loaded ${logs.data.data.length} activity logs.`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testApi();
