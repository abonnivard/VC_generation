import express from 'express';
const router = express.Router();

import * as bbs2023Cryptosuite from '@digitalbazaar/bbs-2023-cryptosuite';
import * as bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import * as vc from '@digitalbazaar/vc';
import {createSignCryptosuite} from '@digitalbazaar/bbs-2023-cryptosuite';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';




router.get("/", (req, res)=> {
    res.status(200).json({message:"Module de signature de VC JSON-LD ZKP with BSS+"})
})

// Route pour recevoir les données et signer le VC
router.post('/:sign-vc', async (req, res) => {
  try {
    // Données reçues du client
    const credential = req.body.data_to_sign;
    const private_rsa_key = req.body.private_key;
    const issuer_uuid = req.body.issuer_uuid;

    // Générer la paire de clés BBS+
    const bbsKeyPair = await bls12381Multikey.generateBbsKeyPair({
      algorithm: 'BBS-BLS12-381-SHA-256',
      id: 'http://127.0.0.1:8000/issuer_details/issuer_id='+issuer_uuid,
      controller: 'http://127.0.0.1:8000/issuer_details/issuer_id='+issuer_uuid
    });

    console.log(bbsKeyPair)



    // Configuration de la suite BBS-2023 pour la signature VC
    const suite = new DataIntegrityProof({
      signer: bbsKeyPair.signer(),
      cryptosuite: createSignCryptosuite({
        mandatoryPointers: [
        ]
      })
    });

    console.log(credential)

    // Signature du VC
    const signedVC = await vc.issue({ credential, suite});

    // Envoyer la réponse avec le VC signé
    res.json(signedVC);
  } catch (error) {
    console.error('Error signing VC:', error);
    res.status(500).json({ error: 'Failed to sign VC' });
  }
});

export default router;
