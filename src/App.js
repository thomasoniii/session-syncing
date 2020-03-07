import React, { useState, useEffect } from "react";
import "./App.css";

// BroadcastChannel has been supported for a few years now - chrome's had it since v54, and firefox since 38.
// Safari does -not- support it.
// https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API

// here, we just create a shared channel to broadcast our session messages on
const channel = new BroadcastChannel("sessions");

// list of databases for demo purposes
const databases = [
  "bugs_bunny",
  "daffy_duck",
  "elmer_fudd",
  "porky_pig",
  "sylvester",
  "tweety_bird",
  "wile_e_coyote"
];

function App() {
  const [session, login] = useState("");
  // we create and save a logout function that just knows about our login function.
  const [logout] = useState(() => {
    return session => {
      // this is the only important bit - when we log out, post a message to our channel
      // that we're logging out of this database. The message sent can be any arbitrary data,
      // not just a string
      channel.postMessage(session);
      login("");
    };
  });

  // and we establish an effect when we're first loaded to listen to messages on the channel.
  // if the message is a logout from our current session, then we logout as well.
  //
  // NOTE - we call login("") instead of logout() here because we don't want to re-broadcast the
  // logout message.
  useEffect(() => {
    channel.addEventListener("message", e => {
      if (e.data === session) {
        login("");
      }
    });
  }, [session]);

  return (
    <div className="App">
      <p>Demonstration of communication across browser tabs.</p>
      <p>
        Open up as many copies of this page as you want.
        <a href={window.location.href} target="_blank">
          Open in new window
        </a>
      </p>
      <p>
        In each window, you can choose to login to whichever database you want.
        Just select the database from the dropdown menu, and you'll be
        considered logged in. For example, log into "bugs_bunny" in this window,
        "bugs_bunny" in a second window, and "daffy_duck" in a third window.
      </p>
      <p>
        Next, in any window you choose, log out of your current database.
        Observe the other windows - if they were logged into the same database,
        they'll automatically log out of it. If they were logged into a
        different database, they'll be unaffected.
      </p>
      <div>
        Select a database to log into:
        <select onChange={e => login(e.target.value)} value={session}>
          {session === "" && <option>--select database--</option>}
          {databases.map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="logged-in-block">
        {session ? (
          <span>
            You are currently logged into <b>{session}</b>
          </span>
        ) : (
          "You are not logged in"
        )}
      </div>
      {session && (
        <div>
          <button onClick={() => logout(session)}>Log out</button>
        </div>
      )}
    </div>
  );
}

export default App;
