"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var axios = require('axios');

var data = JSON.stringify({
  idPitches: 1,
  date: "2025-07-26",
  startTime: "15:00",
  endTime: "16:00",
  status: "BOOKED"
});
var config = {
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
var config2 = {
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

var test = function test() {
  var req1, req2, _ref, _ref2, res1, res2;

  return regeneratorRuntime.async(function test$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          req1 = axios.request(config);
          req2 = axios.request(config2);
          _context.next = 5;
          return regeneratorRuntime.awrap(Promise.allSettled([req1, req2]));

        case 5:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          res1 = _ref2[0];
          res2 = _ref2[1];

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

          _context.next = 17;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error("Lỗi không mong muốn:", _context.t0);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}; // const test = async () =>{
//   const req1 = axios.request(config);
//   const req2 = axios.request(config2);
//   const res = await Promise.all([req1, req2]);
//   console.log(res[0].data);
//   console.log("=========================================");
//   console.log(res[1].data);
// }


test();