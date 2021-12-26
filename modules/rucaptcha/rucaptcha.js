import Recognize, { SOURCE } from "recognize"; // https://www.npmjs.com/package/recognize

export default class extends Recognize {
  constructor() {
    super(SOURCE.RUCAPTCHA, { key: process.env.RUCAPCHA_API_KEY });
  }
}
