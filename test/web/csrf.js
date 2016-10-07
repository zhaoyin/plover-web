'use strict';


const koa = require('koa');
const request = require('supertest');
const co = require('co');


/* eslint max-nested-callbacks: [2, 4] */


describe('web/csrf', () => {
  const app = koa();
  app.keys = ['test'];
  app.use(require('koa-session')({}, app));
  require('koa-csrf')(app);

  const opts = {
    match: '/csrf',

    ignore: [
      '/ignore/*',
      /^\/skip\//
    ]
  };

  app.use(require('../../lib/web/csrf').middleware(opts));
  app.use(function* (next) {
    if (this.path === '/getcsrf') {
      this.body = this.csrf;
    } else {
      yield* next;
    }
  });
  app.use(function* () {
    this.body = 'ok';
  });

  const agent = request.agent(app.callback());

  it('`get` ignore csrf check for default', () => {
    return agent.get('/').expect('ok');
  });


  it('`post` should check csrf for default', () => {
    return agent.post('/').expect(403);
  });


  it('config match force csrf check', () => {
    return agent.get('/csrf').expect(403);
  });


  it('config ignore skip csrf check', () => {
    return agent.post('/ignore/123').expect('ok');
  });


  it('config ignore rules with regexp', () => {
    return agent.post('/skip/123').expect('ok');
  });


  it('pass csrf check', () => {
    return co(function* () {
      let csrf = false;
      yield agent.get('/getcsrf').expect(o => {
        csrf = o.text;
      });
      csrf.should.not.empty();
      yield agent.post('/?_csrf=' + csrf).expect('ok');
    });
  });
});
