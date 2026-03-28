// service.js
import { Service } from "node-windows";
import path from "path";
//const Service = require('node-windows').Service;
const basePath = process.cwd(); // or process.execPath if relative to exe

// Path to your main Express file
const scriptPath = path.join(basePath, "src", 'index.js');
console.info("basePath", basePath, "indexPath", scriptPath, "args", process.argv[2]);
// Create a new service object
const svc = new Service({
    name: 'alen-print-service',
    description: 'a http printer service.',
    script: scriptPath,
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ],
    // Optional: run as specific user
    // user: {
    //   domain: 'MYDOMAIN',
    //   account: 'myUser',
    //   password: 'myPassword'
    // }
});

// Get the command from terminal
const action = process.argv[2];

if (action === 'install') {
    console.info("installing service ...")
    svc.on('install', () => {
        console.log('Service installed successfully!');
        svc.start();
    });

    svc.install();
} else if (action === 'uninstall') {
    console.info("uninstalling service ...")
    svc.on('uninstall', () => {
        console.log('Service uninstalled successfully!');
    });

    svc.uninstall();
} else {
    console.log('Usage: node service.js [install|uninstall]');
}