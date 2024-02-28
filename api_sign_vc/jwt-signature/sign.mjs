import express from 'express';
import jwt from 'jsonwebtoken';

import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/3764b03d20384386b97c9d7b37937766'));

// Créer un routeur express
const router = express.Router();


router.get('/',(req,res) => {
        res.status(200).json({message:"Module de signature de VC JSON JWT"})
});

// Route pour recevoir les données et signer le VC
router.post('/sign-vc', (req, res) => {
    try {
        // Récupérer les données envoyées depuis la fonction view Django
        const data = req.body;
        const vc = data.data_to_sign.credentialSubject;
        const private_key = data.private_key;
        const issuer_uuid = data.issuer_uuid;
        const issuer_did = data.issuer_did;
        console.log(issuer_did)
        // Créer le VC JSON
        console.log(vc)
        // Signer le VC avec JWT
        const token = jwt.sign(vc, private_key,
            {
                algorithm: 'RS256',
                header: {
                    kid: issuer_did,
                    typ: 'vc+jwt',
                }
            });

        const providerConfig = {
          rpcUrl: 'https://mainnet.infura.io/v3/3764b03d20384386b97c9d7b37937766',
            registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b', // etherum mainnet registry adress
        };
        const ethrDidResolver = getResolver(providerConfig);
        const resolver = new Resolver(ethrDidResolver);

        const did = 'did:ethr:0x64B19e79CE832987B62A78AC97532bEF1bFC0Afa';
        resolver.resolve(did).then((doc) => console.log(doc));



        // Envoyer la réponse avec le VC signé
        res.json({ signed_vc: token });
    } catch (error) {
        console.error('Error signing VC:', error);
        res.status(500).json({ error: 'Failed to sign VC' });
    }
});

// Exporter le routeur
export default router;
