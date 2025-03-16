import { hash, compare } from "bcrypt";
import { createHash } from "crypto";

const password = "password";
const sha256Hash = createHash("sha256").update(password).digest("hex");
const bcryptHash =
  "$2y$10$pvEeml/VHe1qPeioSvO5N.GwsVvoRdijdFMuKGTmUR6t3i3e53FC6";
const genBcryptHash = await hash(sha256Hash, 10);
console.log("SHA256 Hash:", sha256Hash);
console.log("Bcrypt Hash:", bcryptHash);
console.log("Generated Bcrypt Hash:", genBcryptHash);
console.log(
  "Are prepopulated hashes equal?",
  await compare(sha256Hash, bcryptHash)
);
console.log(
  "Are generated hashes equal?",
  await compare(sha256Hash, genBcryptHash)
);
