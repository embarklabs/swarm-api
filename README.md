# SwarmJS
A javascript library for interacting with [Swarm](https://swarm-guide.readthedocs.io/en/latest/), a decentralised and distributed storage platform.

Under the hood, SwarmJS uses the Swarm HTTP API to communicate with the Swarm gateway.
## Installation
```
npm install swarmjs --save
```

## JS usage
First, import SwarmJS.

Using **CommonJS**:
```
const SwarmJS = require('swarmjs');
```
Or, with **ES6**:
```
import SwarmJS from 'swarmjs';
```
Then instantiate SwarmJS, specifying the gateway you'd like to connect to. *If you are [running your own node](https://swarm-guide.readthedocs.io/en/latest/gettingstarted.html) (recommended), the node should be started before proceeding.*
```
// instantiate SwarmJS
const swarmjs = new SwarmJS({ gateway: 'http://localhost:8500' });
```
Available options:

| Option | Description | Default |
| -----| ------------| ------- |
| `gateway` | URL of the Swarm gateway, ie `http://localhost:8500`. | `swarm-gateways.net` |
| `mode` | Protocol of the default gateway URL. If `gateway` is provided, this has no effect. | `https` |

NOTE: If no options are provided, the default gateway URL will be `https://swarm-gateways.net`. This means you don't necessarily need to [run your own Swarm node](https://swarm-guide.readthedocs.io/en/latest/gettingstarted.html), however there is an upload limit of ~2.5MB and no guarantees about permanence. It is recommended to run your own Swarm node.
##### Check gateway availability
```
swarmjs.isAvailable((err, isAvailable) => {
    if(err) return console.error('Error checking Swarm availability', err);
    console.log(`Gateway at 'http://localhost:8500' is ${isAvailable ? '' : 'un'}available`);
});
// Gateway at 'http://localhost:8500' is available
```
##### Upload of raw content
```
let testHash;
swarmjs.uploadRaw('test', (err, hash) => {
    if(err) return console.error('Error uploading contents', err);
    testHash = hash;
    console.log(`test can now be accessed from 'http://localhost:8500/bzz-raw:/${hash}'`);
});
// test can now be accessed from 'http://localhost:8500/bzz-raw:/6de1faa7d29b1931b4ba3d44befcf7a5e43e947cd0bf2db154172bac5ecac3a6'
```
##### Upload file
If you want to upload a file, first read the file's contents, then upload as the raw contents
```
const fs = require('fs');
fs.readFile('./index.html', (err, data) => {
  if (err) throw err;
  swarm.uploadRaw(data, (err, hash) => {
    if (err) return console.error('Error uploading file contents', err);
    console.log(`file contents can now be accessed from 'http://localhost:8500/bzz-raw:/${hash}'`);
  });
});
// file contents can now be accessed from 'http://localhost:8500/bzz-raw:/178739cbbd084e90ae0cef3f95e4b92baa85e83edb1a52d28dc370277db9d457'
```
##### Upload directory (only available in NodeJS, not available in the browser!)
Once uploaded, the hash of **the manifest** is returned. Accessing the manifest from `bzz:/` will not return anything. Instead, you can use the hash as the root of your directory and access the individual files by appending them to the end of the URL. So, if we uploaded a directory containing `index.html`, we will be able to access it via `<gateway url>/bzz:/<hash>/index.html`.
```
// upload the dist folder, and for this example, we can assume this folder contains index.html and dapp.css
swarm.uploadDirectory('dist/', null, (err, hash) => {
    if(err) return console.error('Error uploading directory', err);
    console.log(`We can now access our directory via 'http://localhost:8500/bzz:/${hash}/index.html' and 'http://localhost:8500/bzz:/${hash}/dapp.css'`);
});
// We can now access our directory via 'http://localhost:8500/bzz:/26089099a5f473dfb7b172de6558972989f8db4d3948daedbb974025be7c8534/index.html' and 'http://localhost:8500/bzz:/26089099a5f473dfb7b172de6558972989f8db4d3948daedbb974025be7c8534/dapp.css'
```
##### Download content
```
// Download content via hash
swarmjs.downloadRaw(testHash, (err, content) => {
    if(err) return console.error(err);
    console.log(`contents of our test: ${content}`);
});
// contents of our test: test
```
## CLI
### Installation
SwarmAPI can be installed globally to be accessed from the CLI
```
npm install -g swarm-api
```
Or installed locally to be accessed from the current folder
```
npm install swarm-api
```
### CLI Usage
##### Check gateway availability
```
swarmapi ping --gateway http://localhost:8500
// [http://localhost:8500] The Swarm gateway at http://localhost:8500 is available
```
##### Upload of raw content
```
swarmapi uploadraw 'Hello World' --gateway http://localhost:8500
// [http://localhost:8500] Swarm hash: a294d3a33dc0b4d9a12fdb48f5a7aed5f8dd2d8fc6a4253487c63012210e210e
```
##### Upload file
```
swarmapi uploadfile index.html --gateway http://localhost:8500
// [http://localhost:8500] Swarm hash: 91a3e25c9cec6d470eeaff24f2e5b5e56b87482eb289da8041b1f97a3dbbd39f
```
##### Upload directory (only available in NodeJS, not available in the browser!)
Once uploaded, the hash of **the manifest** is returned. Accessing the manifest from `bzz:/` will 404. Instead, you can use the hash as the root of your directory and access the individual files by appending them to the end of the URL, then call `swarmapi download <uri>`. 
So, if our uploaded directory looked like:
```
├── dist 
│   └── root.html
│   ├── folder
│   │   └── index.js
```
Run the upload directory command
```
swarmapi uploaddir dist --gateway http://localhost:8500
// [http://localhost:8500] Swarm manifest hash: 06da636c60c4a5472b209c71e35170044e8cf939aca6acfec765514f33a72b87. Resources can be retreived using bzz:/<hash>/<path:optional>/<filename>, for example (assuming /index.html was uploaded):
// swarmapi download bzz:/06da636c60c4a5472b209c71e35170044e8cf939aca6acfec765514f33a72b87/index.html -g http://localhost:8500
```
We will be able to access the `root.html` file via 
```
swarmapi download bzz:/06da636c60c4a5472b209c71e35170044e8cf939aca6acfec765514f33a72b87/root.html -g http://localhost:8500
```
And the `folder/index.js` file via
```
swarmapi download bzz:/06da636c60c4a5472b209c71e35170044e8cf939aca6acfec765514f33a72b87/folder/index.js -g http://localhost:8500
```

##### Download content
```
swarmapi downloadraw a294d3a33dc0b4d9a12fdb48f5a7aed5f8dd2d8fc6a4253487c63012210e210e -g http://localhost:8500
// Hello World
```