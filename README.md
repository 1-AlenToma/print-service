# HTTPService Printer

**HTTPService Printer** is a Node.js-based service that provides silent printing of HTML content to PDF and physical printers via a REST API. It uses **Express**, **Puppeteer**, and **pdf-to-printer**, and can be installed as a **Windows service** for always-on printing.

---


## NPM
```bash
npm install -g invoice-print-service
```


## Features

- Exposes HTTP endpoints for printing HTML to a physical printer.
- Automatically generates PDFs and sends them to the printer.
- Supports multiple printers and settings.
- Can run as a Windows service (install/uninstall script included).
- Uses Puppeteer for rendering HTML and Chrome for PDF generation.

---


---

## Install the Service

The `service.js` script allows you to install/uninstall the Express print service as a Windows service.

1. Open a terminal in the project folder.
2. Install the service:

```bash
printserver install
```

- The service is named **alen-print-service** (or change the `name` in `service.js`).
- The service will start automatically.

3. To uninstall:

```bash
printserver uninstall
```

---

## API Endpoints

### `GET /ping`

Check if the service is online.

**Response:**

```json
{
  "printerIsOnline": true
}
```

---

### `GET /printers`

List available printers and the default printer.

**Response Example:**

```json
[
  {
    "deviceId": "Printer1",
    "name": "HP LaserJet",
    "isDefault": true
  },
  {
    "deviceId": "Printer2",
    "name": "Canon Inkjet"
  }
]
```

---

### `POST /print`

Print HTML content to a specified printer.

**Request Body:**

```json
{
  "deviceId": "Printer1",
  "html": "<h1>Hello World</h1>",
  "settings": { "format": "A4" }
}
```

**Response Example:**

```json
{
  "printer": { "deviceId": "Printer1", "name": "HP LaserJet" },
  "status": "printed"
}
```

---

## How It Works

1. Receives HTML content via POST `/print`.
2. Generates a temporary PDF using **Puppeteer** and Chrome.
3. Sends the PDF to the selected printer using **pdf-to-printer**.
4. Deletes the temporary PDF after printing.
5. Supports queued printing via `printQueue.js`.

---

## Logging

Logs are generated using `logger.js`. You can customize it to output to console, files, or external logging services.

---

## Notes

- Chrome must be installed and detected by `chrome-launcher`.
- Temporary PDFs are stored in the `jobs/` folder inside the project directory.
- The service is silent; no browser windows will open during printing (`headless: true`).

