/* eslint no-useless-constructor: "off" */
const resolve = require('path').resolve;
import _SwarmJS from './shared';
import fs from 'fs';
import klaw from 'klaw';
import through2 from 'through2';

class SwarmJS extends _SwarmJS {

  constructor(opts){
    super(opts);
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

  uploadDirectory(path, defaultPath, cb) {
    this._getDirectoryTreeReadable(`${resolve(path)}/`, (errors, readables) => {
      const hasReadables = Boolean(Object.keys(readables).length);
      if (errors.length && !hasReadables) {
        return cb(errors.join('\n'));
      }
      if (errors.length) {
        console.trace(errors.join('\n'));
      }
      if (hasReadables) {
        return this.uploadForm(readables, defaultPath, cb);
      }
      cb('No files to upload');
    });
  }
}

export default SwarmJS;
