import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

import Rucaptcha from "./rucaptcha.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const recognize = new Rucaptcha();
  const price = await recognize.balanse();
  console.log("My balance:", price);

  const buff = await readFile(path.resolve(__dirname, "captcha.png"));

  const result = await recognize.solvingImage(buff);
  console.log(result);
})();
