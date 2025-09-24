import React from "react";
import { NavLink } from "react-router-dom";

export const NavBar: React.FC = React.memo(function NavBar() {
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/source-breakdown", label: "Source Breakdown" },
    { to: "/forecast", label: "Forecast" },
    { to: "/interventions", label: "Intervention Analytics" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" }
  ];

  return (
    <nav className="nav" aria-label="Main Navigation">
      <h2 style={{ marginTop: 0 }}>Menu</h2>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          aria-label={`Go to ${l.label}`}
          className={({ isActive }) => (isActive ? "active" : undefined)}
          end={l.to === "/"}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
});

export const MobileNav: React.FC = React.memo(function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((o) => !o);
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/source-breakdown", label: "Source Breakdown" },
    { to: "/forecast", label: "Forecast" },
    { to: "/interventions", label: "Intervention Analytics" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" }
  ];
  return (
    <div className="nav-mobile" role="navigation" aria-label="Mobile Navigation">
      <button
        className="hamburger"
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(); }}
      >
        ☰
      </button>
      {open && (
        <div style={{ padding: 8, borderTop: "1px solid #e0e0e0" }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
});

export default NavBar;


