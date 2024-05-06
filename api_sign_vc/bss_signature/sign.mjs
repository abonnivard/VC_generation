import express from 'express';
import { signVc, verifyVcSignature, verifyVcParams } from './function.mjs';
import axios from "axios";
const router = express.Router();


router.get("/", (req, res)=> {
    res.status(200).json({message:"Module de signature de VC JSON-LD ZKP with BSS+"})
});



router.post('/:sign-vc', async (req, res) => {
    try {
        const vcPayload = req.body.data_to_sign;
        const privateKey = req.body.private_key;
        const publicKey = req.body.public_key;
        const sessionNumber = vcPayload.session_number;

         const publicKeyArray = publicKey.split(',');
         const privatekeyArray = privateKey.split(',');

        // Convertir chaque sous-chaîne en nombre
        const publicKeyBytes = publicKeyArray.map(byteStr => parseInt(byteStr, 10));
        const privatekeyBytes = privatekeyArray.map(byteStr => parseInt(byteStr, 10));

        // Vérifier si le numéro de session existe en appelant la vue Django
        const response = await  axios.get(`http://127.0.0.1:8000/check-session-number-signature/${sessionNumber}`);
        const data = await response.data.session_exists;
        console.log(data);

        if (data) {
            // Numéro de session existe, signer le VC

            if (verifyVcParams(vcPayload)) {
                const signedVc = await signVc(vcPayload, privatekeyBytes, publicKeyBytes);
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


router.post('/:verify-vc', async (req, res) => {
    try {
        // Données reçues du client
        const vcPayload = req.body.data_to_verify;
        const proof = req.body.proof;
        console.log(vcPayload)

        // Vérifier que chaque paramètre du VC est correct
        if (verifyVcParams(vcPayload)) {
            // Vérifier la signature du VC
            verifyVcSignature(vcPayload, proof)
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
            console.log("VC parameters verification failed.");
            res.status(400).json({ error: "VC parameters verification failed." });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});


export default router;



