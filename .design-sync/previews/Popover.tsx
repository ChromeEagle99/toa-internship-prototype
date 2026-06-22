import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  Button,
} from "toa-project";

export function ProfilePopover() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button variant="outline">Account</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Signed in as Eleanor</PopoverTitle>
          <PopoverDescription>
            eleanor.whitfield@acme.co.uk
          </PopoverDescription>
        </PopoverHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <Button variant="ghost" size="sm">View profile</Button>
          <Button variant="ghost" size="sm">Organisation settings</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function InfoPopover() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button variant="outline">What’s this?</Button>} />
      <PopoverContent showCloseButton>
        <PopoverHeader>
          <PopoverTitle>Spend limit</PopoverTitle>
          <PopoverDescription>
            Your monthly limit caps total usage across all projects. Raise it
            any time from billing settings.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
