const axios = require('axios');

let data = JSON.stringify({
  idPitches: 1,
  date: "2025-07-26",
  startTime: "15:00",
  endTime: "16:00",
  status: "BOOKED"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:8099/api/orders',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImJAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWQiOjIsInN1YiI6IjIiLCJpYXQiOjE3NTMxNzU5NTIsImV4cCI6MTc1MzI2MjM1Mn0.B7mmk1H8ntA_B77NhwGfuf9fP-rffAtK2Y2cgiV964E', 
    'Cookie': 'Cookie_6=value'
  },
  data: data
};

let config2 = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:8099/api/orders',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWQiOjEsInN1YiI6IjEiLCJpYXQiOjE3NTMxNzYwMTUsImV4cCI6MTc1MzI2MjQxNX0.hd4CFA5R84yj0cUsmIZjHJnjSudo52HD2se0OVE0--M', 
    'Cookie': 'Cookie_6=value'
  },
  data: data
};

const test = async () => {
  try {
      const req1 = axios.request(config);
      const req2 = axios.request(config2);

      const [res1, res2] = await Promise.allSettled([req1, req2]);

      if (res1.status === 'fulfilled') {
          console.log(res1.value.data);
      } else {
          console.error(res1.reason);
      }

      console.log("=========================================");

      if (res2.status === 'fulfilled') {
          console.log(res2.value.data);
      } else {
          console.error(res2.reason);
      }
  } catch (err) {
      console.error("Lỗi không mong muốn:", err);
  }
};

// const test = async () =>{
//   const req1 = axios.request(config);
//   const req2 = axios.request(config2);
//   const res = await Promise.all([req1, req2]);
//   console.log(res[0].data);
//   console.log("=========================================");
//   console.log(res[1].data);
// }

test();
