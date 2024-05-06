import express from 'express';
import {
  generateBls12381G2KeyPair,

} from "@mattrglobal/bbs-signatures";
import crypto from 'crypto';
// Créer un routeur express
const router = express.Router();

router.get('/', async (req, res)=> {
    res.send('Node.js API for key generation');
})
router.post('/generate_bls_keypair', async (req, res) => {
    const keyPair = await generateBls12381G2KeyPair();
    console.log("Key pair generated successfully.");
    console.log("Public key:", keyPair.publicKey);
    console.log("Private key:", keyPair.secretKey);
    res.status(200).json({ "publicKey": keyPair.publicKey.toString(), "privateKey": keyPair.secretKey.toString()});
});


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
