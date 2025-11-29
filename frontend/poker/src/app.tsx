import Router from "preact-router";
import { Home } from "./pages/Home";
import { CreateSession } from "./pages/CreateSession";
import { JoinSession } from "./pages/JoinSession";
import { HostSession } from "./pages/HostSession";
import { ParticipantSession } from "./pages/ParticipantSession";
import "./index.css";

export function App() {
  return (
    <Router>
      <Home path="/" />
      <CreateSession path="/create" />
      <JoinSession path="/join" />
      <HostSession path="/host/:code" />
      <ParticipantSession path="/participant/:code" />
    </Router>
  );
}
