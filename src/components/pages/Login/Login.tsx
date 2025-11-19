import { useState } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub,
} from "../../auth/login";

import Button from "../../ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      console.log("Login success");
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGithub = async () => {
    try {
      await loginWithGithub();
    } catch (msg) {
      setError(String(msg));
    }
  };

  return (
    <div>
      <h2>Button</h2>

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit">Login with Email</Button>
      </form>

      <button onClick={handleGoogle}>Login with Google</button>
      <button onClick={handleGithub}>Login In with GitHub</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
