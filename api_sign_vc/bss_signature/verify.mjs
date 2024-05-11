/**
 * Fichier pour la vérification de la signature d'un Verifiable Credential (VC) en BBS+.
 */


import express from 'express';
import { signVc, verifyVcSignature, verifyVcParams } from './function.mjs';
import axios from 'axios';

// Créer un routeur Express
const router = express.Router();

// Middleware pour analyser les corps de requête JSON
router.use(express.json());

/**
 * Renvoie un message indiquant le module de signature de VC JSON-LD ZKP with BSS+.
 * @route GET /
 * @returns {object} 200 - Message indiquant le module de signature de VC JSON-LD ZKP with BSS+.
 */
router.get("/", (req, res) => {
    res.status(200).json({ message: "Module de signature de VC JSON-LD ZKP with BSS+" });
});

/**
 * Route pour vérifier un Verifiable Credential (VC).
 * @route POST /verify-vc
 * @param {object} vc.body.required - Le Verifiable Credential à vérifier.
 * @param {object} vc.proof - La preuve de signature du VC.
 * @param {string} vc.issuer - La clé publique de l'émetteur du VC.
 * @param {string} vc.signature - La signature du VC.
 * @param {string[]} revealedAttributes.body.required - Attributs révélés lors de la vérification.
 * @returns {object} 200 - Message indiquant la vérification réussie de la signature du VC.
 * @returns {object} .message - Message indiquant la vérification réussie de la signature du VC.
 * @returns {Error} 400 - Échec de la vérification des paramètres du VC.
 * @returns {Error} 404 - Numéro de session introuvable.
 * @returns {Error} 500 - Échec de la vérification de la signature du VC ou traitement de la demande.
 */
router.post('/verify-vc', async (req, res) => {
    try {
        const vcPayloadString = req.body.vc;
        const vcPayload = JSON.parse(vcPayloadString);
        const proof = vcPayload.proof;
        const issuerPublicKey = vcPayload.issuer;
        const signature = vcPayload.signature;
        const revealedAttributes = req.body.revealedAttributes;

        // Vérifier que chaque paramètre du VC est correct
        if (verifyVcParams(vcPayload)) {
            // Récupérer le numéro de session du VC
            const sessionNumber = vcPayload.session_number;

            // Vérifier si le numéro de session existe
            const response = await axios.get(`http://127.0.0.1:8000/check-session-number-verification/${sessionNumber}`);
            const sessionExists = response.data.session_exists;
            if (sessionExists) {

                // Vérifier la signature du VC uniquement si le numéro de session existe
                verifyVcSignature(vcPayload, signature, issuerPublicKey, revealedAttributes)
                    .then((verified) => {
                        if (verified) {
                            console.log("VC signature verified successfully.");
                            res.json({ message: "VC signature verified successfully." });
                        } else {
                            console.log("VC signature verification failed.");
                            res.status(500).json({ error: "VC signature verification failed." });
                        }
                    })
                    .catch((error) => {
                        console.error("Error verifying VC signature:", error);
                        res.status(500).json({ error: "Error verifying VC signature." });
                    });
            } else {
                console.log("Session number not found.");
                res.status(404).json({ error: "Session number not found." });
            }
        } else {
            console.log("VC parameters verification failed.");
            res.status(400).json({ error: "VC parameters verification failed." });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Exporter le routeur
export default router;
