import __dirname from "./dirName.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const idFile = path.join(__dirname, ".myapp-machineid");
let machineId;
if (fs.existsSync(idFile)) {
    machineId = fs.readFileSync(idFile, "utf-8");
} else {
    machineId = uuidv4();
    fs.writeFileSync(idFile, machineId);
}
export default machineId;