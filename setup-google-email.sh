#!/bin/bash

# Google Cloud Email Setup Script for Yaya Starchild Website
# This script helps you set up secure email functionality

set -e

echo "🔥 Yaya Starchild - Google Cloud Email Setup"
echo "============================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Set project ID
PROJECT_ID="yaya-starchild-email"
echo "Project ID: $PROJECT_ID"
echo ""

# Prompt for continuation
read -p "Continue with setup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo "Step 1: Setting up Google Cloud Project..."
echo "-------------------------------------------"

# Login to gcloud
echo "Logging in to Google Cloud..."
gcloud auth login

# Create or set project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID 2>/dev/null || {
    echo "Creating new project..."
    gcloud projects create $PROJECT_ID --name="Yaya Starchild Email"
    gcloud config set project $PROJECT_ID
}

echo "✅ Project configured"
echo ""

echo "Step 2: Enabling Required APIs..."
echo "----------------------------------"

apis=(
    "cloudfunctions.googleapis.com"
    "gmail.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
)

for api in "${apis[@]}"; do
    echo "Enabling $api..."
    gcloud services enable $api
done

echo "✅ APIs enabled"
echo ""

echo "Step 3: Creating Service Account..."
echo "------------------------------------"

SERVICE_ACCOUNT="yaya-email-sender"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account if it doesn't exist
gcloud iam service-accounts create $SERVICE_ACCOUNT \
    --display-name="Yaya Email Sender" \
    --description="Sends emails for Yaya Starchild website" \
    2>/dev/null || echo "Service account already exists"

echo "✅ Service account: $SERVICE_ACCOUNT_EMAIL"
echo ""

echo "Step 4: Setting up Secret Manager..."
echo "-------------------------------------"

echo "You need to manually add your Gmail OAuth credentials to Secret Manager."
echo ""
echo "Please follow these steps:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Create OAuth 2.0 Client ID"
echo "3. Download the credentials JSON"
echo "4. Get a refresh token from: https://developers.google.com/oauthplayground/"
echo "5. Create a secret in Secret Manager with this JSON:"
echo ""
echo '   {'
echo '     "client_id": "YOUR_CLIENT_ID",'
echo '     "client_secret": "YOUR_CLIENT_SECRET",'
echo '     "refresh_token": "YOUR_REFRESH_TOKEN",'
echo '     "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"]'
echo '   }'
echo ""

read -p "Press Enter when you have your credentials ready..."

# Prompt for credentials
read -p "Enter your OAuth Client ID: " CLIENT_ID
read -p "Enter your OAuth Client Secret: " CLIENT_SECRET
read -p "Enter your Refresh Token: " REFRESH_TOKEN

# Create secret JSON
SECRET_JSON=$(cat <<EOF
{
  "client_id": "$CLIENT_ID",
  "client_secret": "$CLIENT_SECRET",
  "refresh_token": "$REFRESH_TOKEN",
  "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"]
}
EOF
)

# Create secret
echo "$SECRET_JSON" | gcloud secrets create gmail-credentials \
    --data-file=- \
    --replication-policy="automatic" \
    2>/dev/null || {
    echo "Secret already exists, updating..."
    echo "$SECRET_JSON" | gcloud secrets versions add gmail-credentials --data-file=-
}

# Grant service account access to secret
gcloud secrets add-iam-policy-binding gmail-credentials \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

echo "✅ Secret created and permissions granted"
echo ""

echo "Step 5: Deploying Cloud Function..."
echo "------------------------------------"

cd cloud-functions/send-email

# Install dependencies
echo "Installing dependencies..."
npm install

# Deploy function
echo "Deploying function..."
gcloud functions deploy sendEmail \
    --gen2 \
    --runtime=nodejs20 \
    --region=us-central1 \
    --source=. \
    --entry-point=sendEmail \
    --trigger-http \
    --allow-unauthenticated \
    --service-account="$SERVICE_ACCOUNT_EMAIL" \
    --set-secrets="gmail-credentials=gmail-credentials:latest"

# Get function URL
FUNCTION_URL=$(gcloud functions describe sendEmail --region=us-central1 --gen2 --format="value(serviceConfig.uri)")

echo "✅ Function deployed!"
echo ""
echo "Function URL: $FUNCTION_URL"
echo ""

echo "Step 6: Updating Frontend Configuration..."
echo "-------------------------------------------"

# Update google-email-client.js with function URL
cd ../..
sed -i "s|const CLOUD_FUNCTION_URL = .*|const CLOUD_FUNCTION_URL = '$FUNCTION_URL';|" google-email-client.js

echo "✅ Frontend updated"
echo ""

echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your function URL: $FUNCTION_URL"
echo ""
echo "Next steps:"
echo "1. Test the function:"
echo "   curl -X POST $FUNCTION_URL \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"type\":\"newsletter\",\"data\":{\"email\":\"test@example.com\"}}'"
echo ""
echo "2. Check your inbox at faeriepoetics@gmail.com"
echo ""
echo "3. Open firebase-test.html in your browser to test all functionality"
echo ""
echo "4. Monitor your function:"
echo "   gcloud functions logs read sendEmail --limit 50"
echo ""

echo "Security reminders:"
echo "- Never commit credentials to Git (.gitignore is configured)"
echo "- Credentials are stored securely in Google Secret Manager"
echo "- Monitor your Cloud Console for unusual activity"
echo ""

exit 0
