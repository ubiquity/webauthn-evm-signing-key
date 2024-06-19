# In App Signing Keys

- Early research to fully abstract away the browser extension wallet approach.
- The idea is to deterministically generate an evm signing key based on the device fingerprint, and then automatically add itself to a user's Gnosis SAFE.
- The Gnosis SAFE should be associated with a GitHub user ID.
- All of the user's devices should be able to claim permits on behalf of the user, as the SAFE.
- The SAFE should be automatically registered on GitHub as the user's wallet.

Given that Gnosis Chain sponsors transactions, the user should be able to sign transactions without having to pay for gas. Most importantly, the signing key can strictly be used for signing, and not hold any value. This means that the user should never need to export/expose their private key.