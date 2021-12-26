import config from "config"; //  https://www.npmjs.com/package/config
import { chromium } from "playwright"; //  https://playwright.dev/docs

import Dolphin from "./modules/dolphin_anty/dolphin_anty.js";
import Rucaptcha from "./modules/rucaptcha/rucaptcha.js";
import { closePages } from "./utils.js";

import CampaignsPage from "./models/campaigns.js";
import CampaignPage from "./models/campaign.js";
import EditGroupPage from "./models/edit_group.js";

const conf = (process.conf = {
  time: config.get("time"),
  accounts: config.get("accounts"),
});

conf.accounts.forEach((account) => {
  const dolphin = new Dolphin({ profile_name: account.profile_name });
  dolphin.once("profile_started", main);

  async function main({ port, wsEndpoint }) {
    const browser = await chromium.connectOverCDP(
      `ws://127.0.0.1:${port}${wsEndpoint}`
    );
    const context = browser.contexts()[0];
    await closePages(context.pages().slice(1));

    const campaignsPage = new CampaignsPage(context.pages()[0]);
    await campaignsPage.navigate();

    account.campaigns.forEach(async (cmp) => {
      const url = await campaignsPage.getCampaignUrl(cmp.id);
      const campaignPage = new CampaignPage(await context.newPage(), url);
      await campaignPage.navigate();
      await campaignPage.selectTab("Все группы");

      // await cmp.groups.forEach(async (group) => {
      //   // campaignPage.setGroupId(group.id);
      //   // const url = await campaignPage.getEditUrl();
      //   // const editPage = new EditGroupPage(await context.newPage(), url);

      //   // editPage.navigate();
      //   campaignPage.disableMainBanner();
      //   campaignPage.archiveMainBanner();
      //   // editPage.updateKeywords(group.keywords);
      //   // editPage.save;
      //   // editPage.page.close();
      //   campaignPage.selectTab("Архив");
      //   campaignPage.unarchiveMainBanner();

      //   // TODO: Async waiting for moderation
      //   // await campaignPage.enableMainBanner();

      //   campaignPage.clearGroupId();
      // });
    });
  }
});

function getBrowserContext() {
  return new Promise((res) => {
    const dolphin = new Dolphin({ profile_name: account.profile_name });
    dolphin.once("profile_started", main);

    async function main({ port, wsEndpoint }) {
      const browser = await chromium.connectOverCDP(
        `ws://127.0.0.1:${port}${wsEndpoint}`
      );
      const context = browser.contexts()[0];
      await closePages(context.pages().slice(1));
      return res({ context });
    }
  });
}
