'use strict';


const pathUtil = require('path');
const mm = require('plover-test-mate');

const plugin = require('../lib/plugin');


describe('plugin', function() {
  const app = mm({
    applicationRoot: pathUtil.join(__dirname, './fixtures/app')
  });

  app.use(plugin);
  app.use(hello);


  it('etag and rtime', function() {
    return app.get('/hello')
      .expect(function(res) {
        res.header.etag.should.not.empty();
        res.header['x-response-time'].should.not.empty();
      })
      .expect('hello');
  });


  it('favicon', function() {
    return app.get('/favicon.ico').expect(200);
  });


  it('not setting.web', function() {
    const myapp = mm();
    myapp.use(plugin);
    myapp.use(hello);
    return myapp.get('/hello').expect('hello');
  });


  it('security headers', function() {
    return app.get('/hello')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect('X-Content-Type-Options', 'nosniff')
      .expect('X-Download-Options', 'noopen');
  });
});


function hello(app) {
  app.addMiddleware(function* () {
    if (this.path === '/hello') {
      this.body = 'hello';
    }
  });
}
