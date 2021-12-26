import { jsClick } from "../utils.js";

export default class Campaign {
  constructor(page, url) {
    this.page = page;
    this.url = url;
    this.group_id = false;
  }

  navigate() {
    return this.page.goto(this.url);
  }

  setGroupId(group_id) {
    this.group_id = group_id;
  }
  clearGroupId() {
    this.group_id = false;
  }

  /**
   *
   * @returns {Promise<String>}
   */
  async getEditUrl() {
    const { groupPanel } = await this._getGroupData();

    const editUrl =
      new URL(this.page.url()).origin +
      (await groupPanel
        .locator('text="Редактировать группу"')
        .getAttribute("href"));

    return editUrl;
  }

  async disableMainBanner() {
    const { enabled } = await this._openGroupSettings();
    if (enabled) await this._toggleMainBanner();
  }

  async enableMainBanner() {
    const { enabled } = await this._openGroupSettings();
    if (!enabled) await this._toggleMainBanner();
  }

  async archiveMainBanner() {
    await this._openGroupSettings();
    const { archivate } = await this._getPopupElements();

    await jsClick(archivate);

    const confirmBtn = this.page.locator(
      ".popup .popup__content:has-text('Вы действительно хотите заархивировать основное объявление?') button:has-text('Да')"
    );
    return Promise.all([this.page.waitForNavigation(), jsClick(confirmBtn)]);
  }

  async unarchiveMainBanner() {
    await this._openGroupSettings();
    const { unarchivate } = await this._getPopupElements();

    await jsClick(unarchivate);

    const confirmBtn = this.page.locator(
      ".popup .popup__content:has-text('Вы действительно хотите разархивировать основное объявление?') button:has-text('Да')"
    );
    return Promise.all([this.page.waitForNavigation(), jsClick(confirmBtn)]);
  }

  /**
   *
   * @param {String} tabName
   * @returns {Promise<[Response, void]>}
   */
  selectTab(tabName) {
    const tab = this.page.locator(
      `.b-campaign-tabs__tab a:has-text("${tabName}")`
    );
    return Promise.all([this.page.waitForNavigation(), jsClick(tab)]);
  }

  /**
   *
   * @returns Promise<{enabled: boolean}>
   */
  async _openGroupSettings() {
    const { groupPanel } = await this._getGroupData();
    const settings_btn = groupPanel.locator(
      ".b-campaign-group__group-toggle button"
    );
    await jsClick(settings_btn);

    const { tumbler } = await this._getPopupElements();
    return {
      enabled: (await tumbler.getAttribute("class")).includes(
        "tumbler_checked_yes"
      ),
    };
  }

  /**
   *
   * @param {String} group_id
   *
   * @returns Promise<{groupPanel: Locator, mainBannerId: String}>
   */
  async _getGroupData() {
    const groupPanel = this.page.locator(
      `.b-campaign-group__panel:has(.b-campaign-group__group-number:has-text("Группа ${this.group_id}"))`
    );
    this.mainBannerId =
      this.mainBannerId ||
      (
        await groupPanel.locator(".b-campaign-group__banner-id").innerText()
      ).match(/\d+/)[0];
    return { groupPanel, mainBannerId: this.mainBannerId };
  }

  async _toggleMainBanner() {
    const { popup, tumbler } = await this._getPopupElements();
    const saveBtn = popup.locator(
      '.b-group-preview2__footer button:has-text("Сохранить")'
    );

    await tumbler.waitFor();
    await tumbler.locator("button").evaluate(async (el) => await el.click());

    await Promise.all([
      this.page.waitForNavigation(),
      saveBtn.evaluate((el) => el.click()),
    ]);
  }

  async _getPopupElements() {
    const { mainBannerId } = await this._getGroupData();
    const popup = this.page.locator(".b-group-preview2__popup-wrapper");

    const bannerControls = popup.locator(
      `.b-group-preview2__banner-item_bid_${mainBannerId} .b-group-preview2__banner-controls`
    );

    const tumbler = bannerControls.locator(".tumbler");
    const archivate = bannerControls.locator("button:has-text('Архивировать')");
    const unarchivate = bannerControls.locator(
      "button:has-text('Разархивировать')"
    );

    return { popup, bannerControls, tumbler, archivate, unarchivate };
  }
}
