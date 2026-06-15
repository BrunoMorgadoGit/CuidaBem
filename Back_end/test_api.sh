#!/bin/bash
BASE_URL="http://localhost:3000"

echo "=== GET /health ==="
curl -s $BASE_URL/health | jq

echo -e "\n=== POST /api/auth/login ==="
LOGIN_RES=$(curl -s -X POST $BASE_URL/api/auth/login -H "Content-Type: application/json" -d '{"email": "admin@cuidabem.com.br", "password": "Admin@123456"}')
echo $LOGIN_RES | jq
TOKEN=$(echo $LOGIN_RES | jq -r .data.accessToken)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Falha ao obter token!"
  exit 1
fi

echo -e "\n=== GET /api/auth/me ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/auth/me | jq

echo -e "\n=== GET /api/patients/current ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/patients/current | jq

echo -e "\n=== GET /api/guides ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/guides | jq

echo -e "\n=== GET /api/tutorial-videos ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/tutorial-videos | jq

echo -e "\n=== GET /api/exercises ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/exercises | jq

echo -e "\n=== GET /api/emergency-contacts ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/emergency-contacts | jq

echo -e "\n=== GET /api/support-contacts ==="
# Need a patientId for support contacts usually, but let's see if the endpoint supports list all or requires query params
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/support-contacts | jq

echo -e "\n=== GET /api/tasks ==="
# Tasks might require patientId query param as well
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/tasks | jq

echo -e "\n=== GET /api/activity-logs ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/activity-logs | jq

