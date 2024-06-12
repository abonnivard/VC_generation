import express from 'express';
import { signVC } from './function.mjs';

const router = express.Router();

router.post('/sign-vc', async (req, res) => {
    try {
        // Extract VC payload from request body
        const vcPayload = req.body.data_to_sign;
        const privateKey = req.body.private_key;
        const publicKey = req.body.public_key;

        // Sign the VC payload
        const signedVc = await signVC(vcPayload, privateKey, publicKey);

        // Send the signed VC back as response
        res.json(signedVc);
    } catch (error) {
        console.error('Error signing VC:', error);
        res.status(500).json({ error: 'Failed to sign VC' });
    }
});

export default router;
