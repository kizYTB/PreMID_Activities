# Netic

Netic is an intelligent AI assistant powered by Ollama, created by Jtheberg. This PreMiD activity displays your current activity on Netic in Discord.

## Features

- **Real-time Activity Tracking**: Shows when you're chatting with Netic AI
- **Conversation Titles**: Displays the title of your current conversation (when enabled)
- **Admin Detection**: Special status when accessing admin pages
- **Loading States**: Shows connection status during chat loading
- **Automatic Updates**: Refreshes conversation data every minute

## Activity Display

### Default States
- **Homepage**: "Visite la page d'accueil - Découvrez Netic AI"
- **Login Page**: "Page de connexion - Se connecte à Netic"
- **Chat Page**: "En conversation - Discute avec l'IA Netic"
- **Admin Page**: "Administration - Gère Netic AI"
- **Loading**: "Chargement du chat - Connexion à Netic..."

### With Conversation Titles Enabled
When the "Afficher le titre de la conversation" setting is enabled, chat pages will show:
- **"En conversation - [Conversation Title]"**

## Settings

### Afficher le titre de la conversation
- **Type**: Boolean
- **Default**: `true`
- **Description**: Shows the title of your current conversation instead of generic text
- **Note**: Titles are automatically detected from Netic's API

### Show timestamp
- **Type**: Boolean
- **Default**: `true`
- **Description**: Displays elapsed time since you started using Netic

## Supported Pages

- `netic.jtheberg.cloud` - Main Netic website
- `netic.jtheberg.cloud/login` - Login page
- `netic.jtheberg.cloud/chat` - Chat interface
- `netic.jtheberg.cloud/admin` - Admin panel

## Technical Details

### Data Sources
- **API Monitoring**: Intercepts Netic's API calls to detect conversation IDs
- **DOM Analysis**: Fallback method for title detection
- **Performance Optimized**: Updates every minute to avoid spam
- **Cross-Origin Safe**: Uses only Netic's own APIs

### Privacy
- Only accesses Netic's public APIs
- No data is sent to external services
- Conversation content is never read or transmitted
- Only conversation titles are extracted for display

## Troubleshooting

### Activity not showing titles
1. Ensure "Afficher le titre de la conversation" is enabled in settings
2. Refresh the Netic page to allow API detection
3. Wait up to 1 minute for the first title update

### Console logs
The activity provides debug logs (visible in browser console):
- `🔍 [Netic] Recherche active du titre...` - Title search in progress
- `✅ [Netic] Titre trouvé dans le cache: "Title"` - Title found
- `🔄 [Netic] Liste conversations mise à jour` - API data updated

### Performance issues
- The activity updates every 60 seconds maximum
- No continuous API polling
- Minimal DOM queries

## Contributing

This activity is maintained by kiz_off. For issues or suggestions:
- Report bugs on the [PreMiD Activities repository](https://github.com/PreMiD/Activities)
- Check existing issues before creating new ones

## License

This PreMiD activity is licensed under the Mozilla Public License 2.0.