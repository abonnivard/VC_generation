import express from 'express';
import cors from 'cors';
import bss from './bss_signature/sign.mjs';
import jwt from './jwt-signature/sign.mjs';

const app = express();
const PORT = 3000;

app.use(express.json()); // Analyser les données JSON du corps des requêtes
app.use(cors({
  origin: 'https://w3id.org',
}));
app.use('/bss', bss);
app.use('/jwt', jwt);

app.get('/', (req, res) => {
  res.send('Node.js API for VC signature');
});

// Lancer le serveur sur le port spécifié
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


