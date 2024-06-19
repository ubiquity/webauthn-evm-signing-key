# In App Signing Keys

- Early research to fully abstract away the browser extension wallet approach.
- The idea is to deterministically generate an evm signing key based on the device fingerprint, and then automatically add itself to a user's Gnosis SAFE.
- The Gnosis SAFE should be associated with a GitHub user ID.
- All of the user's devices should be able to claim permits on behalf of the user, as the SAFE.
- The SAFE should be automatically registered on GitHub as the user's wallet.

Given that Gnosis Chain sponsors transactions, the user should be able to sign transactions without having to pay for gas. Most importantly, the signing key can strictly be used for signing, and not hold any value. This means that the user should never need to export/expose their private key.

For extended "mainstream" compatibility, in another future SAFE management UI that we build, we can:
1. explicitly list the user's devices as the "signers" or "authorized devices" and refer to the wallet address of each as the "pairing code" for each device. In our applications, we can have some type of control button to "show device pairing code" which is just the public address that is generated.
2. we can have a "sign in with github" button which will automatically deploy a SAFE if there is none associated, or identify the SAFE if there is one associated.

### Performance

This is one of the most exciting parts to me, but assuming that a fast RPC is connected, the interactions should be pretty instantaneous. No insanely slow metamask confirmation popups and we dont need to configure any gas settings etc as it is only for signing. Anything gas related can be left to the sponsor (gelato+gnosis)

The only last step for performance optimization is if we were on Optimism, because the optimistic rollups are basically instant. But that is a future consideration.