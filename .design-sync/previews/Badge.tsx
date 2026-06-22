import { Badge } from "toa-project";
import { Check, Circle, ShieldAlert } from "lucide-react";

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  );
}

export function StatusLabels() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending review</Badge>
      <Badge variant="danger">Suspended</Badge>
      <Badge variant="info">Syncing</Badge>
      <Badge variant="subtle">Archived</Badge>
    </div>
  );
}

export function WithIcons() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge variant="success">
        <Check className="h-3 w-3" /> Verified
      </Badge>
      <Badge variant="info">
        <Circle className="h-3 w-3" /> Live
      </Badge>
      <Badge variant="danger">
        <ShieldAlert className="h-3 w-3" /> Breach
      </Badge>
      <Badge variant="outline">v4.0.2</Badge>
    </div>
  );
}
