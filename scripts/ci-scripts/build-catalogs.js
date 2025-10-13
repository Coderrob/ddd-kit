#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');
const STANDARDS_DIR = path.join(ROOT, 'reference', 'standards');
const TECH_DIR = path.join(ROOT, 'reference', 'tech');
const TEMPLATES_DIR = path.join(ROOT, 'docs', 'templates');
const REGISTRY_PATH = path.join(STANDARDS_DIR, 'catalogs', 'registry.json');
const ALIASES_PATH = path.join(STANDARDS_DIR, 'catalogs', 'aliases.json');

function extractFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch (e) {
    console.error('Failed to parse front-matter:', e.message);
    return null;
  }
}

function scanDirectory(dir, registry, aliases) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanDirectory(fullPath, registry, aliases);
    } else if (file.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const frontMatter = extractFrontMatter(content);
      if (frontMatter && frontMatter.uid) {
        const relativePath = path.relative(ROOT, fullPath);
        registry[frontMatter.uid] = {
          path: relativePath,
          status: frontMatter.status || 'draft',
          sha: 'placeholder', // TODO: compute SHA
          aliases: frontMatter.aliases || [],
          requires: frontMatter.requires || [],
        };
        if (frontMatter.aliases) {
          for (const alias of frontMatter.aliases) {
            aliases[alias] = frontMatter.uid;
          }
        }
      }
    }
  }
}

function buildCatalogs() {
  const registry = {};
  const aliases = {};

  scanDirectory(STANDARDS_DIR, registry, aliases);
  scanDirectory(TECH_DIR, registry, aliases);
  scanDirectory(TEMPLATES_DIR, registry, aliases);

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  fs.writeFileSync(ALIASES_PATH, JSON.stringify(aliases, null, 2));

  console.log('Catalogs built successfully');
}

if (require.main === module) {
  buildCatalogs();
}

module.exports = { buildCatalogs };
