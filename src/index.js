const request = require('request');
const fs = require('fs');
const klaw = require('klaw');
const through2 = require('through2');
const resolve = require('path').resolve;

class SwarmJS {

  constructor(opts) {
    this.opts = opts || {};
    if (this.opts.gateway) {
      this.gateway = opts.gateway;
    } else if (this.opts.mode === 'http') {
      this.gateway = 'http://swarm-gateways.net';
    } else {
      this.gateway = 'https://swarm-gateways.net';
    }
  }

  static _isValidHash(hash) {
    return (/^[0-9a-f]{64}$/).test(hash);
  }

  _getDirectoryTreeReadable(directory, cb) {
    let readables = {}; // files, directories, symlinks, etc
    let errors = [];

    const excludeDirFilter = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory()) this.push(item);
      next();
    });

    klaw(directory)
      .pipe(excludeDirFilter)
      .on('data', (item) => {
        const  itemRelPath = item.path.replace(directory, '');
        readables[itemRelPath.replace('/\\', '_')] = {
          value: fs.createReadStream(item.path), 
          options: {
            filepath: itemRelPath
          }
        };
      })
      .on('error', (error, item) => {
        errors.push(`Error walking directory '${directory}', on item ${item.path}, error: ${error.message}`);
      })
      .on('end', () => cb(errors, readables)); // => [ ... array of files]
  }

  _hashResponse(error, response, body, cb) {
    if (error) {
      cb(error);
    } else if (response.statusCode !== 200) {
      cb(body);
    } else if (!SwarmJS._isValidHash(body)) {
      cb('Invalid hash');
    } else {
      cb(null, body);
    }
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
    this.upload('bzz-raw:', content, cb);
  }

  uploadForm(formData, cb){
    request.post({
      url: `${this.gateway}/bzz:/`,
      formData: formData
    }, (error, response, body) => this._hashResponse(error, response, body, cb));
  }

  uploadDirectory(path, cb) {
    this._getDirectoryTreeReadable(`${resolve(path)}/`, (errors, readables) => {
      const hasReadables = Boolean(Object.keys(readables).length);
      if (errors.length && !hasReadables) {
        return cb(errors.join('\n'));
      }
      if (errors.length) {
        console.trace(errors.join('\n'));
      }
      if (hasReadables) {
        return this.uploadForm(readables, cb);
      }
      cb('No files to upload');
    });
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
module.exports = SwarmJS;
