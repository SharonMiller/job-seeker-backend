'use strict';

const request = require('superagent');
const serverToggle = require('../lib/server-toggle');
const server = require('../server');
const PORT = process.env.PORT || 3000;

const User = require('../model/user');
const Profile = require('../model/profile');

const url = `http://localhost:${PORT}`;
require('jest');

const exampleUser = {
  username: 'testuser',
  email: 'testemail@test.com',
  password: '1234',
};

const exampleProfile = {
  name: 'testprofile',
  email: 'testemail@test.com',
};

describe('Profile routes', function() {

  beforeAll( done => serverToggle.serverOn(server, done));

  afterAll( done => serverToggle.serverOff(server, done));

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/profile', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a newly created profile', done => {
      request.post(`${url}/api/profile`)
        .send(exampleProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleProfile.name);
          expect(res.body.email).toEqual(exampleProfile.email);
          expect(res.body.userId).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 401 if no token was provided', done => {
      request.post(`${url}/api/profile`)
        .send(exampleProfile)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          // additional tests here
          done();
        });
    });

    it('should return a 400 error if no request body was provided', done => {
      request.post(`${url}/api/profile`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          // additional tests here
          done();
        });
    });

    it('should return a 404 with an invalid request', done => {
      request.post(`${url}/api/profilez`)
        .send(exampleProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          // additional tests here
          done();
        });
    });
  });

  describe('GET: /api/profile/:profileId', () => {

    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleProfile.userId = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleProfile.userId;
    });

    it('should return a profile', done => {
      request.get(`${url}/api/profile/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleProfile.name);
          expect(res.body.email).toEqual(exampleProfile.email);
          expect(res.body.userId).toEqual(this.tempUser._id.toString());
          expect(typeof res.body.userId).toEqual('string');
          done();
        });
    });

    it('should return a 401 if no token was provided', done => {
      request.get(`${url}/api/profile/${this.tempProfile._id}`)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          // additional tests here
          done();
        });
    });

    it('should return a 404 if an invalid id was provided', done => {
      request.get(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          // additional tests here
          done();
        });
    });
  });

  describe('PUT: /api/profile/:profileId', () => {
    
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleProfile.userId = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleProfile.userId;
    });
  });
});