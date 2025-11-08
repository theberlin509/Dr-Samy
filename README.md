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

**Ceci est le point de défaillance le plus courant. Veuillez suivre attentivement ces étapes.**

Lorsque vous déployez votre projet sur Vercel, vous **devez** configurer votre clé API Gemini dans les paramètres du projet pour que le backend fonctionne.

1.  **Allez sur le tableau de bord de votre projet sur Vercel.**
2.  **Naviguez vers Settings > Environment Variables.**
3.  **Ajoutez une nouvelle variable :**
    *   **Name:** `API_KEY` (Le nom doit être exact, en majuscules).
    *   **Value:** Collez votre clé API Google Gemini ici.
    *   **Type:** Laissez "Secret".
    *   Assurez-vous qu'elle est disponible pour tous les environnements (Production, Preview, Development).
4.  **Sauvegardez la variable.**
5.  **ÉTAPE CRITIQUE : Redéployez votre projet.** Vous devez déclencher un nouveau déploiement pour que les modifications prennent effet. Allez dans l'onglet "Deployments" et redéployez le dernier commit.

#### Dépannage : Erreur `API key is not configured on the server`

Si vous voyez cette erreur, cela signifie que votre fonction Vercel ne trouve pas la variable `API_KEY`. Voici une liste de contrôle :

-   **Vérifiez les fautes de frappe :** Le nom de la variable est-il exactement `API_KEY` ? Les erreurs courantes sont `APIKEY`, `API_Key`, ou `GEMINI_API_KEY`.
-   **Avez-vous redéployé ?** Un nouveau déploiement est nécessaire après avoir ajouté ou modifié des variables d'environnement.
-   **Vérifiez les logs Vercel :** Allez sur le tableau de bord de votre projet, cliquez sur l'onglet "Logs", et sélectionnez votre fonction serverless (par exemple, `/api/chat`). Vous devriez y voir un message d'erreur plus détaillé.

## Run Locally

**Prerequisites:** Node.js

1.  Set up your `.env.local` file as described above.
2.  Install dependencies:
   `npm install`
3.  Run the app:
   `npm run dev`