/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  generateBls12381G2KeyPair,
  blsSign,
  blsVerify,
  blsCreateProof,
  blsVerifyProof,
} from "@mattrglobal/node-bbs-signatures";

// npm i --save bs58
import {encode} from "bs58"

const main = async (): Promise<void> => {
  const bs58 = require('bs58');

  //Generate a new key pair
  const keyPair = await generateBls12381G2KeyPair();

  console.log("=====Key pair 64=====");
  console.log(`Public key base64 = ${Buffer.from(keyPair.publicKey).toString("base64")}`);
  console.log(`Private key base64 = ${Buffer.from(keyPair.secretKey).toString("base64")}`);
  console.log("=====================\n")

  console.log("\n=====Key pair 58=====")
  console.log(bs58.encode(keyPair.publicKey));
  console.log(bs58.encode(keyPair.secretKey));
  console.log("=====================\n\n")
  
  
  //Set of messages we wish to sign
  const messages = [
    Uint8Array.from(Buffer.from("message1", "utf-8")),
    Uint8Array.from(Buffer.from("message2", "utf-8")),
  ];

  console.log("Signing a message set of " + messages);

  //Create the signature
  const signature = await blsSign({
    keyPair,
    messages: messages,
  });

  console.log(`Output signature base64 = ${Buffer.from(signature).toString("base64")}`);

  //Verify the signature
  const isVerified = await blsVerify({
    publicKey: keyPair.publicKey,
    messages: messages,
    signature,
  });

  const isVerifiedString = JSON.stringify(isVerified);
  console.log(`Signature verified ? ${isVerifiedString}`);

  //Derive a proof from the signature revealing the first message
  const proof = await blsCreateProof({
    signature,
    publicKey: keyPair.publicKey,
    messages,
    nonce: Uint8Array.from(Buffer.from("nonce", "utf-8")),
    revealed: [0],
  });

  console.log(`Output proof base64 = ${Buffer.from(proof).toString("base64")}`);

  //Verify the created proof
  const isProofVerified = await blsVerifyProof({
    proof,
    publicKey: keyPair.publicKey,
    messages: messages.slice(0, 1),
    nonce: Uint8Array.from(Buffer.from("nonce", "utf-8")),
  });

  const isProofVerifiedString = JSON.stringify(isProofVerified);
  console.log(`Proof verified ? ${isProofVerifiedString}`);
};

main();
