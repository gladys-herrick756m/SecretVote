#!/usr/bin/env node
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const REPO_NAME = 'SecretVote';

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN must be set in .env file');
  process.exit(1);
}

const exec = (cmd, silent = false) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (err) {
    if (!silent) throw err;
    return null;
  }
};

async function deployToVercel() {
  console.log('🚀 Deploying to Vercel...\n');

  // Build the project first
  console.log('📦 Building project...');
  exec('npm run build');

  // Deploy to Vercel using CLI
  console.log('\n🌐 Deploying to Vercel...');
  const deployCmd = `npx vercel --token=${VERCEL_TOKEN} --prod --yes`;

  const output = exec(deployCmd, false);

  console.log('\n✅ Deployment completed!');

  // Extract deployment URL from output if available
  if (output && output.includes('https://')) {
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      console.log(`\n🔗 Deployment URL: ${urlMatch[0]}`);
    }
  }
}

async function main() {
  console.log('🚀 Vercel Deployment Script');
  console.log('=' .repeat(50));

  try {
    await deployToVercel();
    console.log('\n✨ Deployment completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
