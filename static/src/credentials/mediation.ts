export async function isAutofillAvailable() {
    const isAvailable = await window.PublicKeyCredential.isConditionalMediationAvailable();

    if (!isAvailable) {
        /**
         * Conditional mediation, if available, results in any discovered credentials being presented
         * to the user in a non-modal dialog box along with an indication of the origin requesting credentials.
         * This is requested by including mediation: 'conditional' in your get() call.
         * In practice, this means autofilling available credentials; you need to include autocomplete="webauthn"
         * on your form fields so that they will show the WebAuthn sign-in options.
         * 
         * A conditional get() call does not show the browser UI and remains pending until the user picks
         * an account to sign-in with from available autofill suggestions:
         * 
         * - If the user makes a gesture outside of the dialog, it closes without resolving
         *   or rejecting the Promise and without causing a user-visible error condition.
         * - If the user selects a credential, that credential is returned to the caller.
         * - The prevent silent access flag (see CredentialsContainer.preventSilentAccess())
         *   is treated as being true regardless of its actual value: 
         *   the conditional behavior always involves user mediation of some sort if applicable credentials are discovered.
            
         */
        throw new Error("Conditional mediation is not available");
    }
}