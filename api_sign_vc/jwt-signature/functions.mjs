import { decodeJWT } from 'did-jwt';

// Fonction de vérification de VC JWT interne au site sans utiliser le résolveur
export async function verifyInternalVcJwt(signedVc) {
    try {
        // Décoder le JWT pour accéder à ses informations
        const decoded = decodeJWT(signedVc);
        console.log('JWT Decoded:\n', decoded);

        // Vérifier que le JWT contient un contenu valide
        if (!decoded.payload) {
            throw new Error('Invalid JWT content');
        }

        // Ajoutez ici vos propres vérifications personnalisées
        // Par exemple, vous pouvez vérifier la signature en fonction de la clé publique associée

        // Si toutes les vérifications réussissent, renvoyer le contenu du JWT
        return decoded.payload;
    } catch (error) {
        console.error('Error verifying VC:', error);
        throw new Error('Failed to verify VC');
    }
}

export default verifyInternalVcJwt;