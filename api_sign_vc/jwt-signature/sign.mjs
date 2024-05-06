import express from 'express';
import jwt from 'jsonwebtoken';

// Créer un routeur express
const router = express.Router();

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
