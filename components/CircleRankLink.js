import Link from "next/link";

export default function CircleRankLink({ id, linkCount, pointTotal }) {
  return (
    <Link className="rank rank-link" href={`/circle/${id}`}>
      <span>Circle #{id}</span>
      <b>{linkCount} links · {pointTotal} pts</b>
    </Link>
  );
}
