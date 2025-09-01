// netlify/functions/analytics.ts
import { Context } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

// Tune these to your setup
const STORE = "site-analytics";
const PREFIX = ""; // e.g. "data/" if your keys are under a folder
const siteID = null; // Project ID from Netlify UI
const token = null; // Personal Access Token

async function GetAnalyticKeyDirectories(store: Store) {
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
  siteStore: Store,
  keys: string[],
  consistency: "eventual" | "strong" = "eventual"
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const value = await siteStore.get(key, { type: "json", consistency });
        return [key, value] as const; // value can be object | array | null
      } catch (e) {
        return [key, null] as const; // failed to parse or missing
      }
    })
  );
  return Object.fromEntries(entries);
}

export default async (req: Request, ctx: Context) => {
  // In production you can usually omit opts; locally you need them to read live data.
  const opts = siteID && token ? { siteID, token, name: STORE } : undefined;

  const siteStore = opts ? getStore(opts) : getStore(STORE);

  // Handle GET requests
  const directories = (await GetAnalyticKeyDirectories(siteStore)).map((x) =>
    x.slice(0, -1)
  );

  const results = await mapKeysToJson(
    siteStore,
    directories.map((x: any) => `${x}/analytics.json`)
  );

  return new Response(
    JSON.stringify(
      {
        store: STORE,
        results,
      },
      null,
      2
    ),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    }
  );
};
