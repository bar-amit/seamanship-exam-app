#!/usr/bin/env node

import process from "node:process";

const COMMON_REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "ADMIN_ALLOWLIST"
];

function parseArgs(argv) {
  const args = new Map();
  for (const token of argv) {
    if (!token.startsWith("--")) {
      continue;
    }
    const [key, value] = token.split("=");
    args.set(key, value ?? "true");
  }
  return args;
}

function normalizePrivateKey(value) {
  return String(value ?? "").replace(/\\n/g, "\n").trim();
}

function isLikelyEmailList(value) {
  const emails = String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (emails.length === 0) {
    return false;
  }
  return emails.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function validate() {
  const args = parseArgs(process.argv.slice(2));
  const envName = String(args.get("--env") ?? "unknown");
  const required = [...COMMON_REQUIRED];
  const missing = required.filter((key) => !String(process.env[key] ?? "").trim());

  const errors = [];
  if (missing.length > 0) {
    errors.push(`Missing required env vars: ${missing.join(", ")}`);
  }

  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (privateKey && !privateKey.includes("BEGIN PRIVATE KEY")) {
    errors.push("FIREBASE_PRIVATE_KEY does not look like a valid PEM private key.");
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    errors.push("FIREBASE_PROJECT_ID must match NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
  }

  if (
    process.env.ADMIN_ALLOWLIST &&
    !isLikelyEmailList(process.env.ADMIN_ALLOWLIST)
  ) {
    errors.push("ADMIN_ALLOWLIST must be a comma-separated list of valid emails.");
  }

  if (errors.length > 0) {
    console.error(`Environment validation failed for "${envName}":`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Environment validation passed for "${envName}".`);
}

validate();
