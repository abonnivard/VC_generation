/**
 * Fichier JavaScript pour la signature et la verification des Verifiable Credentials (VC) en BBS+.
 */

import express from 'express';
import { signVc, verifyVcSignature, verifyVcParams } from './function.mjs';
import axios from "axios";

// Créer un routeur Express
const router = express.Router();

/**
 * Renvoie un message indiquant le module de signature de VC JSON-LD ZKP with BSS+.
 * @route GET /
 * @returns {object} 200 - Message indiquant le module de signature de VC JSON-LD ZKP with BSS+.
 */
router.get("/", (req, res)=> {
    res.status(200).json({message:"Module de signature de VC JSON-LD ZKP with BSS+"})
});

/**
 * Route pour signer un Verifiable Credential (VC).
 * @route POST /sign-vc
 * @param {object} data_to_sign.body.required - Les données à signer pour le VC.
 * @param {string} private_key.body.required - La clé privée utilisée pour signer le VC.
 * @param {string} public_key.body.required - La clé publique associée à la clé privée.
 * @returns {object} 200 - Verifiable Credential (VC) signé.
 * @returns {object} .signed_vc - Verifiable Credential (VC) signé.
 * @returns {Error} 400 - Échec de la vérification des paramètres du VC ou numéro de session inexistant.
 * @returns {Error} 500 - Échec de la signature du VC ou traitement de la demande.
 */
router.post('/:sign-vc', async (req, res) => {
    try {
        const vcPayload = req.body.data_to_sign;
        const privateKey = req.body.private_key;
        const publicKey = req.body.public_key;
        const sessionNumber = vcPayload.session_number;

        const publicKeyArray = publicKey.split(',');
        const privateKeyArray = privateKey.split(',');

        // Convertir chaque sous-chaîne en nombre
        const publicKeyBytes = publicKeyArray.map(byteStr => parseInt(byteStr, 10));
        const privateKeyBytes = privateKeyArray.map(byteStr => parseInt(byteStr, 10));

        // Vérifier si le numéro de session existe en appelant la vue Django
        const response = await axios.get(`http://127.0.0.1:8000/check-session-number-signature/${sessionNumber}`);
        const data = await response.data.session_exists;

        if (data) {
            // Numéro de session existe, signer le VC
            if (verifyVcParams(vcPayload)) {
                const signedVc = await signVc(vcPayload, privateKeyBytes, publicKeyBytes);
                console.log("VC signed successfully.");
                res.json({ signed_vc: signedVc });
            } else {
                console.log("VC parameters verification failed.");
                res.status(400).json({ error: "VC parameters verification failed." });
            }
        } else {
            // Numéro de session n'existe pas
            console.log("Session number does not exist.");
            res.status(400).json({ error: "Session number does not exist." });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});


// Exporter le routeur
export default router;
