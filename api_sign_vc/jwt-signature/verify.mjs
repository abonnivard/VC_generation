import express from 'express';
import verifyInternalVcJwt from './functions.mjs'; // Importez la fonction personnalisée de vérification du VC JWT

// Créer un routeur express
const router = express.Router();

// Route pour vérifier le VC
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
