import EventEmitter from "events";

import dotenv from "dotenv"; //  https://www.npmjs.com/package/dotenv
import fetch from "node-fetch"; //  https://www.npmjs.com/package/node-fetch

import Input from "./input.js";

dotenv.config();

/**
 * @fires logged_in
 * @fires profiles_fetched
 * @fires profiles_received
 * @fires profile_started { port: Number, wsEndpoint: String }
 */
export default class extends EventEmitter {
  constructor({ no_init, profile_name } = {}) {
    super();
    this.cache = {};
    this.profile_name = profile_name;

    if (!no_init) this.init();
  }

  async init() {
    const credentials = await Input.get_credentials();
    this.login(credentials);

    this.on("logged_in", async () => {
      const profiles = await this.get_profiles_list();

      this.profile_id = !this.profile_name
        ? await Input.select_profile(profiles)
        : profiles.data.filter(
            (profile) => profile.name == this.profile_name
          )[0].id;

      this.profile_data = await this.start_profile(this.profile_id);
    });
  }

  async start_profile(profile_id) {
    const url = `http://localhost:3001/v1.0/browser_profiles/${profile_id}/start?automation=1`;
    const data = await (await fetch(url)).json();
    if (!data.success) return false;
    this.emit("profile_started", data.automation);
    return data;
  }

  async login({ username, password }) {
    let success = false;
    const url = "https://anty-api.com/auth/login",
      body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);
    const response = await fetch(url, { method: "POST", body });

    if (response.ok) {
      const data = await response.json();
      this.cache.access_token = data.token;
      this.emit("logged_in");
      success = true;
    } else console.error("Invalid username or password", data);

    return success;
  }

  async get_profiles_list() {
    if (!this.cache.profiles_list) {
      const url = "https://anty-api.com/browser_profiles";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.cache.access_token}` },
      });
      this.cache.profiles_list = await response.json();
      this.emit("profiles_fetched");
    }
    this.emit("profiles_received");
    return this.cache.profiles_list;
  }

  emit(eventName, ...args) {
    console.info("<Dolphin>", "Event", eventName);
    return super.emit(eventName, ...args);
  }
}
