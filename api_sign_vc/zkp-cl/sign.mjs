import express from 'express';
const router = express.Router();


router.get("/", (req, res)=> {
    res.status(200).json({message:"Module de signature de VC ZKP-CL"})
});





router.post('/sign-vc', async (req, res) => {
    try {
        // Extraire le Verifiable Credential (VC) payload du corps de la requête
        const vcPayload = req.body.data_to_sign;
        const private_key = req.body.private_key;
        const public_key = req.body.public_key;

    }catch (e) {
        console.error(e);
        res.status(500).json({message: "Erreur lors de la signature du VC ZKP-CL"})
    }
});

export default router;
