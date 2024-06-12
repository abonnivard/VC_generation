/**
 * Fichier JavaScript pour la gestion des Verifiable Credentials (VC) - signature, verification...
 */


import {
  generateBls12381G2KeyPair,
  blsSign,
  blsVerify,
  blsCreateProof,
  blsVerifyProof,
} from "@mattrglobal/bbs-signatures";


// Prédicat pour vérifier si l'étudiant est toujours étudiant
function isStillStudent(yearOfGraduation) {
    const currentDate = new Date();
    const graduationDate = new Date(yearOfGraduation);
    return currentDate < graduationDate;
}

/**
 * Vérifie la validité des paramètres d'un Verifiable Credential (VC).
 * @param {object} vcPayload - Objet représentant le Verifiable Credential à vérifier.
 * @returns {boolean} - Retourne true si tous les paramètres requis sont présents et valides, sinon false.
 */
export function verifyVcParams(vcPayload) {

    // Vérifier la présence de tous les champs requis dans vcPayload
    if (vcPayload && typeof vcPayload === 'object') {
        // Vérifie la présence des champs requis et leurs types
        if (
            '@context' in vcPayload &&
            typeof vcPayload['@context'] === 'object' &&
            'id' in vcPayload &&
            typeof vcPayload['id'] === 'number' &&
            'type' in vcPayload &&
            Array.isArray(vcPayload['type']) &&
            'issuer' in vcPayload &&
            typeof vcPayload['issuer'] === 'string' &&
            'issuanceDate' in vcPayload &&
            validateIso8601Date(vcPayload['issuanceDate']) &&
            'credentialSubject' in vcPayload &&
            typeof vcPayload['credentialSubject'] === 'object' &&
            'id' in vcPayload['credentialSubject'] &&
            typeof vcPayload['credentialSubject']['id'] === 'number' &&
            'degree' in vcPayload['credentialSubject'] &&
            typeof vcPayload['credentialSubject']['degree'] === 'string' &&
            'university' in vcPayload['credentialSubject'] &&
            typeof vcPayload['credentialSubject']['university'] === 'object' &&
            'id' in vcPayload['credentialSubject']['university'] &&
            typeof vcPayload['credentialSubject']['university']['id'] === 'string' &&
            'name' in vcPayload['credentialSubject']['university'] &&
            typeof vcPayload['credentialSubject']['university']['name'] === 'string' &&
            'year_of_graduation' in vcPayload['credentialSubject'] &&
            validateIso8601Date(vcPayload['credentialSubject']['year_of_graduation'])
        ) {
            return true;  // Tous les paramètres requis sont présents et valides
        }
    }
    return false;  // Certains paramètres requis sont manquants ou invalides
}

function getNestedValue(obj, path) {
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc && acc[key], obj);
}

// Fonction pour valider le format de la date au format ISO 8601
function validateIso8601Date(dateString) {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[-+]\d{2}:\d{2})$/;
    return iso8601Regex.test(dateString);
}

/**
 * Signe un Verifiable Credential (VC) avec une preuve de signature.
 * @async
 * @param {object} vcPayload - Objet représentant le Verifiable Credential à signer.
 * @param {Uint8Array} secretKey - Clé privée utilisée pour la signature.
 * @param {Uint8Array} publicKey - Clé publique associée à la clé privée.
 * @returns {Promise<object>} - Retourne un objet représentant le Verifiable Credential signé avec la preuve de signature.
 * @throws {Error} - Lance une erreur en cas d'échec de la signature.
 */
