import express from 'express';
import {createIndyWallet, initIndyEnvironment, issueCLSignatureVC} from "./functions.mjs";
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

        try {
            const walletHandle = await initIndyEnvironment();
            console.log('Environnement Indy initialisé avec succès.');
            // Vous pouvez maintenant effectuer d'autres opérations Indy avec le handle du portefeuille
        } catch (error) {
            console.error("Erreur lors de l'initialisation de l'environnement Indy :", error);
            try {
                const walletHandle = await createIndyWallet();
                console.log('Portefeuille Indy créé avec succès.');
                // Vous pouvez maintenant effectuer d'autres opérations Indy avec le handle du portefeuille

            } catch (error) {
                console.error("Erreur lors de la création du portefeuille Indy :", error);
            }
        }

        const { credentialJson, proofJson } = await issueCLSignatureVC(walletHandle, schemaId, credDefId, revRegId, requestJson);
        console.log(credentialJson, proofJson)

        // Vérification du VC
        const isValid = await verifyCLSignatureVC(proofJson, schemaJson, credentialDefJson);
        console.log("VC est-il valide ?", isValid);
        res.json(credentialJson);
    }catch (error) {
        console.error('Erreur lors de la signature du VC:', error);
        res.status(500).json({ error: 'Échec de la signature du VC' });
    }
});

export default router;
