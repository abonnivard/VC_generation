import IndySdk from 'indy-sdk';
import fs from 'fs';

/**
 * Fonction asynchrone pour émettre un VC avec une signature ZKP CL.
 *
 * @param {number} walletHandle - Identifiant du portefeuille.
 * @param {string} schemaId - ID du schéma utilisé.
 * @param {string} credDefId - ID de la définition de crédit utilisée.
 * @param {string} revRegId - ID du registre de révocation utilisé.
 * @param {object} requestJson - Demande de crédit JSON.
 * @returns {Promise<object>} Objet contenant le VC JSON et la preuve JSON.
 */
export async function issueCLSignatureVC(walletHandle, schemaId, credDefId, revRegId, requestJson) {
    // 1. Création du credential
    const credentialOffer = await IndySdk.issuerCreateCredentialOffer(walletHandle, credDefId);
    const credentialRequestJson = requestJson;  // Remplacer par la vraie demande de credential JSON

    const [credentialJson, , ] = await IndySdk.issuerCreateCredential(
        walletHandle, credentialOffer, credentialRequestJson, {}, null, null
    );

    // 2. Génération de la preuve ZKP CL
    const proofJson = await IndySdk.proverCreateProof(
        walletHandle, credentialRequestJson, credentialJson, {}, null
    );

    return { credentialJson, proofJson };
}

/**
 * Fonction asynchrone pour vérifier un VC avec une signature ZKP CL.
 *
 * @param {object} proofJson - Preuve JSON à vérifier.
 * @param {object} schemaJson - Schéma JSON utilisé pour la vérification.
 * @param {object} credentialDefJson - Définition de crédit JSON utilisée pour la vérification.
 * @returns {Promise<boolean>} Indique si la vérification de la preuve a réussi ou non.
 */
export async function verifyCLSignatureVC(proofJson, schemaJson, credentialDefJson) {
    // 1. Vérification de la preuve ZKP CL
    const valid = await IndySdk.verifierVerifyProof(
        proofRequest, proofJson, schemaJson, credentialDefJson, {}, {}, {}
    );

    return valid;
}

/**
 * Fonction asynchrone pour initialiser l'environnement Indy.
 * @returns {Promise<*>}
 */
export async function initIndyEnvironment() {
    // Ouvrir le pool de nœuds Indy
    const poolName = 'nom_du_pool_indy';
    const poolGenesisTxnPath = 'chemin/vers/le/fichier_genesis.txn';
    await IndySdk.openPoolLedger(poolName, poolGenesisTxnPath);

    // Ouvrir le portefeuille Indy
    const walletConfig = { id: 'nom_du_portefeuille', storage_type: 'default' };
    const walletCredentials = { key: 'mot_de_passe_du_portefeuille' };
    const walletHandle = await IndySdk.openWallet(walletConfig, walletCredentials);

    return walletHandle;
}


/**
 * Fonction asynchrone pour créer un portefeuille Indy.
 * @returns {Promise<*>}
 */
export async function createIndyWallet() {
    // Spécifier le nom et le mot de passe du portefeuille
    const walletName = 'VC_project_wallet';
    const walletPassword = 'telecom_sudparis_password';

    // Créer un fichier de sauvegarde pour le portefeuille
    const walletConfig = { id: walletName, storage_type: 'default' };
    const walletCredentials = { key: walletPassword };
    const walletHandle = await IndySdk.createWallet(walletConfig, walletCredentials);

    // Sauvegarder le handle du portefeuille dans un fichier
    const walletHandleFilePath = 'fichier_portefeuille_handle.txt';
    fs.writeFileSync(walletHandleFilePath, walletHandle.toString());

    console.log('Portefeuille Indy créé avec succès.');
    return walletHandle;
}

/**
 * Fonction principale pour démontrer l'émission et la vérification d'un VC avec une signature ZKP CL.
 */
async function main() {
    try {
        const walletHandle = await initIndyEnvironment();
        console.log('Environnement Indy initialisé avec succès.');
        // Vous pouvez maintenant effectuer d'autres opérations Indy avec le handle du portefeuille
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'environnement Indy :", error);
        try {
            const walletHandle = await createIndyWallet();
            console.log('Portefeuille Indy créé avec succès.');
            // Vous pouvez maintenant effectuer d'autres opérations Indy avec le handle du portefeuille

        } catch (error) {
            console.error("Erreur lors de la création du portefeuille Indy :", error);
        }
    }
    // Création du VC
    const { credentialJson, proofJson } = await issueCLSignatureVC(walletHandle, schemaId, credDefId, revRegId, requestJson);

    // Vérification du VC
    const isValid = await verifyCLSignatureVC(proofJson, schemaJson, credentialDefJson);
    console.log("VC est-il valide ?", isValid);
}

// Lancer l'application
main();


