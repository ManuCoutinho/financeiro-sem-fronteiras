import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../..');
const TEMPLATE_PATH = resolve(ROOT_DIR, 'firestore.rules.template');
const OUTPUT_PATH = resolve(ROOT_DIR, 'firestore.rules');
const LOCAL_ENV_PATH = resolve(ROOT_DIR, '.env.local');
const OWNER_UID_PLACEHOLDER = '__OWNER_UID__';
const FIREBASE_UID_PATTERN = /^[A-Za-z0-9]{1,128}$/;

export function renderRules(ownerUid) {
  if (!FIREBASE_UID_PATTERN.test(ownerUid ?? '')) {
    throw new Error('OWNER_UID ausente ou inválido. Defina-o no .env.local ou no ambiente.');
  }
  return readFileSync(TEMPLATE_PATH, 'utf8').replaceAll(OWNER_UID_PLACEHOLDER, ownerUid);
}

function main() {
  if (existsSync(LOCAL_ENV_PATH)) process.loadEnvFile(LOCAL_ENV_PATH);
  writeFileSync(OUTPUT_PATH, renderRules(process.env.OWNER_UID));
  process.stdout.write(`firestore.rules gerado a partir de ${TEMPLATE_PATH}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
