/**
 * Ce fichier définit un routeur Express pour une API Node.js permettant de signer des Jetons de Crédential Vérifiable (VC).
 * Utilise les bibliothèques 'express' et 'jsonwebtoken'.
 *
 * Crée un routeur express pour gérer les demandes de signature de VC.
 */

import express from 'express';
import jwt from 'jsonwebtoken';

// Créer un routeur express
const router = express.Router();

/**
 * Route permettant de signer un Jeton de Crédential Vérifiable (VC).
 * @route POST /sign-vc
 * @group Signature VC
 * @param {object} data_to_sign.body.required - Les données à signer pour le VC.
 * @param {string} private_key.body.required - La clé privée utilisée pour signer le VC.
 * @returns {object} 200 - Jeton de Crédential Vérifiable (VC) signé.
 * @returns {string} .signed_vc - Jeton de Crédential Vérifiable (VC) signé.
 * @returns {Error} 500 - Erreur lors de la signature du VC.
 */
router.post('/sign-vc', async (req, res) => {
    try {
        // Données reçues du client
        const vcPayload = req.body.data_to_sign;
        const privateKey = req.body.private_key;

        // Créer le token JWT
        const token = jwt.sign(vcPayload, privateKey);

        // Envoyer le token signé en réponse
        res.json({ signed_vc: token });
    } catch (error) {
        console.error('Error signing VC:', error);
        res.status(500).json({ error: 'Failed to sign VC' });
    }
});

// Exporter le routeur
export default router;
