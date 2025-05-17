

const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

const chaiHttp = require('chai-http');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);
  suite('Integration tests with chai-http', function () {
    // #1
    test('Test GET /hello with no name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello Guest');
          done();
        })
    });
    // #2
    test('Test GET /hello with your name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello?name=Sam')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello Sam');
          done();
        });
    });
    // #3
    test('Send {surname: "Colombo"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({surname: "Colombo" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Cristoforo'); 
          assert.equal(res.body.surname, 'Colombo');
          done();
        });
    });
    // #4
    test('Send {surname: "da Verrazzano"}', function (done) {
      chai
        .request(server)
        .put('/travellers')
        .send({surname: "da Verrazzano"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Giovanni');
          assert.equal(res.body.surname, 'da Verrazzano');
          done();
        })
    });
  });
});

const Browser = require('zombie');
// Browser.localhost('localhost', 3000, server);

Browser.site = 'http://localhost:3000'; 
// Browser.localhost('localhost', 3001, server);  

// Get the port your server is configured to use
// const port = process.env.PORT || 3000;
// Browser.localhost('localhost', port, server);
// Browser.site = `http://localhost:${port}`;  
// let browser;
// let listener;
// let port;

// // Start the server before tests
// suiteSetup((done) => {
//   Browser.site = 'http://localhost:3000';
//   done();
// });

// Close the server after tests
// suiteTeardown((done) => {
//   listener.close(done);
// });


suite('Functional Tests with Zombie.js', function () {
  this.timeout(5000);

  // setup(function () {
  //   browser = new Browser();
  // });
  const browser = new Browser()

  suite('Headless browser', function () {
    test('should have a working "site" property', function() {
      assert.isNotNull(browser.site);
    });
  });

  suite('"Famous Italian Explorers" form', function () {
    // #5
    test('Submit the surname "Colombo" in the HTML form', function (done) {
      browser.visit('/', function () {
        browser.wait().then(() => {
          browser
            .fill('surname', 'Colombo')
            .pressButton('submit', function () {
              browser.assert.success();
              browser.assert.text('span#name', 'Cristoforo');
              browser.assert.text('span#surname', 'Colombo');
              browser.assert.element('span#dates', 1);
              done();
            });
          });
        });
        // done();
      });

      // #6
    test('Submit the surname "Vespucci" in the HTML form', function (done) {
      browser.visit('/', function () {
        browser.wait().then(() => {
          browser
            .fill('surname', 'Vespucci')
            .then(() => {
              browser.pressButton('submit', function () {
                browser.assert.success();
                browser.assert.text('span#name', 'Amerigo');
                browser.assert.text('span#surname', 'Vespucci');
                browser.assert.element('span#dates', 1);
              });
            });
        });
         done();
      });
    });
  });
});