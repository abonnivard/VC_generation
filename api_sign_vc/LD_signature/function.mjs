import jsonld from 'jsonld-signatures';
import fetch from 'node-fetch';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';


const customDocumentLoader = async (url) => {
    if (url === 'https://w3id.org/security/suites/ed25519-2020/v1') {
        return {
            contextUrl: null,
            document: {
                "@context": {
                    "@version": 1.1,
                    "id": "@id",
                    "type": "@type",
                    "Ed25519VerificationKey2020": {
                        "@id": "https://w3id.org/security#Ed25519VerificationKey2020",
                        "@context": {
                            "@version": 1.1,
                            "id": "@id",
                            "type": "@type",
                            "controller": { "@id": "https://w3id.org/security#controller", "@type": "@id" },
                            "publicKeyBase58": "https://w3id.org/security#publicKeyBase58"
                        }
                    },
                    "Ed25519Signature2020": {
                        "@id": "https://w3id.org/security#Ed25519Signature2020",
                        "@context": {
                            "@version": 1.1,
                            "id": "@id",
                            "type": "@type",
                            "creator": { "@id": "https://w3id.org/security#creator", "@type": "@id" },
                            "created": { "@id": "https://schema.org/dateCreated", "@type": "http://www.w3.org/2001/XMLSchema#dateTime" },
                            "proofPurpose": { "@id": "https://w3id.org/security#proofPurpose", "@type": "@id" },
                            "verificationMethod": { "@id": "https://w3id.org/security#verificationMethod", "@type": "@id" },
                            "jws": "https://w3id.org/security#jws"
                        }
                    }
                }
            },
            documentUrl: url
        };
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Impossible de récupérer le document à l'URL : ${url}`);
    }
    return {
        contextUrl: null,
        document: await response.json(),
        documentUrl: url
    };
};

/**
 * Signe un VC (Verifiable Credential) avec LD Signature.
 * @param {object} vcPayload - Les données du VC à signer.
 * @param {string} privateKey - La clé privée utilisée pour signer le VC.
 * @param {string} publicKey - La clé publique utilisée pour la signature.
 * @returns {Promise<object>} - Une promesse résolue avec le VC signé.
 */
export async function signVC(vcPayload, privateKeyB58, publicKeyB58) {
    console.log('Signature du VC avec LD Signature...');
    try {


        const publicKey = {
              '@context': jsonld.SECURITY_CONTEXT_URL,
              type: 'Ed25519VerificationKey2020',
              id: 'https://example.com/i/alice/keys/2',
              controller: 'https://example.com/i/alice',
              publicKeyB58
            };
        // specify the public key controller object
        const controller = {
          '@context': jsonld.SECURITY_CONTEXT_URL,
          id: 'https://example.com/i/alice',
          publicKey: [publicKey],
          // this authorizes this key to be used for authenticating
          authentication: [publicKey.id]
        };


        const keyPair = await Ed25519VerificationKey2020.generate({
            id : 'https://example.com/i/alice/keys/2',
            controller,
            }
        );


        const suite = new Ed25519Signature2020({
            key: keyPair,
            verificationMethod: publicKey.id
        });

        const {AuthenticationProofPurpose} = jsonld.purposes;
            const signed = await jsonld.sign(vcPayload, {
                suite,
                purpose: new AuthenticationProofPurpose({
                challenge: 'abc',
                domain: 'example.com'
              }),
                documentLoader: customDocumentLoader
            });

        // sign the document for the purpose of authentication

        return signed;
    } catch (error) {
        console.error('Erreur lors de la signature du VC :', error);
        throw new Error('Impossible de signer le VC');
    }
}

/**
 * Vérifie la signature d'un VC signé avec LD Signature.
 * @param {object} signedVc - Le VC signé à vérifier.
 * @param {string} publicKey - La clé publique utilisée pour vérifier la signature.
 * @returns {Promise<boolean>} - Une promesse résolue avec true si la signature est valide, sinon false.
 */
export async function verifyVC(signedVc, publicKey) {
    try {
        const isValid = await jsonld.verify(signedVc, {
            publicKeyPem: publicKey
        });
        return isValid;
    } catch (error) {
        console.error('Erreur lors de la vérification du VC :', error);
        throw new Error('Impossible de vérifier le VC');
    }
}
