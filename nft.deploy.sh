near deploy \
    --wasmFile out/main.wasm \
    --initFunction "new" \
    --initArgs '{
        "metadata": {
            "spec": "nft-1.0.0",
            "name": "NEAR NFT",
            "symbol": "NNF"
        },
        "owner_id": "nft.phmai.testnet"
    }' \
    --accountId nft.phmai.testnet