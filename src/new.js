const axios = require('axios');
let data = JSON.stringify({
  "idPitches": 1,
  "date": "2025-07-25",
  "startTime": "20:00",
  "endTime": "21:00",
  "status": "BOOKED"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:8099/api/booking',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiZW1haWwiOiJiQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsInN1YiI6IjIiLCJpYXQiOjE3NTMwNzkzNDQsImV4cCI6MTc1MzE2NTc0NH0.54_U7sFree0G40TB2qK9F3vOj0NdFQRNbJARgcLtcgk', 
    'Cookie': 'Cookie_6=value'
  },
  data : data
};

let config2 = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:8099/api/booking',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJhQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsInN1YiI6IjEiLCJpYXQiOjE3NTMwNzkzNjMsImV4cCI6MTc1MzE2NTc2M30.ezyfdBHSXvDmbhK7bpG_ZCvat2g2qGKjIJ-tavPz4c4', 
      'Cookie': 'Cookie_6=value'
    },
    data : data
  };

const test = async () =>{
    const req1 = axios.request(config);
    const req2 = axios.request(config2);
    const res = await Promise.all([req1, req2]);
    console.log(res[0].data);
    console.log("=========================================");
    console.log(res[1].data);
}

test();
