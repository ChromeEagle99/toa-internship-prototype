import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "toa-project";
import { Copy, Download, Pencil, Trash2 } from "lucide-react";

export function FileContextMenu() {
  return (
    <ContextMenu defaultOpen>
      <ContextMenuTrigger
        className="flex items-center justify-center rounded-md border border-dashed border-border text-sm text-fg-muted"
        style={{ width: 220, height: 90 }}
      >
        Right-click this file
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>quarterly-report.pdf</ContextMenuLabel>
        <ContextMenuItem>
          <Pencil className="h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy className="h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Download className="h-4 w-4" />
          Download
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-danger">
          <Trash2 className="h-4 w-4" />
          Move to bin
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function RowContextMenu() {
  return (
    <ContextMenu defaultOpen>
      <ContextMenuTrigger
        className="flex items-center justify-center rounded-md border border-dashed border-border text-sm text-fg-muted"
        style={{ width: 220, height: 90 }}
      >
        Right-click this row
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open in new tab</ContextMenuItem>
        <ContextMenuItem>Copy link</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Archive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
