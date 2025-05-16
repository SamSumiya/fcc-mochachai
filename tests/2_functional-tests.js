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
      .send({ surname: 'da Verrazzano' })
      /** place your tests inside the callback **/
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200');
        assert.equal(res.type, 'application/json', 'Response should be json');
        assert.equal(res.body.name, 'Giovanni');
        assert.equal(res.body.surname, 'da Verrazzano');

        done();
      });
    });
  });
});

const Browser = require('zombie');
Browser.site = 'http://localhost:3000'; 
Browser.localhost('localhost', 3000, server);  

// Get the port your server is configured to use
// const port = process.env.PORT || 3000;
// Browser.localhost('localhost', port, server);
// Browser.site = `http://localhost:${port}`;  


suite('Functional Tests with Zombie.js', function () {
  this.timeout(5000);

  const browser = new Browser();

  suite('Headless browser', function () {
    test('should have a working "site" property', function() {
      assert.isNotNull(browser.site);
    });
  });

  suite('"Famous Italian Explorers" form', function () {
    // #5
    test('Submit the surname "Colombo" in the HTML form', function (done) {
    
      browser.visit('/', function () {
        console.log("--- Page visited. HTML loaded by Zombie.js (Colombo test) ---");
        console.log(browser.html()); // <--- Add this line
        console.log("----------------------------------------------");
        browser
          .fill('surname', 'Colombo') // Fill with 'Colombo'
          .pressButton('submit', function () {
            browser.assert.success();
            browser.assert.text('span#name', 'Cristoforo Colombo');
            browser.assert.elements('span#dates', 1);
            done();
          });
      });
    });

    // #6
  test('Submit the surname "Vespucci" in the HTML form', function (done) {
    browser.visit('/', function () {
      browser
        .fill('surname', 'Vespucci') // Fill with 'Vespucci'
        .pressButton('submit', function () {
          browser.assert.success();
          browser.assert.text('span#name', 'Amerigo Vespucci');
          browser.assert.elements('span#dates', 1);
          done();
        });
      });
    });
  });
});
