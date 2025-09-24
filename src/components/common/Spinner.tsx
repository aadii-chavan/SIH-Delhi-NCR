import React from "react";
import { RotatingLines } from "react-loader-spinner";

export const Spinner: React.FC<{ label?: string }>= ({ label }) => (
  <div className="center" role="status" aria-live="polite" style={{ padding: 16 }}>
    <RotatingLines width="40" strokeColor="#0b57d0" />
    {label ? <span style={{ marginLeft: 8 }}>{label}</span> : null}
  </div>
);

export default Spinner;


