import express from 'express';
import cors from 'cors';
import bss from './bss_signature/sign.mjs';
import jwt from './jwt-signature/sign.mjs';
import bss_verify from './bss_signature/verify.mjs';
import jwt_verify from './jwt-signature/verify.mjs';
import generate_keypair from './key_generation/generate.mjs';
import ld from './LD_signature/sign.mjs'
import zkp_cl from './zkp-cl/sign.mjs'
const app = express();
const PORT = 3000;

app.use(express.json()); // Analyser les données JSON du corps des requêtes
app.use(cors({
  origin: 'https://w3id.org',
}));
app.use('/bss', bss);
app.use('/jwt', jwt);
app.use('/bbs_verify', bss_verify);
app.use('/jwt_verify', jwt_verify);
app.use('/generate_keypair', generate_keypair);
app.use('/ld', ld);
app.use('/zkp-cl', zkp_cl);
app.get('/', (req, res) => {
  res.send('Node.js API for VC signature');
});

// Lancer le serveur sur le port spécifié
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


