# GitHub Upload Guide

This guide explains how to upload the SecretVote project to GitHub using the automated script.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
   - Copy the generated token

2. **GitHub Username**
   - Your GitHub account username

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   # GitHub Personal Access Token (for creating repo and pushing code)
   GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_USERNAME=your_github_username
   ```

## Usage

### Upload to GitHub

Run the upload script:

```bash
npm run upload:github
```

Or specify a custom repository name:

```bash
npm run upload:github SecretVote-DAO
```

### What the Script Does

1. **Creates GitHub Repository**
   - Uses GitHub API to create a new repository
   - Checks if repository already exists
   - Sets repository description and visibility

2. **Pushes Code**
   - Initializes git if needed
   - Adds all files
   - Commits changes
   - Pushes to GitHub (force push to `main` branch)

## Example Output

```
🚀 GitHub Upload Script
==================================================
Repository: your_username/SecretVote

📝 Creating GitHub repository...
✅ GitHub repository created: your_username/SecretVote

📤 Pushing code to GitHub...
🔧 Initializing git repository...
🔗 Setting up remote origin...
📦 Adding files...
💾 Committing changes...
🚀 Pushing to GitHub...

✅ Successfully pushed to: https://github.com/your_username/SecretVote

✨ Upload completed successfully!
```

## Troubleshooting

### Authentication Failed
- Verify your PAT token has the correct permissions
- Make sure the token hasn't expired
- Check that GITHUB_PAT in .env is correct

### Repository Already Exists
- The script will skip creation and push to existing repository
- Use force push to overwrite existing code

### Push Rejected
- Check if you have write access to the repository
- Verify the repository name is correct

## Security Notes

⚠️ **Important**:
- Never commit your `.env` file to the repository
- Keep your PAT token secret
- The `.env` file is already in `.gitignore`
- Rotate your PAT token regularly

## Manual Alternative

If you prefer to upload manually:

```bash
# Create repo on GitHub website first
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```
