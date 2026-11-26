import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../..');
const TEMPLATE_PATH = resolve(ROOT_DIR, 'firestore.rules.template');
const OUTPUT_PATH = resolve(ROOT_DIR, 'firestore.rules');
const LOCAL_ENV_PATH = resolve(ROOT_DIR, '.env.local');
const AUTHORIZED_UIDS_PLACEHOLDER = '__AUTHORIZED_UIDS__';
const FIREBASE_UID_PATTERN = /^[A-Za-z0-9]{1,128}$/;

const isFirebaseUid = (uid) => FIREBASE_UID_PATTERN.test(uid ?? '');

/**
 * The owner always has access. The maintainer is an optional second account used for support;
 * leaving MAINTAINER_UID empty takes that access away on the next deploy.
 */
export function renderRules(ownerUid, maintainerUid) {
  if (!isFirebaseUid(ownerUid)) {
    throw new Error('OWNER_UID ausente ou inválido. Defina-o no .env.local ou no ambiente.');
  }
  const hasMaintainer = Boolean(maintainerUid);
  if (hasMaintainer && !isFirebaseUid(maintainerUid)) {
    throw new Error('MAINTAINER_UID inválido. Corrija-o ou deixe-o vazio no .env.local.');
  }
  if (hasMaintainer && maintainerUid === ownerUid) {
    throw new Error('MAINTAINER_UID não pode ser igual ao OWNER_UID.');
  }
  const authorizedUids = hasMaintainer ? [ownerUid, maintainerUid] : [ownerUid];
  const uidList = `[${authorizedUids.map((uid) => `'${uid}'`).join(', ')}]`;
  return readFileSync(TEMPLATE_PATH, 'utf8').replaceAll(AUTHORIZED_UIDS_PLACEHOLDER, uidList);
}

function main() {
  if (existsSync(LOCAL_ENV_PATH)) process.loadEnvFile(LOCAL_ENV_PATH);
  const { OWNER_UID, MAINTAINER_UID } = process.env;
  writeFileSync(OUTPUT_PATH, renderRules(OWNER_UID, MAINTAINER_UID));
  const maintainerNote = MAINTAINER_UID ? ' com a conta de manutenção' : ' sem conta de manutenção';
  process.stdout.write(`firestore.rules gerado a partir de ${TEMPLATE_PATH}${maintainerNote}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
