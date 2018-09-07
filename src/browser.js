const request = require('request');

//class SwarmJS {

  // constructor(opts) {
  //   this.opts = opts || {};
  //   if (this.opts.gateway) {
  //     this.gateway = opts.gateway
  //   } else if (this.opts.mode === 'http') {
  //     this.gateway = 'http://swarm-gateways.net'
  //   } else {
  //     this.gateway = 'https://swarm-gateways.net'
  //   }
  // }

  function SwarmJS(opts){
    this.opts = opts || {};
    if (this.opts.gateway) {
      this.gateway = opts.gateway
    } else if (this.opts.mode === 'http') {
      this.gateway = 'http://swarm-gateways.net'
    } else {
      this.gateway = 'https://swarm-gateways.net'
    }
  }

  SwarmJS.prototype._isValidHash = (hash) => {
    return /^[0-9a-f]{64}$/.test(hash)
  }
  
  SwarmJS.prototype._hashResponse = (error, response, body, cb) => {
    if (error) {
      cb(error)
    } else if (response.statusCode !== 200) {
      cb(body)
    } else if (!this._isValidHash(body)) {
      cb('Invalid hash')
    } else {
      cb(null, body)
    }
  }

  SwarmJS.prototype.download = (url, cb) => {
    request(`${this.gateway}/${url}`, (error, response, body) => {
      if (error) {
        cb(error)
      } else if (response.statusCode !== 200) {
        cb(body)
      } else {
        cb(null, body)
      }
    });
  }

  SwarmJS.prototype.downloadRaw = (hash, cb) => {
    this.download(`bzz-raw:/${hash}`, cb);
  }

  SwarmJS.prototype.upload = (url, content, cb) => {
    request.post({
      url: `${this.gateway}/${url}`,
      body: content
    }, (error, response, body) => this._hashResponse(error, response, body, cb))
  }

  SwarmJS.prototype.uploadRaw = (content, cb) => {
    this.upload('bzz-raw:', content, cb);
  }

  SwarmJS.prototype.uploadForm = (formData, cb) => {
    request.post({
      url: `${this.gateway}/bzz:/`,
      formData: formData
    }, (error, response, body) => this._hashResponse(error, response, body, cb));
  }

  


  SwarmJS.prototype.isAvailable = (cb) => {
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
//}

module.exports = SwarmJS;

// (opts) => {
//   opts = opts || {};
//   if (!opts.gateway) {
//     if (opts.mode === 'http') {
//       opts.gateway = 'http://swarm-gateways.net';
//     } else {
//       opts.gateway = 'https://swarm-gateways.net';
//     }
//   }
//   //const swarmjs = new SwarmJS(opts);
//   // return {
//   //   download: swarmjs.download,
//   //   downloadRaw: swarmjs.downloadRaw,
//   //   upload: swarmjs.upload,
//   //   uploadRaw: swarmjs.uploadRaw,
//   //   uploadForm: swarmjs.uploadForm,
//   //   gateway: swarmjs.gateway,
//   //   isAvailable: swarmjs.isAvailable,
//   //   _hashResponse: swarmjs._hashResponse
//   // }
//   return {
//     download: download,
//     downloadRaw: downloadRaw,
//     upload: upload,
//     uploadRaw: uploadRaw,
//     uploadForm: uploadForm,
//     gateway: opts.gateway,
//     isAvailable: isAvailable,
//     _hashResponse: _hashResponse
//   }
// }