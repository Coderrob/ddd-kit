---
uid: 'tech:typescript/frameworks/express@5.0'
title: 'Express 5 — Service Pattern & API Style'
version: '5.0'
status: 'active'
docType: 'tech'
owners: ['@platform-fe']
reviewers: ['@security', '@qa']
tags: ['api', 'node20', 'eslint9']
requires: ['std:quality/testing-standards@1.1']
lastReviewed: '2025-09-20'
schemaRef: 'schemas/doc.tech.schema.json'
---

> Summary: Opinionated Express 5 guide for Node 20 services.

## When to use

Use Express 5 for building REST APIs in Node.js.

## Pre-reqs

- Node 20
- TypeScript

## Install / Setup

npm install express

## Code patterns

Use middleware for validation.
