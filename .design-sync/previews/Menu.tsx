import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  Button,
} from "toa-project";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react";

export function ActionsMenu() {
  return (
    <Menu defaultOpen>
      <MenuTrigger render={<Button variant="outline">Actions</Button>} />
      <MenuContent>
        <MenuLabel>Report</MenuLabel>
        <MenuItem>
          <Pencil className="h-4 w-4" />
          Rename
          <MenuShortcut>⌘R</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <Copy className="h-4 w-4" />
          Duplicate
          <MenuShortcut>⌘D</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <Share2 className="h-4 w-4" />
          Share…
        </MenuItem>
        <MenuSeparator />
        <MenuItem className="text-danger">
          <Trash2 className="h-4 w-4" />
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function AccountMenu() {
  return (
    <Menu defaultOpen>
      <MenuTrigger render={<Button variant="outline">Eleanor</Button>} />
      <MenuContent>
        <MenuLabel>my-organisation</MenuLabel>
        <MenuItem>Profile</MenuItem>
        <MenuItem>Billing</MenuItem>
        <MenuItem>Team members</MenuItem>
        <MenuSeparator />
        <MenuItem>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  );
}
