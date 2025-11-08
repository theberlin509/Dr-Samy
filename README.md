
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dr Samy - AI Medical Pre-diagnosis Assistant

This contains everything you need to run your app locally and deploy it to Vercel.

View your app in AI Studio: https://ai.studio/apps/drive/1dQ4zPesw4Jg1OC4lrP54wqACsVDSeZg4

## Environment Variable Setup

This project requires your Google Gemini API key to function.

### For Local Development

1.  Create a file named `.env.local` in the root of your project.
2.  Add the following variable to the file, replacing the placeholder value with your actual key:

    ```bash
    # Your Google Gemini API Key (used by the backend)
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

### For Vercel Deployment

**Ceci est le point de défaillance le plus courant. Votre capture d'écran montre que vous êtes très proche de la solution !**

Le problème n'est pas votre code, mais une nuance dans la configuration de Vercel. Il semble que votre variable `API_KEY` a été **créée** mais n'est pas **liée (connectée)** à votre projet.

Suivez ces étapes précises :

1.  **Allez sur le tableau de bord de votre projet sur Vercel.**
2.  **Naviguez vers `Settings` > `Environment Variables`.**
3.  **Trouvez votre variable `API_KEY` existante.** Cliquez sur les trois points (`...`) à droite et sélectionnez **`Edit`**.
4.  **Liez la variable au projet :**
    *   Cherchez la section **`Link To Projects`**.
    *   Cliquez dans le champ de recherche et **tapez le nom de votre projet** (ex: `dr-samy`).
    *   **Sélectionnez votre projet dans la liste déroulante.**
    *   Une fois sélectionné, le nom de votre projet devrait apparaître comme une étiquette.
5.  **Vérifiez les environnements :** Assurez-vous que les cases `Production`, `Preview`, et `Development` sont cochées.
6.  Cliquez sur **`Save`**.
7.  **ÉTAPE CRITIQUE : Redéployez votre projet.** Vous devez déclencher un nouveau déploiement. Allez dans l'onglet `Deployments` et redéployez le dernier commit.

Une fois ces étapes terminées, votre application aura enfin accès à la clé API.

#### Vérification finale

Pour être 100% sûr que tout fonctionne, utilisez l'outil de débogage que nous avons ajouté :

1.  Ouvrez votre navigateur et allez à l'URL suivante : `https://VOTRE_URL_VERCEL.app/api/check-env`.
2.  Le message devrait maintenant être : **`✅ La variable d'environnement API_KEY est configurée avec succès.`**

Si cela fonctionne, votre application fonctionnera également.

## Run Locally

**Prerequisites:** Node.js

1.  Set up your `.env.local` file as described above.
2.  Install dependencies:
   `npm install`
3.  Run the app:
   `npm run dev`
