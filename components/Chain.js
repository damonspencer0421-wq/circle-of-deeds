import { chainMiles } from "@/lib/geo";

export default function Chain({ links, youLinkId }) {
  const accepted = links.filter((l) => l.accepted_at);
  const pts = accepted.reduce((s, l) => s + (l.points || 0), 0);
  const miles = chainMiles(accepted);
  return (
    <div className="chain">
      {links.map((l) => (
        <div className="lnk" key={l.id}>
          <span className={"dot" + (l.accepted_at ? "" : " open")} />
          <span>
            {l.accepted_at ? (l.city ? `${l.city}${l.region ? ", " + l.region : ""}` : "Somewhere") : "Waiting to be accepted"}
            <small>{l.deed_types?.name || l.deed_type_id}{youLinkId === l.id ? " · you" : ""}</small>
          </span>
          <span className="pl">{l.points} pt{l.points === 1 ? "" : "s"}</span>
        </div>
      ))}
      <div className="lnk" style={{ borderBottom: "none" }}>
        <span /><span><small>{accepted.length} link{accepted.length === 1 ? "" : "s"} · {pts} pts · {miles.toLocaleString()} mi</small></span><span />
      </div>
    </div>
  );
}
