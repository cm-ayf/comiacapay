import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { EncryptJWT, SignJWT, importJWK, jwtDecrypt, jwtVerify } from "jose";
import type { JWTPayload, KeyLike } from "jose";
import type { TokenSet } from "./tokenset";
import { env } from "@/app/(api)/env";
import { host } from "@/shared/host";

type Keys = Record<
  "signKey" | "verifyKey" | "encryptKey" | "decryptKey",
  KeyLike | Uint8Array
>;

declare global {
  var _keys: Keys | Promise<Keys>;
}

const jwsAlg = "ES256";
const jweAlg = "ECDH-ES+A256KW";

async function initKeys() {
  if (global._keys) return global._keys;

  const { publicJWK, privateJWK } = JSON.parse(env.KEY_PAIR);
  const [signKey, verifyKey, encryptKey, decryptKey] = await Promise.all([
    importJWK(privateJWK, jwsAlg),
    importJWK(publicJWK, jwsAlg),
    importJWK(publicJWK, jweAlg),
    importJWK(privateJWK, jweAlg),
  ]);
  return (global._keys = { signKey, verifyKey, encryptKey, decryptKey });
}

export async function signSession(sub: string) {
  const { signKey } = await initKeys();
  return await new SignJWT({})
    .setProtectedHeader({ alg: jwsAlg })
    .setIssuedAt()
    .setIssuer(host.href)
    .setAudience(host.href)
    .setExpirationTime("2h")
    .setSubject(sub)
    .setJti(crypto.randomUUID())
    .sign(signKey);
}

export async function verifySession(token: string) {
  const { verifyKey } = await initKeys();
  const { payload } = await jwtVerify<Required<JWTPayload>>(token, verifyKey);
  return payload;
}

export async function encryptTokenSet(
  tokenResult: RESTPostOAuth2AccessTokenResult,
) {
  const { encryptKey } = await initKeys();
  return await new EncryptJWT({ ...tokenResult })
    .setProtectedHeader({ alg: jweAlg, enc: "A256GCM" })
    .setIssuedAt()
    .setIssuer(host.href)
    .setAudience(host.href)
    .setExpirationTime(`${tokenResult.expires_in}s`)
    .encrypt(encryptKey);
}

export async function decryptTokenSet(token: string) {
  const { decryptKey } = await initKeys();
  const { payload } = await jwtDecrypt(token, decryptKey);
  return payload as TokenSet;
}
