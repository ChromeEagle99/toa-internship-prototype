import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "toa-project";
import {
  Calendar,
  FileText,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";

export function CommandPalette() {
  return (
    <div
      className="rounded-lg border border-border shadow-md"
      style={{ width: 360 }}
    >
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <FileText className="h-4 w-4" />
              New report
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calendar className="h-4 w-4" />
              Schedule a review
            </CommandItem>
            <CommandItem>
              <Plus className="h-4 w-4" />
              Invite teammate
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="h-4 w-4" />
              Profile
            </CommandItem>
            <CommandItem>
              <Users className="h-4 w-4" />
              Team members
            </CommandItem>
            <CommandItem>
              <Settings className="h-4 w-4" />
              Preferences
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export function SearchResults() {
  return (
    <div
      className="rounded-lg border border-border shadow-md"
      style={{ width: 360 }}
    >
      <Command>
        <CommandInput placeholder="Search workspaces…" />
        <CommandList>
          <CommandGroup heading="Workspaces">
            <CommandItem>Finance</CommandItem>
            <CommandItem>Marketing</CommandItem>
            <CommandItem>Engineering</CommandItem>
            <CommandItem>People &amp; Culture</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
