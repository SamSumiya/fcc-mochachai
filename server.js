'use strict'
const express = require('express');
const app = express();

const cors = require('cors');
const runner = require('./test-runner');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

console.log('✅ server.js loaded');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
})

app.use(express.static(__dirname + '/public'));

app.get('/hello', function (req, res) {
  const name = req.query.name || 'Guest';
  res.type('txt').send('hello ' + name);
})

// const travellers = function (req, res) {
//   let data = {};
//   if (req.body && req.body.surname) {
//     switch (req.body.surname.toLowerCase()) {
//       case 'polo':
//         data = {
//           name: 'Marco',
//           surname: 'Polo',
//           dates: '1254 - 1324'
//         };
//         break;
//       case 'colombo':
//         data = {
//           name: 'Cristoforo',
//           surname: 'Colombo',
//           dates: '1451 - 1506'
//         };
//         break;
//       case 'vespucci':
//         data = {
//           name: 'Amerigo',
//           surname: 'Vespucci',
//           dates: '1454 - 1512'
//         };
//         break;
//       case 'da verrazzano':
//       case 'verrazzano':
//         data = {
//           name: 'Giovanni',
//           surname: 'da Verrazzano',
//           dates: '1485 - 1528'
//         };
//         break;
//       default:
//         data = {
//           name: 'unknown'
//         }
//     }
//   }
//   res.json(data);
// };

const travellers = (req, res) => {
  let data = { name: 'unknown', surname: '', dates: '' };

  if (req.body && req.body.surname) {
    switch (req.body.surname.toLowerCase()) {
      case 'polo':         data = { name: 'Marco',      surname: 'Polo',         dates: '1254 - 1324' }; break;
      case 'colombo':      data = { name: 'Cristoforo', surname: 'Colombo',      dates: '1451 - 1506' }; break;
      case 'vespucci':     data = { name: 'Amerigo',    surname: 'Vespucci',     dates: '1454 - 1512' }; break;
      case 'da verrazzano':
      case 'verrazzano':   data = { name: 'Giovanni',   surname: 'da Verrazzano', dates: '1485 - 1528' }; break;
    }
  }

  // If the form posted, send HTML Zombie can assert on.
  if (req.method === 'POST') {
    return res.send(`
      <p>first name:<span id="name">${data.name}</span></p>
      <p>last name:<span id="surname">${data.surname}</span></p>
      <p>dates:<span id="dates">${data.dates}</span></p>
    `);
  }

  // Otherwise (PUT), keep returning JSON for the chai-http tests.
  res.json(data);
};

app.route('/travellers')
  .post(travellers) 
  .put(travellers);

let error;
app.get('/_api/get-tests', cors(), function (req, res, next) {
  if (error)
    return res.json({ status: 'unavailable' });
  next();
},
  function (req, res, next) {
    if (!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  },
  function (req, res) {
    runner.on('done', function (report) {
      process.nextTick(() => res.json(testFilter(runner.report, req.query.type, req.query.n)));
    });
  });



// app.listen(port, function () {
//   console.log("Listening on port " + port);
//   console.log('Running Tests...');
//   setTimeout(function () {
//     try {
//       runner.run();
//     } catch (e) {
//       error = e;
//       console.log('Tests are not valid:');
//       console.log(error);
//     }
//   }, 1500);
// });






if (require.main === module) {
  const port = process.env.PORT || 3000;
  console.log('🚀 app.listen() called');
  app.listen(port,  () => {
    console.log("Listening on port " + port);
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  });
}
console.log('🤖 server.js loaded');
module.exports = app; // for testing

function testFilter(tests, type, n) {
  let out;
  switch (type) {
    case 'unit':
      out = tests.filter(t => t.context.match('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(t => t.context.match('Functional Tests'));
      break;
    default:
      out = tests;
  }
  if (n !== undefined) {
    return out[n] || out;
  }
  return out;
}
