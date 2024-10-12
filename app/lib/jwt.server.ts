import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { EncryptJWT, SignJWT, importJWK, jwtDecrypt, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { env } from "./env.server";
import { host } from "./host";
import type { TokenSet } from "./oauth2.server";

const jwsAlg = "ES256";
const jweAlg = "ECDH-ES+A256KW";

const { publicJWK, privateJWK } = JSON.parse(env.KEY_PAIR);
const [signKey, verifyKey, encryptKey, decryptKey] = await Promise.all([
  importJWK(privateJWK, jwsAlg),
  importJWK(publicJWK, jwsAlg),
  importJWK(publicJWK, jweAlg),
  importJWK(privateJWK, jweAlg),
]);

export async function signSession(sub: string) {
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
  const { payload } = await jwtVerify<Required<JWTPayload>>(token, verifyKey);
  return payload;
}

export async function encryptTokenSet(
  tokenResult: RESTPostOAuth2AccessTokenResult,
) {
  return await new EncryptJWT({ ...tokenResult })
    .setProtectedHeader({ alg: jweAlg, enc: "A256GCM" })
    .setIssuedAt()
    .setIssuer(host.href)
    .setAudience(host.href)
    .setExpirationTime(`${tokenResult.expires_in}s`)
    .encrypt(encryptKey);
}

export async function decryptTokenSet(token: string) {
  const { payload } = await jwtDecrypt(token, decryptKey);
  return payload as TokenSet;
}
