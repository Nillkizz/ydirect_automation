export default class EditGroup {
  constructor(page, url) {
    this.page = page;
    this.url = url;
  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async updateKeywords(keywords) {
    await this.page.click(
      '.group-keywords-editor__button:has-text("Ключевые фразы") button'
    );
    await this.page.fill(
      ".keywords-editor-body__textarea textarea",
      keywords.join("\n")
    );
  }

  async save() {
    const saveBtn = this.page.locator(
      '.groups-screen__footer button:has-text("Сохранить")'
    );
    await saveBtn.waitFor();
    await saveBtn.evaluate((el) => el.click());
    await this.page.waitForNavigation();
  }
}
