const assert = require('assert');
const chai = require('chai');
const chaihttp = require('chai-http');
const cmb = require('../canteen-model-builder');
const app = require('../app').server;
const url = "http://localhost:9000";

chai.use(chaihttp);
chai.should();
const expect = chai.expect;

describe('csv-processor', function() {
  let route = '/v1/menu/canteen/convert'
  describe(url, function() {
    it('should return 400 if no body has been provided', (done) => {
      chai.request(url).post(route).end((err, res) => {
        res.should.have.status(400);
        done();
      })
    });

    it("should reject the request if an invalid type was provided", (done) => {
      chai.request(url).post(route)
      .field('type','sjsx')
      .attach('file', './test/sjsu.test.csv')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    });

    it("should reject files that aren't csv or txt", (done) => {
      chai.request(url).post(route)
      .field('type','sjsu')
      .attach('file', './test/testfile.jpg')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    });

    it("should process 3 records from the test file -- sjsu", (done) => {
      chai.request(url).post(route)
      .field('type', 'sjsu')
      .attach('file', './test/sjsu.test.csv')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.Market.ProductCatalog.should.have.lengthOf(3);
        done();
      });
    });

    it("should process 3 records from the test file -- uh", (done) => {
      chai.request(url).post(route)
      .field('type', 'uh')
      .attach('file', './test/uh.test.csv')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.Market.ProductCatalog.should.have.lengthOf(3);
        done();
      });
    });

  });
});