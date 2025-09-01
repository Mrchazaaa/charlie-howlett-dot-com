#!/usr/bin/env node

import { getStore } from "@netlify/blobs";
import { readFileSync, writeFileSync } from "fs";
import path from "path";


function ReadFileIfExists(filepath)
{
    console.log(`Attempting to read file ${filepath}`)

    if (filepath == null)
    {
        return null;
    }

    console.log(`Reading file ${filepath}`)

    return JSON.parse(readFileSync(filepath, "utf-8"));
}

async function UploadToNetlifyBlobs(analyticsReport)
{
    const timestamp = analyticsReport.time;

    if (timestamp == null) {  // true for both null and undefined
        throw new Error("Timestamp must not be null or undefined");
    }

    const STORE = "site-analytics";
    const PREFIX = timestamp;

    var siteID = process.env.NETLIFY_SITE_ID;
    var token = process.env.NETLIFY_AUTH_TOKEN;

    // In production you can usually omit opts; locally you need them to read live data.
    const opts = siteID && token ? { siteID, token, name: STORE } : undefined;

    const siteStore = opts ? getStore(opts) : getStore(STORE);

    await siteStore.setJSON(`${PREFIX}/analytics.json`, analyticsReport);
}

// Read in arguments (--webPackAnalyticsReportPath --lighthouseReportPaths)
const args = process.argv.slice(2);

const parsedArgs = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
    parsedArgs[key] = value;
  }
}

console.log(`Reading lighthouse reports input: ${parsedArgs.lighthouseReportPaths}`)
console.log(`Reading webpack report input: ${parsedArgs.webpackAnalyticsReportPath}`)

// Read in reports from dist/
const inputlighthouseReports = parsedArgs.lighthouseReportPaths.split(";").map(x => ReadFileIfExists(x, "utf-8")) ?? [];

const inputWebpackAnalyticsReport = ReadFileIfExists(parsedArgs.webpackAnalyticsReportPath, "utf-8");

// transform into analyticsReport
var analyticsReport = {}

analyticsReport.lighthouseReports = []

for (var i = 0; i < inputlighthouseReports.length; i++)
{
    var lighthouseReport = {}
    var inputLighthouseReport = inputlighthouseReports[i]

    lighthouseReport.formFactory = inputLighthouseReport.configSettings.formFactor
    lighthouseReport.performance = inputLighthouseReport.categories.performance.score
    lighthouseReport.accessibility = inputLighthouseReport.categories.accessibility.score
    lighthouseReport.bestPractices = inputLighthouseReport.categories["best-practices"].score
    lighthouseReport.seo = inputLighthouseReport.categories.seo.score
    lighthouseReport.largestContentfulPaint = inputLighthouseReport.audits["largest-contentful-paint"].numericValue
    lighthouseReport.totalByteWeight = inputLighthouseReport.audits["total-byte-weight"].numericValue

    analyticsReport.lighthouseReports[i] = lighthouseReport
}

if (inputWebpackAnalyticsReport != null)
{
    const assets = inputWebpackAnalyticsReport.assets || [];

    const jsAssets = assets.filter(asset => asset.name.endsWith('.js'));
    const cssAssets = assets.filter(asset => asset.name.endsWith('.css'));
    const htmlAssets = assets.filter(asset => asset.name.endsWith('.html'));
    const imageAssets = assets.filter(asset =>
      asset.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
    );
    const otherAssets = assets.filter(asset =>
      !asset.name.match(/\.(html|js|css|png|jpg|jpeg|gif|svg|webp)$/i)
    );

    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = jsAssets.reduce((sum, asset) => sum + asset.size, 0);
    const cssSize = cssAssets.reduce((sum, asset) => sum + asset.size, 0);
    const htmlSize = htmlAssets.reduce((sum, asset) => sum + asset.size, 0);
    const imageSize = imageAssets.reduce((sum, asset) => sum + asset.size, 0);
    const otherSize = otherAssets.reduce((sum, asset) => sum + asset.size, 0);

    const sizeBreakdown = {
      total: {
        bytes: totalSize
      },
      javascript: {
        bytes: jsSize,
        percentage: Math.round(jsSize / totalSize * 100 * 10) / 10,
        files: jsAssets.map(x => x.name)
      },
      css: {
        bytes: cssSize,
        percentage: Math.round(cssSize / totalSize * 100 * 10) / 10,
        files: cssAssets.map(x => x.name)
      },
      images: {
        bytes: imageSize,
        percentage: Math.round(imageSize / totalSize * 100 * 10) / 10,
        files: imageAssets.map(x => x.name)
      },
      html: {
        bytes: htmlSize,
        percentage: Math.round(htmlSize / totalSize * 100 * 10) / 10,
        files: htmlAssets.map(x => x.name)
      },
      other: {
        bytes: otherSize,
        percentage: Math.round(otherSize / totalSize * 100 * 10) / 10,
        files: otherAssets.map(x => x.name)
      }
    };

    analyticsReport.WebpackAnalyticsReport = {
      buildTimeSeconds: inputWebpackAnalyticsReport.time,
      sizeBreakdown,
    }

    analyticsReport.time = new Date().toISOString();
}

const outputPath = './analyticsReport.json';
const resolvedPath = path.resolve(outputPath);
// const relativePath = path.relative(process.cwd(), resolvedPath);

// console.log(JSON.stringify({ reportPath: relativePath }));

writeFileSync(resolvedPath, JSON.stringify(analyticsReport, null, 2));

// Upload AnalyticsReport.json to netlify blobs
await UploadToNetlifyBlobs(analyticsReport)