/**
 * GeoIP & User-Agent parsing utility.
 * Extracts client IP, geographic location, browser, OS, and device type
 * from an incoming Express request object.
 */

const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

/**
 * Determine the real client IP from the request.
 * Handles proxies and the common X-Forwarded-For header.
 *
 * @param {import("express").Request} req
 * @returns {string} The raw IP address string
 */
const extractIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list; take the first (original client)
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

/**
 * Returns parsed client information including IP, geo-location, browser, OS, and device.
 *
 * @param {import("express").Request} req
 * @returns {{
 *   ip: string,
 *   city: string,
 *   country: string,
 *   location: string,
 *   browser: string,
 *   os: string,
 *   device: string
 * }}
 */
const getClientInfo = (req) => {
  const ip = extractIP(req);

  // --- Geo-location ---
  let city = "Unknown";
  let country = "Unknown";
  let location = "Unknown";

  const localIPs = ["::1", "127.0.0.1", "::ffff:127.0.0.1"];
  if (localIPs.includes(ip)) {
    city = "Local";
    country = "Development";
    location = "Local Development";
  } else {
    const geo = geoip.lookup(ip);
    if (geo) {
      city = geo.city || "Unknown City";
      country = geo.country || "Unknown Country";
      location = `${city}, ${country}`;
    }
  }

  // --- User-Agent parsing ---
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const browserName = result.browser?.name || "Unknown Browser";
  const browserVersion = result.browser?.major || "";
  const browser = browserVersion
    ? `${browserName} ${browserVersion}`
    : browserName;

  const osName = result.os?.name || "Unknown OS";
  const osVersion = result.os?.version || "";
  const os = osVersion ? `${osName} ${osVersion}` : osName;

  // Determine device type
  let device = "desktop";
  if (result.device?.type) {
    device = result.device.type; // e.g. "mobile", "tablet", "console", etc.
  }

  return { ip, city, country, location, browser, os, device };
};

module.exports = { getClientInfo };
