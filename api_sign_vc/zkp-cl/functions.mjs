import { anoncreds, ledger } from '@hyperledger/anoncreds-nodejs';
import { IndyVdrAnonCredsRegistry } from '@aries-framework/indy-vdr';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';

/**
 * Crée un nouveau wallet.
 * @param {string} walletName - Le nom du wallet.
 * @param {string} walletKey - La clé de chiffrement du wallet.
 * @returns {Promise<string>} - Une promesse qui résout avec l'identifiant du wallet créé.
 */
export async function createWallet(walletName, walletKey) {
    await ariesAskar.init();
    const walletConfig = { id: walletName };
    const walletCredentials = { key: walletKey };

    await ariesAskar.createWallet(walletConfig, walletCredentials);

    return walletName;
}



/**
 * Crée un nouveau schéma avec les attributs spécifiés et le publie sur le ledger.
 * @param {string} schemaName - Le nom du schéma.
 * @param {string} schemaVersion - La version du schéma.
 * @param {Array<string>} attributes - Liste des attributs du schéma.
 * @returns {Promise<void>} - Une promesse résolue une fois que le schéma est créé et publié avec succès.
 */
export async function createSchema(schemaName, schemaVersion, attributes) {
    // Créer le schéma
    const schema = await anoncreds.issuer.createSchema(schemaName, schemaVersion, attributes);

    // Publier le schéma sur le ledger
    await ledger.submitSchema(schema, 'issuer_did', 'issuer_wallet_handle');
}

/**
 * Crée une nouvelle définition de credential pour un schéma spécifié et la publie sur le ledger.
 * @param {string} schemaId - L'identifiant du schéma pour lequel créer la définition de credential.
 * @param {string} tag - Le tag pour la définition de credential.
 * @returns {Promise<void>} - Une promesse résolue une fois que la définition de credential est créée et publiée avec succès.
 */
export async function createCredentialDefinition(schemaId, tag) {
    // Créer la définition de credential
    const credDef = await anoncreds.issuer.createAndStoreCredentialDef('wallet_handle', 'issuer_did', schemaId, tag, 'CL', {
        support_revocation: false // Indique si la revocation est supportée ou non
    });

    // Publier la définition de credential sur le ledger
    await ledger.submitCredentialDefinition(credDef, 'issuer_did', 'issuer_wallet_handle');
}

/**
 * Crée et signe un VC avec une signature ZKP CL.
 * @param {string} schemaId - L'identifiant du schéma utilisé pour le VC.
 * @param {string} credDefId - L'identifiant de la définition de credential utilisée pour le VC.
 * @param {string} revRegId - L'identifiant du registre de révocation utilisé pour le VC.
 * @param {object} credentialValues - Les valeurs des attributs du VC.
 * @returns {Promise<object>} - Une promesse qui résout avec le VC signé.
 */
export async function issueCLSignatureVC(schemaId, credDefId, revRegId, credentialValues) {
    // Créer le credential
    const credential = await anoncreds.issuer.createCredential(schemaId, credDefId, credentialValues, revRegId);

    // Signer le credential
    const signedCredential = await anoncreds.prover.signCredential(credential, 'your_private_key');

    return signedCredential;
}

/**
 * Vérifie la signature d'un VC signé avec une signature ZKP CL.
 * @param {object} signedCredential - Le VC signé à vérifier.
 * @returns {Promise<boolean>} - Une promesse qui résout avec true si la signature est valide, sinon false.
 */
export async function verifyCLSignatureVC(signedCredential) {
    // Vérifier la signature du credential
    const isValid = await anoncreds.verifier.verifyCredentialSignature(signedCredential, 'issuer_public_key');

    return isValid;
}

// Exemple d'utilisation
async function main() {
    // Définir les paramètres du schéma, de la définition de credential et de la revocation registry
    const schemaId = 'your_schema_id';
    const credDefId = 'your_credential_definition_id';
    const revRegId = 'your_revocation_registry_id';

    // Générer les valeurs des attributs du VC
    const credentialValues = {
        "attr1": "value1",
        "attr2": "value2",
        // Ajoutez d'autres attributs selon votre schéma
    };

    // Émettre le VC et signer le credential
    const signedCredential = await issueCLSignatureVC(schemaId, credDefId, revRegId, credentialValues);

    // Vérifier la signature du VC
    const isValid = await verifyCLSignatureVC(signedCredential);
    console.log("VC est-il valide ?", isValid);
}

main();
