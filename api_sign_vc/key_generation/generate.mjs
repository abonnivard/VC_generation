/**
 * Ce fichier définit un routeur Express pour une API Node.js permettant de générer des paires de clés BLS12381G2 et Ed25519.
 * Utilise les bibliothèques 'express', '@mattrglobal/bbs-signatures' et 'crypto'.
 */

import express from 'express';
import {
  generateBls12381G2KeyPair,
} from "@mattrglobal/bbs-signatures";
import crypto from 'crypto';

// Créer un routeur express
const router = express.Router();

/**
 * Route permettant d'accéder à la racine de l'API.
 * @route GET /
 * @group Clés
 * @returns {string} 200 - Message de confirmation de l'accès à l'API
 */
router.get('/', async (req, res)=> {
    res.send('Node.js API for key generation');
})

/**
 * Route permettant de générer une paire de clés BLS12381G2.
 * @route POST /generate_bls_keypair
 * @group Clés - Génération de clés BLS12381G2
 * @returns {object} 200 - Clés BLS12381G2 générées avec succès
 * @returns {Error} 500 - Erreur lors de la génération des clés BLS12381G2
 */
router.post('/generate_bls_keypair', async (req, res) => {
    const keyPair = await generateBls12381G2KeyPair();
    console.log("Key pair generated successfully.");
    console.log("Public key:", keyPair.publicKey);
    console.log("Private key:", keyPair.secretKey);
    res.status(200).json({ "publicKey": keyPair.publicKey.toString(), "privateKey": keyPair.secretKey.toString()});
});

/**
 * Route permettant de générer une paire de clés Ed25519.
 * @route POST /generate_ed25519_keypair
 * @group Clés - Génération de clés Ed25519
 * @returns {object} 200 - Clés Ed25519 générées avec succès
 * @returns {Error} 500 - Erreur lors de la génération des clés Ed25519
 */
router.post('/generate_ed25519_keypair', (req, res) => {
    console.log('reach')
    try {
        // Générer une paire de clés Ed25519
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

        // Convertir les clés en format base64
        const privateKeyBase64 = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');
        const publicKeyBase64 = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');

        // Envoyer la paire de clés au client
        res.status(200).json({ "privateKey": privateKeyBase64, "publicKey": publicKeyBase64 });
    } catch (error) {
        console.error('Erreur lors de la génération de la paire de clés Ed25519:', error);
        res.status(500).json({ error: 'Erreur lors de la génération de la paire de clés Ed25519' });
    }
});

// Exporter le routeur
export default router;
