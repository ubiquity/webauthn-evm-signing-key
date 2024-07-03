import { fingerPrinting } from "./src/fingerprinting";

export async function mainModule() {
  console.log(`Hello from mainModule`);
}
mainModule()
  .then(() => {
    console.log("mainModule loaded");
  })
  // .then(ethereumOperations)
  // .then((credential) => console.trace({ credential }))
  .then(fingerPrinting)
  .catch((error) => {
    console.error(error);
  });
