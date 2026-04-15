# EcoLog — Decentralized Recycling Tracker

A simple decentralized application (DApp) built on the Stellar blockchain using Soroban smart contracts. EcoLog allows users to track their daily recycling activities and waste management efforts on-chain.

## Description

EcoLog is a modification of a basic note-taking app, transformed into an environmental tracking tool. Users can log the type of waste they recycled (e.g., Plastic, Paper) and details like weight or destination. All logs are stored permanently on the Stellar Testnet.

## Features

- **Log Activity:** Record a new recycling activity, stored on-chain via `Notes()`.
- **View History:** Fetch and display all past recycling logs from the blockchain via `get_notes()`.
- **Delete Log:** Remove an incorrect entry by its ID via `delete_note()`.
- **Wallet Integration:** Seamlessly connect with the Freighter wallet to sign transactions.

## Smart Contract Details

| Field | Value |
|---|---|
| Network | Stellar Testnet |
| Contract ID | `[MASUKKAN CONTRACT ID LO DI SINI]` |
| Language | Rust (Soroban SDK) |

## Application Screenshot

![App Screenshot](LINK_GAMBAR_SCREENSHOT_LO_NANTI_DISINI)

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Wallet**: Freighter Browser Extension
- **RPC**: Soroban Testnet RPC