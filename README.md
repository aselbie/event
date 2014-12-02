Design decisions:

Choice: All interactions* should be over socket.io
Rationale: It's fast, simplifies pushing state changes to clients

Choice: The database should be the canonical source of truth at all times, and any view associated with that data should be out of sync as little of the time as possible
Rationale: It's just easier that way. It's more resilient.

Choice: Configuration over Convention
Rationale: New developers should be able to easily follow program flow directly through the code base without relying on (possibly wrong or out of date) documentation

Choice: Client should speak to server in actions (socket messages) rather than REST updates.
Rationale: This more closely mirrors the way developers think through their designs and creates better separation between server and client code. And this allows for more thorough security policies

Choice: Client-side actions should never directly modify view state
Rationale: Prevents view state getting out of sync with source of truth (database)

Choice: Sockets and users should be tie