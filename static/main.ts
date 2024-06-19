import { ethereumOperations } from "./src/ethereum-operations";

export async function mainModule() {
  console.log(`Hello from mainModule`);
}
mainModule()
  .then(() => {
    console.log("mainModule loaded");
  })
  .then(ethereumOperations)
  .catch((error) => {
    console.error(error);
  });
