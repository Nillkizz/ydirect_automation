export async function closePages(pages) {
  await pages.forEach(async (p) => {
    await p.close();
  });
}

export const CacheMixin = {
  cache: {},
  _getCache(objName) {
    return (this.cache[objName] = this.cache[objName] || {});
  },
  _flushCache() {
    this.cache = {};
  },
};

export const logger = (classInstance) => {
  return new Proxy(classInstance, {
    get: function (target, name, receiver) {
      if (!target.hasOwnProperty(name)) {
        if (typeof target[name] === "function") {
          console.log(`<${target.constructor.name}>`, name);
        }
        return new Proxy(target[name], this);
      }
      return Reflect.get(target, name, receiver);
    },
  });
};

export async function jsClick(locator) {
  // Browser Click
  if (!(await locator.isVisible())) await locator.waitFor();
  await locator.evaluate((el) => el.click());
}

/**
 * Async sleep function.
 * @param {Number} time - Time for sleep in ms.
 * @returns {Promise<undefined>} Just await it.
 */
export function sleep(time) {
  return new Promise((res) => setTimeout(res, time));
}
