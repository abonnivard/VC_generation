import { customDocumentLoader } from './function.mjs'
import express from 'express';
import jsonld from 'jsonld-signatures';



const router = express.Router();

router.post('/sign-vc', async (req, res) => {
    try {
        // Extract VC payload from request body
        const vcPayload = req.body.data_to_sign;
        const private_key = req.body.private_key;
        const public_key = req.body.public_key;


        // Sign the VC payload
        const signedVc = await jsonld.sign(vcPayload, {
            algorithm: 'Ed25519Signature2018',
            privateKey: private_key,
            creator: public_key,
            encoding: 'utf-8',
            domain: 'example.com', // Specify your domain
            documentLoader: customDocumentLoader,
        });

        // Send the signed VC back as response
        res.json(signedVc);
    } catch (error) {
        console.error('Error signing VC:', error);
        res.status(500).json({ error: 'Failed to sign VC' });
    }
});

export default router;