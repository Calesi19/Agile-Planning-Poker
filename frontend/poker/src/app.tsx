import Router from "preact-router";
import { Home } from "./pages/Home";
import { CreateSession } from "./pages/CreateSession";
import { JoinSession } from "./pages/JoinSession";
import { HostSession } from "./pages/HostSession";
import { ParticipantSession } from "./pages/ParticipantSession";
import { NotFound } from "./pages/NotFound";
import { hashHistory } from "./lib/hashHistory";
import "./index.css";

export function App() {
  return (
    <Router history={hashHistory}>
      <Home path="/" />
      <CreateSession path="/create" />
      <JoinSession path="/join" />
      <JoinSession path="/join/:code" />
      <HostSession path="/host/:code" />
      <ParticipantSession path="/participant/:code" />
      <NotFound default />
    </Router>
  );
}
