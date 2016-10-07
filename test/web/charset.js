'use strict';


const koa = require('koa');
const request = require('supertest');
const co = require('co');
const charset = require('../../lib/web/charset');


/* eslint max-nested-callbacks: [2, 4] */


describe('web/charset', () => {
  it('output gbk with query _output_charset', () =>{
    const app = koa();
    app.use(charset());
    app.use(function* () {
      if (this.path === '/a') {
        this.body = '中国';
      } else if (this.path === '/b') {
        this.body = { data: '中国' };
      }
    });

    const agent = request.agent(app.callback());
    return co(function* () {
      yield agent.get('/a').expect('中国');

      yield agent.get('/a?_output_charset=gbk')
          .expect('content-type', 'text/plain; charset=gbk')
          .expect(o => {
            o.buffered.should.be.true();
          });

      // json data should not encode
      yield agent.get('/b?_output_charset=gbk')
          .expect({ data: '中国' });
    });
  });
});
