import { Button } from "toa-project";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button variant="solid">Save changes</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="subtle">Filter</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="link">Learn more</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function WithIcons() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button variant="solid">
        <Plus className="h-4 w-4" /> New project
      </Button>
      <Button variant="outline">
        Continue <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="danger">
        <Trash2 className="h-4 w-4" /> Remove
      </Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button variant="solid" disabled>
        Save changes
      </Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
    </div>
  );
}
