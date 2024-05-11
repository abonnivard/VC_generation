/**
 * Ce fichier définit un routeur Express pour une API Node.js permettant de vérifier des Jetons de Crédential Vérifiable (VC JWT).
 * Utilise la bibliothèque 'express'.
 *
 * Importe également une fonction personnalisée de vérification du VC JWT depuis 'functions.mjs'.
 */

import express from 'express';
import verifyInternalVcJwt from './functions.mjs'; // Importez la fonction personnalisée de vérification du VC JWT

// Créer un routeur express
const router = express.Router();

/**
 * Route permettant de vérifier un Jeton de Crédential Vérifiable (VC).
 * @route POST /verify-vc
 * @group Vérification VC
 * @param {string} vc.body.required - Le Jeton de Crédential Vérifiable (VC) à vérifier.
 * @returns {object} 200 - Résultat de la vérification du VC.
 * @returns {boolean} .verified - Booléen indiquant si le VC est vérifié avec succès.
 * @returns {Error} 500 - Erreur lors de la vérification du VC.
 */
router.post('/verify-vc', async (req, res) => {
    console.log(req.body)
    try {
        // Récupérer le VC signé depuis la requête
        const signedVc = req.body.vc;
        console.log(signedVc)

        // Vérifier le VC en utilisant la fonction personnalisée
        const result = await verifyInternalVcJwt(signedVc);

        // Renvoyer le résultat de la vérification
        res.json({ verified: result });
    } catch (error) {
        console.error('Error verifying VC:', error);
        res.status(500).json({ error: 'Failed to verify VC' });
    }
});

// Exporter le routeur
export default router;
