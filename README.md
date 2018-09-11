# SwarmAPI
A javascript library for interacting with [Swarm](https://swarm-guide.readthedocs.io/en/latest/), a decentralised and distributed storage platform.

Under the hood, SwarmAPI uses the Swarm HTTP API to communicate with the Swarm gateway.
## Installation
```
npm install swarmapi --save
```

## Basic usage
First, import SwarmAPI.

Using **CommonJS**:
```
const SwarmAPI = require('swarmapi');
```
Or, with **ES6**:
```
import SwarmAPI from 'swarmapi';
```
Then instantiate SwarmAPI, specifying the gateway you'd like to connect to. *If you are [running your own node](https://swarm-guide.readthedocs.io/en/latest/gettingstarted.html) (recommended), the node should be started before proceeding.*
```
// instantiate SwarmAPI
const swarmapi = new SwarmAPI({ gateway: 'http://localhost:8500' });
```
Available options:

| Option | Description | Default |
| -----| ------------| ------- |
| `gateway` | URL of the Swarm gateway, ie `http://localhost:8500`. | `https://swarm-gateways.net` |

NOTE: If no options are provided, the default gateway URL will be `https://swarm-gateways.net`. This means you don't necessarily need to [run your own Swarm node](https://swarm-guide.readthedocs.io/en/latest/gettingstarted.html), however there is an upload limit of ~2.5MB and no guarantees regarding permanence. *It is recommended to run your own Swarm node.*
##### Check gateway availability
```
// Check gateway availability
swarmapi.isAvailable((err, isAvailable) => {
    if(err) return console.error('Error checking Swarm availability', err);
    console.log(`Gateway at 'http://localhost:8500' is ${isAvailable ? '' : 'un'}available`);
});
// > Gateway at 'http://localhost:8500' is available
```
##### Upload of raw content
```
// Upload of raw content
let testHash;
swarmapi.uploadRaw('test', (err, hash) => {
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
Once uploaded, the hash of **the manifest** is returned. Accessing the manifest from `bzz:/` will not return anything. Instead, you can use the hash as the root of your directory and access the individual files by appending them to the end of the URL. So, if we uploaded a directory containing `index.html`, we will be able to access it via `<gateway url>/bzz:/<hash>/index.html`.
```
// upload the dist folder, and for this example, we can assume this folder contains index.html and dapp.css
swarm.uploadDirectory('dist/', (err, hash) => {
    if(err) return console.error('Error uploading directory', err);
    console.log(`We can now access our directory via 'http://localhost:8500/bzz:/${hash}/index.html' and 'http://localhost:8500/bzz:/${hash}/dapp.css'`);
});
// > We can now access our directory via 'http://localhost:8500/bzz:/26089099a5f473dfb7b172de6558972989f8db4d3948daedbb974025be7c8534/index.html' and 'http://localhost:8500/bzz:/26089099a5f473dfb7b172de6558972989f8db4d3948daedbb974025be7c8534/dapp.css'
```
##### Download content
```
// Download content via hash
swarmapi.downloadRaw(testHash, (err, content) => {
    if(err) return console.error(err);
    console.log(`contents of our test: ${content}`);
});
// > contents of our test: test
```
