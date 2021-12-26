export default class Campaigns {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("https://direct.yandex.ru/");
  }

  async getCampaignUrl(id) {
    const href = await this.page
      .locator(
        `.grid-campaign-name-cell__description:has-text("№ ${id}") a:has-text("Перейти")`
      )
      .getAttribute("href");
    return href;
  }
}
