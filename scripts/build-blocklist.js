#!/usr/bin/env node
/**
 * build-blocklist.js
 * Parses EasyList/EasyPrivacy filter files and generates a compact
 * resources/blocklist.json with domain sets for fast lookup.
 */

const fs = require('fs')
const path = require('path')

const resourcesDir = path.join(__dirname, '..', 'resources')

const inputFiles = [
  path.join(resourcesDir, 'easylist_adservers.txt'),
  path.join(resourcesDir, 'easyprivacy_trackers.txt'),
]

const domainSet = new Set()
const keywordPatterns = new Set()

for (const file of inputFiles) {
  if (!fs.existsSync(file)) continue
  const lines = fs.readFileSync(file, 'utf-8').split('\n')
  
  for (const rawLine of lines) {
    const line = rawLine.trim()
    
    // Skip comments, empty, cosmetic rules, option-only lines
    if (!line || line.startsWith('!') || line.startsWith('[') || 
        line.startsWith('##') || line.startsWith('#@#') ||
        line.startsWith('@@') || line.includes('##')) continue

    // Domain pattern: ||example.com^
    const domainMatch = line.match(/^\|\|([a-z0-9._-]+)\^/)
    if (domainMatch) {
      domainSet.add(domainMatch[1].toLowerCase())
      continue
    }

    // Keyword pattern: /ads/ or _ad. etc — short patterns only
    const keywordMatch = line.match(/^\/([a-z0-9_-]{3,20})\/$/)
    if (keywordMatch) {
      keywordPatterns.add(keywordMatch[1])
    }
  }
}

// Add curated high-signal patterns not in domain lists
const curatedPatterns = [
  'googleads', 'doubleclick', 'pagead2', 'googlesyndication',
  'adservice.google', 'youtube.com/api/stats/ads', 'youtube.com/get_midroll_info',
  'analytics.google', 'google-analytics', 'mixpanel', 'segment.io',
  'adnxs', 'adsystem', 'adserver', 'advertising', 'scorecardresearch',
  'demdex.net', 'omtrdc.net', '2mdn.net', 'admob', 'amazon-adsystem',
  'moatads', 'chartbeat', 'hotjar', 'fullstory', 'mouseflow',
  'tealiumiq', 'quantserve', 'krxd.net', 'openx.net', 'rubiconproject',
  'pubmatic', 'appnexus', 'criteo', 'yieldlab', 'smartadserver',
  'taboola', 'outbrain', 'zemanta', 'revcontent', 'mgid'
]

const output = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  domains: Array.from(domainSet),
  patterns: [...Array.from(keywordPatterns), ...curatedPatterns]
}

const outputPath = path.join(resourcesDir, 'blocklist.json')
fs.writeFileSync(outputPath, JSON.stringify(output), 'utf-8')

console.log(`✅ Blocklist built:`)
console.log(`   ${output.domains.length.toLocaleString()} domains`)
console.log(`   ${output.patterns.length} keyword patterns`)
console.log(`   → ${outputPath}`)
