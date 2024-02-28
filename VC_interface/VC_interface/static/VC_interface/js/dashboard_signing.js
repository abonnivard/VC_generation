document.addEventListener("DOMContentLoaded", function() {
    const downloadButtons = document.querySelectorAll(".download-key-btn");

    downloadButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const private_key = this.getAttribute("data-private");
            const public_key = this.getAttribute("data-public");
            const name = this.getAttribute("data-key-name");
            const keyData = `Private Key:\n ${private_key}\n\nPublic Key:\n ${public_key}`;

            // Créer un objet Blob avec les données
            const blob = new Blob([keyData], { type: "text/plain" });

            // Créer un objet URL à partir du Blob
            const url = window.URL.createObjectURL(blob);

            // Créer un élément <a> pour le téléchargement du fichier
            const a = document.createElement("a");
            a.href = url;
            a.download = `key_pair_${name}.txt`;
            document.body.appendChild(a);

            // Cliquez sur le lien pour télécharger le fichier
            a.click();

            // Supprimer l'élément <a> après le téléchargement
            document.body.removeChild(a);

            // Révoquer l'URL de l'objet Blob
            window.URL.revokeObjectURL(url);
        });
    });
});
