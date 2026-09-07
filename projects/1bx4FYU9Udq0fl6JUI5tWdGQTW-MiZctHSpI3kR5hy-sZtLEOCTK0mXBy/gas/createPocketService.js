function CreatePocketService() {
  OAuth2.createService('drive')

    // Set the endpoint URLs, which are the same for all Google services.
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')

    // Set the client ID and secret, from the Google Developers Console.
    .setClientId('...')
    .setClientSecret('...')

    // Set the name of the callback function in the script referenced
    // above that should be invoked to complete the OAuth flow.
    .setCallbackFunction('authCallback')

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())

    // Set the scopes to request (space-separated for Google services).
    .setScope('https://www.googleapis.com/auth/drive')

    // Below are Google-specific OAuth2 parameters.

    // Sets the login hint, which will prevent the account chooser screen
    // from being shown to users logged in with multiple accounts.
    .setParam('login_hint', Session.getEffectiveUser().getEmail())

    // Requests offline access.
    .setParam('access_type', 'offline')

    // Consent prompt is required to ensure a refresh token is always
    // returned when requesting offline access.
    .setParam('prompt', 'consent');
}