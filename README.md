# SwarmJS
A javascript library for interacting with [Swarm](https://swarm-guide.readthedocs.io/en/latest/), a decentralised and distributed storage platform.

## Installation
```
npm install swarmjs --save
```

## Basic usage
#### First, import SwarmJS
Using **CommonJS**:
```
const SwarmJS = require('swarmjs');
```
Or, with **ES6**:
```
import SwarmJS from 'swarmjs';
```
Then instantiate SwarmJS
```
// instantiate SwarmJS
const swarmjs = new SwarmJS({ gateway: 'http://localhost:8500' });
```
Available options:
| Option | Description | Default |
| -----| ------------| ------- |
| `gateway` | URL of the Swarm gateway, ie `http://localhost:8500`. | `swarm-gateways.net` |
| `mode` | Protocol of the default gateway URL. If `gateway` is provided, this has no effect. | `https` |
NOTE: if no options are provided, the default gateway URL will be `https://swarm-gateways.net`.
##### Check gateway availability
```
// Check gateway availability
swarmjs.isAvailable((err, isAvailable) => {
    if(err) return console.error('Error checking Swarm availability', err);
    console.log(`Gateway at 'http://localhost:8500' is ${isAvailable ? '' : 'un'}available`);
});
// > Gateway at 'http://localhost:8500' is available
```
##### Upload of raw content
```
// Upload of raw content
let testHash;
swarmjs.uploadRaw('test', (err, hash) => {
    if(err) return console.error('Error uploading contents', err);
    testHash = hash;
    console.log(`test can now be accessed from 'http://localhost:8500/bzz-raw:/${hash}'`);
});
// > test can now be accessed from 'http://localhost:8500/bzz-raw:/6de1faa7d29b1931b4ba3d44befcf7a5e43e947cd0bf2db154172bac5ecac3a6'
```
##### Upload file
```
// If you want to upload a file, first read the file's contents, then upload as the raw contents
const fs = require('fs');
fs.readFile('./index.html', (err, data) => {
  if (err) throw err;
  swarm.uploadRaw(data, (err, hash) => {
    if (err) return console.error('Error uploading file contents', err);
    console.log(`file contents can now be accessed from 'http://localhost:8500/bzz-raw:/${hash}'`);
  });
});
// > file contents can now be accessed from 'http://localhost:8500/bzz-raw:/178739cbbd084e90ae0cef3f95e4b92baa85e83edb1a52d28dc370277db9d457'
```
##### Upload directory (only available in NodeJS, not available in the browser!)
```
swarmjs.uploadDirectory('dist/', (err, hash) => {
    if(err) return console.error('Error uploading directory', err);
    console.log(``);
});
```
##### Download content
```
// Download content via hash
swarmjs.downloadRaw(testHash, (err, content) => {
    if(err) return console.error(err);
    console.log(`contents of our test: ${content}`);
});
// > contents of our test: test
```