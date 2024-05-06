import express from 'express';
const router = express.Router();

router.get('/:did', async (req, res) => {
    const did = req.params.did;
    try {
        const url = `http://127.0.0.1:8000/.well-known/${did}/did.json`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            res.status(404).json({ error: `DID document not found for DID: ${did}` });
        }
    } catch (error) {
        console.error(`Error resolving DID ${did}:`, error);
        res.status(500).json({ error: `Error resolving DID ${did}` });
    }
});

export default router;
