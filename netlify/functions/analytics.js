// netlify/functions/analytics.js
const { getStore } = require("@netlify/blobs");

// Tune these to your setup
const STORE = "site-analytics";
const PREFIX = ""; // e.g. "data/" if your keys are under a folder
const siteID = process.env.NETLIFY_SITE_ID; // Project ID from environment
const token = process.env.NETLIFY_AUTH_TOKEN; // Personal Access Token from environment

async function GetAnalyticKeyDirectories(store) {
  const { directories } = await store.list({
    prefix: PREFIX || undefined,
    directories: true,
  });

  if (!Array.isArray(directories)) {
    throw new Error("Error reading keys from blob storage.");
  }

  return directories;
}

async function mapKeysToJson(
  siteStore,
  keys,
  consistency = "eventual"
) {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const value = await siteStore.get(key, { type: "json", consistency });
        return [key, value]; // value can be object | array | null
      } catch (e) {
        return [key, null]; // failed to parse or missing
      }
    })
  );
  return Object.fromEntries(entries);
}

exports.handler = async (event, context) => {

  // In production you can usually omit opts; locally you need them to read live data.
  const opts = siteID && token ? { siteID, token, name: STORE } : undefined;

  const siteStore = opts ? getStore(opts) : getStore(STORE);

  // Handle GET requests
  const directories = (await GetAnalyticKeyDirectories(siteStore)).map((x) =>
    x.slice(0, -1)
  );

  const results = await mapKeysToJson(
    siteStore,
    directories.map((x) => `${x}/analytics.json`)
  );

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(
      {
        store: STORE,
        results,
      },
      null,
      2
    ),
  };
};