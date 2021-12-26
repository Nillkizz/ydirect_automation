import Enquirer from "enquirer";
const { Input, Password, Select } = Enquirer;

export default class {
  static async get_credentials() {
    const creds = {
      username:
        process.env.DOLPHIN_USERNAME ||
        (await new Input({
          name: "username",
          message: "Dolphin Anty Username: ",
        }).run()),
      password:
        process.env.DOLPHIN_PASSWORD ||
        (await new Password({
          name: "password",
          message: "Dolphin Anty Password: ",
        }).run()),
    };

    return creds;
  }

  static async select_profile(profiles) {
    const profile_id = await new Select({
      name: "profile",
      message: "Choice a profile:",
      choices: profiles.data.map((profile) => ({
        name: profile.name,
        value: profile.id,
      })),
      result(name) {
        return this.map(name)[name];
      },
    }).run();

    return profile_id;
  }
}
