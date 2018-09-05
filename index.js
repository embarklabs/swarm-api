const request = require('request');
const fs = require('fs');
const klaw = require('klaw');
const through2 = require('through2');

class SwarmJS {

  constructor(opts) {
    this.opts = opts || {};
    if (this.opts.gateway) {
      this.gateway = opts.gateway
    } else if (this.opts.mode === 'http') {
      this.gateway = 'http://swarm-gateways.net'
    } else {
      this.gateway = 'https://swarm-gateways.net'
    }
  }

  static _isValidHash(hash) {
    return /^[0-9a-f]{64}$/.test(hash)
  }


  _getDirectoryTreeReadable(directory, cb) {
    let readables = {}; // files, directories, symlinks, etc
    let errors = [];

    const excludeDirFilter = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory()) this.push(item)
      next()
    })

    klaw(directory)
      .pipe(excludeDirFilter)
      .on('data', (item) => {
        readables[item.path] = fs.createReadStream(item.path);
      })
      .on('error', (error, item) => {
        errors.push(`Error walking directory '${directory}', on item ${item.path}, error: ${error.message}`);
      })
      .on('end', () => cb(errors, readables)); // => [ ... array of files]
  }

  _hashResponse(error, response, body, cb) {
    if (error) {
      cb(error)
    } else if (response.statusCode !== 200) {
      cb(body)
    } else if (!SwarmJS._isValidHash(body)) {
      cb('Invalid hash')
    } else {
      cb(null, body)
    }
  }

  get(url, cb) {
    request(this.gateway + '/' + url, function (error, response, body) {
      if (error) {
        cb(error)
      } else if (response.statusCode !== 200) {
        cb(body)
      } else {
        cb(null, body)
      }
    })
  }

  putFile(content, cb) {
    request({
      method: 'POST',
      uri: this.gateway + '/bzz-raw:/',
      body: content
    }, (error, response, body) => this._hashResponse(error, response, body, cb))
  }

  putDirectory(path, cb) {
    this._getDirectoryTreeReadable(path, (errors, readables) => {
      const hasReadables = Boolean(Object.keys(readables).length);
      if (errors.length && !hasReadables) {
        return cb(errors.join('\n'));
      }
      if (errors.length) {
        console.trace(errors.join('\n'));
      }
      if (hasReadables) {
        return request({
          method: 'POST',
          uri: this.gateway + '/bzz:/',
          formData: readables
        }, (error, response, body) => this._hashResponse(error, response, body, cb));
      }
      cb('No files to upload');
    });
  }


  isAvailable(cb) {
    const testFile = "test";
    const testHash = "6de1faa7d29b1931b4ba3d44befcf7a5e43e947cd0bf2db154172bac5ecac3a6";
    try {
      this.putFile(testFile, (err, hash) => {
        if (err) return cb(err);
        cb(null, hash === testHash);
      });
    } catch (e) {
      cb(e);
    }
  }
}
module.exports = SwarmJS;
