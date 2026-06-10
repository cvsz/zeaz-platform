import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('client_secret.json'):
                print("❌ ERROR: client_secret.json not found!")
                print("Please download the OAuth 2.0 Client ID JSON from Google Cloud Console and save it as client_secret.json in the project root.")
                return
            flow = InstalledAppFlow.from_client_secrets_file('client_secret.json', SCOPES)
            creds = flow.run_local_server(port=8080, open_browser=False)
            
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
    print("✅ Authentication successful! token.json has been created.")
    print("You can now restart the bot. It will use your personal Google Drive quota to upload images.")

if __name__ == '__main__':
    authenticate()
