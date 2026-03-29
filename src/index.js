import express from "express";
import cors from "cors";
import puppeteer from "puppeteer-core";
import * as _pdfPrinter from "pdf-to-printer";
import fs from "fs";
import path from "path";
import logger from "./logger.js";
import { addJob } from "./printQueue.js";
import * as chromeLauncher from "chrome-launcher";
import __dirname from "./dirName.js";
import maskinId from "./maskinId.js";
import { register } from "module";
import WebSocket from 'ws';
const idFile = path.join(__dirname, ".myapp-api");
const registerServer = (api) => {

    fs.writeFileSync(idFile, api);
    createWebSocketConnection();
}

const redisteredApi = () => fs.existsSync(idFile) ? fs.readFileSync(idFile, "utf-8") : null;

var ws = undefined;

const createWebSocketConnection = () => {
    try {
        if (ws && ws.readyState === WebSocket.OPEN)
            ws.close();
        let api = redisteredApi();
        if (!api) {
            return;
        }

        let protocol = api.startsWith("https") ? "wss" : "ws";
        let url = `${protocol}://${api.replace(/https?:\/\//, '')}/ws?maskinId=${maskinId}`;
        console.info("Connecting to WS server at", url);
        ws = new WebSocket(url);
        ws.on('open', () => {
            console.log('Connected to cloud WS server');
        });

        ws.on('message', async (msg) => {
            const job = JSON.parse(msg);
            console.log('Received print job:', job);

            const result = await addJob(() => printHTML(job.content, job.deviceId, job.settings));
            // Print to the selected printer
            // await print(job.content, { printer: job.deviceId, ...job.settings });

            console.log('Printed job:', job.id);
        });
    } catch (e) {
        logger.error(`WebSocket connection error: ${e.message}`);
    }
}



const pdfPrinter = _pdfPrinter.default;
const basePath = __dirname // or process.execPath if relative to exe
console.log("basePath", basePath)
const app = express();
app.use(express.json());
app.use(cors());

// Puppeteer browser singleton
let browser;
const getBrowser = async () => {
    if (!browser) {
        const chromePath = await chromeLauncher.Launcher.getInstallations();
        console.info("chrome path", chromePath)
        browser = await puppeteer.launch({
            executablePath: chromePath[0],
            headless: true
        });
    }
    return browser;
};

const deleteFile = (file) => {
    if (fs.existsSync(file))
        fs.unlinkSync(file);
}


// Print function
const printHTML = async (html, deviceId, settings) => {
    const printers = await pdfPrinter.getPrinters();
    const printerName = printers.find(x => x.deviceId == deviceId || x.name == deviceId)
    if (!printerName) return { printer: deviceId, status: "Printer not found" };
    const dir = path.join(basePath, "jobs");
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir)
    const pdfPath = path.resolve(`${dir}/temp_${Date.now()}.pdf`);
    try {


        const browser = await getBrowser();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });


        await page.pdf({ path: pdfPath, ...settings, printBackground: true });

        logger.info(`Generated PDF for type "${printerName.name}" at ${pdfPath}`);

        await pdfPrinter.print(pdfPath, { printer: printerName.name });
        logger.info(`Printed PDF to printer "${printerName.name}"`);

        logger.info(`Cleaned up temp PDF ${pdfPath}`);

        return { printer: printerName.name, status: "printed" };
    } catch (e) {
        logger.info(`could not be printed "${e}"`);
        return { printer: printerName.name, status: e.toString() };

    } finally {
        deleteFile(pdfPath);
    }


};


app.get("/ping", async (req, res) => {

    res.status(200).json({
        "printerIsOnline": true,
        maskinId,
        registerUrl: `http://localhost:${PORT}/registerPrinters?api=https://tyari1977-001-site1.qtempurl.com/api`
    });
});


app.get("/printers", async (req, res) => {

    let data = await pdfPrinter.getPrinters();
    let defaultPrinter = await pdfPrinter.getDefaultPrinter();
    const result = data.filter(Boolean).map(x => {
        if (defaultPrinter && x.deviceId == defaultPrinter.deviceId)
            x.isDefault = true;
        return x;
    });
    res.status(200).json(result);
});

app.get("/registerPrinters", async (req, res) => {
    const { api, login } = req.query;
    try {
        if (!login) {
            await fetch(`${api}/registerPrinter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    maskinId,
                    printers: await pdfPrinter.getPrinters()
                })
            })
        }
        registerServer(api);
        res.status(200).json({ status: "Printers registered successfully" });
    } catch (e) {
        logger.error(`Failed to register printers: ${e.message}`);
        return res.status(500).json({ error: "Failed to register printers", details: e.message });
    }
});





// Endpoint
app.post("/print", async (req, res) => {
    const { deviceId, html, settings } = req.body;
    if (!html) return res.status(400).json({ error: "HTML content is required" });

    try {
        console.log("printing", "deviceId", deviceId, "settings", settings)
        const result = await addJob(() => printHTML(html, deviceId, settings));
        res.json(result);
    } catch (err) {
        logger.error(`Print error: ${err.message}`);
        res.status(500).json({ error: "Printing failed", details: err.message });
    }
});

const PORT = 5000;
createWebSocketConnection();
app.listen(PORT, () => logger.info(`Silent print service running on http://localhost:${PORT}`));