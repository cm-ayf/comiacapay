// @ts-check
import { exportJWK, generateKeyPair } from "jose";

const { publicKey, privateKey } = await generateKeyPair("ES256");
const [publicJWK, privateJWK] = await Promise.all([
  exportJWK(publicKey),
  exportJWK(privateKey),
]);
console.log(`KEY_PAIR='${JSON.stringify({ publicJWK, privateJWK })}`);
