import { useState } from "react";
import { signUpWithEmail } from "../../auth/login";

import Button from "../../ui/Button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await signUpWithEmail(email, password);
      console.log("Account created!");
    } catch (msg) {
      setError(String(msg));
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit">Sign Up</Button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
