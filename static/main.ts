import { createCredential } from "./src/webauthn";

export async function mainModule() {
  console.log(`Hello from mainModule`);
}
mainModule()
  .then(() => {
    console.log("mainModule loaded");
  })
  .then(createCredential)
  .catch((error) => {
    console.error(error);
  });