export async function signVc(vcPayload, secretKey, publicKey) {
    try {
        // Convertir le VC payload en JSON
        const vcPayloadJson = JSON.stringify(vcPayload);

        const keyPair = {
            publicKey: Uint8Array.from(publicKey),
            secretKey: Uint8Array.from(secretKey)
        };



         const isStudent = isStillStudent(vcPayload['credentialSubject']['year_of_graduation']);


        const attributes= [
            Uint8Array.from(Buffer.from(vcPayloadJson, "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['university']['name'], "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['degree'], "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['year_of_graduation'], "utf-8")),
            Uint8Array.from(Buffer.from(isStudent.toString(), "utf-8")),

        ]


        // Effectuer la signature BLS
        const signature = await blsSign({
            keyPair,
            messages: attributes,
        });

        // Créer une preuve de signature
        const proof = await blsCreateProof({
            signature,
            publicKey: keyPair.publicKey,
            messages: attributes,
            nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
            revealed : [0]
        });

        console.log(proof)


        // Créer le VC signé
        const signedVc = {
            ...vcPayload,
            proof: proof,
            signature: signature,
        };
        return signedVc;
    } catch (error) {
        console.error('Error signing VC:', error);
        throw new Error('Failed to sign VC');
    }
}



/**
 * Vérifie la signature d'un Verifiable Credential (VC) donné.
 * @async
 * @param {object} vcPayload - Objet représentant le Verifiable Credential à vérifier.
 * @param {Uint8Array} signature - Signature à vérifier.
 * @param {string} issuerPublicKey - Clé publique de l'émetteur du VC.
 * @param {string[]} revealedAttributes - Attributs révélés lors de la vérification.
 * @returns {Promise<boolean>} - Retourne true si la signature est valide et que les attributs révélés sont vérifiés, sinon false.
 * @throws {Error} - Lance une erreur en cas d'échec de la vérification de la signature.
 */
export async function verifyVcSignature(vcPayload, signature, issuerPublicKey, revealedAttributes) {


    const proof = vcPayload.proof;
    delete vcPayload.proof;
    delete vcPayload.signature;

     const isStudent = isStillStudent(vcPayload['credentialSubject']['year_of_graduation']);

    // Initialiser un tableau pour stocker les valeurs
    const signaturebitArray = [];

    // Parcourir chaque propriété de l'objet et ajouter sa valeur au tableau
    for (const key in signature) {
        if (Object.hasOwnProperty.call(signature, key)) {
            const value = signature[key];
            signaturebitArray.push(value);
        }
    }

    // Initialiser un tableau pour stocker les valeurs
    const proofbitArray = [];

    // Parcourir chaque propriété de l'objet et ajouter sa valeur au tableau
    for (const key in proof) {
        if (Object.hasOwnProperty.call(proof, key)) {
            const value = proof[key];
            proofbitArray.push(value);
        }
    }

    const vcPayloadJson = JSON.stringify(vcPayload);
    const publicKeyArray = issuerPublicKey.split(',');

    // Convertir chaque sous-chaîne en nombre
    const publicKeyBytes = publicKeyArray.map(byteStr => parseInt(byteStr, 10));

    const keyPair = {
            publicKey: publicKeyBytes,
            signature: Uint8Array.from(signaturebitArray),
            proof: Uint8Array.from(proofbitArray)
        };


    const attributes= [
            Uint8Array.from(Buffer.from(vcPayloadJson, "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['university']['name'], "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['degree'], "utf-8")),
            Uint8Array.from(Buffer.from(vcPayload['credentialSubject']['year_of_graduation'], "utf-8")),
            Uint8Array.from(Buffer.from(isStudent.toString(), "utf-8")),
        ]

    // Vérifier la signature BLS
    const isVerified = await blsVerify({
        messages:  attributes,
        publicKey: Uint8Array.from(Buffer.from(keyPair.publicKey)),
        signature : Uint8Array.from(Buffer.from(keyPair.signature)),
    });



    let a, b, numAttributes;
    switch (revealedAttributes[0]) {
        case 'institution':
            a = 1;
            b = 2;
            numAttributes = 1;
            break;
        case 'title':
            a = 2;
            b = 3;
            numAttributes = 2;

            break;
        case 'year':
            a = 3;
            b = 4;
            numAttributes = 3;

            break;
        case 'student':
            a= 4;
            b= 5;
            numAttributes = 4;
        default:
            a = 0;
            b = 1;
            numAttributes = 0;
            break;
    }


    //Create a derivate proof from the signature and the attribute we want to reveal
        const newproof = await blsCreateProof({
            signature: keyPair.signature,
            publicKey: Uint8Array.from(keyPair.publicKey),
            messages: attributes,
            nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
            revealed : [numAttributes]
        });

    //Verify the derivate proof
    const isProofVerified = await blsVerifyProof({
      proof: newproof,
      publicKey: Uint8Array.from(Buffer.from(keyPair.publicKey)),
      messages: attributes.slice(a,b),
      nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
    });



    if (numAttributes === 4){
        return isVerified.verified && isProofVerified.verified && isStudent;
    }
    else {
        return isVerified.verified && isProofVerified.verified;
    }
}
