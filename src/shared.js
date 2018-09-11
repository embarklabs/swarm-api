const request = require('request');

class _SwarmJS {

  constructor(opts) {
    this.opts = opts || {};
    this.gateway = 'https://swarm-gateways.net';
    if (this.opts.gateway) {
      this.gateway = opts.gateway;
    }
  }

  _isValidHash(hash) {
    return (/^[0-9a-f]{64}$/).test(hash);
  }

  _contentResponse(error, response, body, cb) {
    if (error) {
      cb(error);
    } else if (response.statusCode !== 200) {
      cb(body);
    } else {
      cb(null, body);
    }

  }

  _hashResponse(error, response, body, cb) {
    this._contentResponse(error, response, body, (err, body) => {
      if (err) return cb(err);
      if (!this._isValidHash(body)) return cb('Invalid hash');
      return cb(null, body);
    });
  }

  download(url, cb) {
    request(`${this.gateway}/${url}`, (error, response, body) => {
      if (error) {
        cb(error);
      } else if (response.statusCode !== 200) {
        cb(body);
      } else {
        cb(null, body);
      }
    });
  }

  downloadRaw(hash, cb) {
    this.download(`bzz-raw:/${hash}`, cb);
  }

  upload(url, content, cb) {
    request.post({
      url: `${this.gateway}/${url}`,
      body: content
    }, (error, response, body) => this._hashResponse(error, response, body, cb));
  }

  uploadRaw(content, cb) {
    this.upload('bzz-raw:/', content, cb);
  }

  uploadForm(formData, defaultPath = 'index.html', cb) {
    let postObj = {
      url: `${this.gateway}/bzz:/`,
      formData: formData,
      qs: {defaultpath: defaultPath}
    };

    request.post(postObj, (error, response, body) => this._hashResponse(error, response, body, cb));
  }

  isAvailable(cb) {
    const testContent = "test";
    const testHash = "6de1faa7d29b1931b4ba3d44befcf7a5e43e947cd0bf2db154172bac5ecac3a6";
    try {
      this.uploadRaw(testContent, (err, hash) => {
        if (err) return cb(err);
        cb(null, hash === testHash);
      });
    } catch (e) {
      cb(e);
    }
  }
}
export default _SwarmJS;
