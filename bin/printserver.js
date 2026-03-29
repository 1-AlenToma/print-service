#!/usr/bin/env node
import path from "path";
import { spawn } from "child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import __dirname from "../src/dirName.js";

const argv = yargs(hideBin(process.argv))
    .command("install", "Install the Windows service", {}, () => {
        runServiceScript("install");
    })
    .command("uninstall", "Uninstall the Windows service", {}, () => {
        runServiceScript("uninstall");
    })
    .demandCommand(1, "You must specify a command: install | uninstall")
    .help()
    .argv;

function runServiceScript(action) {
    console.info("Service base path", __dirname)
    const scriptPath = path.join(__dirname, "service.js");
    const node = process.execPath;

    const child = spawn(node, [scriptPath, action], {
        stdio: "inherit",
        cwd: process.cwd()
    });

    child.on("exit", (code) => {
        process.exit(code);
    });
}