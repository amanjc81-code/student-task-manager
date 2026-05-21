import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="hero">
      <div className="hero__inner">
        <p className="eyebrow">Est. 1924 · Reimagined for today</p>
        <h1 className="hero__title">Where classic technique meets modern calm.</h1>
        <p className="hero__lead">
          Seasonal tasting menus, an intimate dining room, and online ordering for pickup—crafted with the same care
          as service at the table.
        </p>
        <div className="hero__actions">
          <Link to="/menu" className="btn btn--primary btn--lg">
            View the menu
          </Link>
          <Link to="/register" className="btn btn--outline btn--lg">
            Create an account
          </Link>
        </div>
      </div>
      <div className="hero__visual" aria-hidden="true" />
    </div>
  );
}
