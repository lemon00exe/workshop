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
| Contract Address | `CA5GGKSQTJW3WUS3A3MT6YW6SKKTAEXAE3MVVFJJAPUFQ2MEBGD7WZRV` |
| Language | Rust (Soroban SDK) |

## Application Screenshot

<img width="1919" height="921" alt="app" src="https://github.com/user-attachments/assets/829e67a5-55cb-44f8-87c4-c5ccd45b5142" />

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Wallet**: Freighter Browser Extension
- **RPC**: Soroban Testnet RPC
