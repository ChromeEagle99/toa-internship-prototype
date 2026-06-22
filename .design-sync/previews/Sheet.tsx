import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
  Button,
  Label,
  Input,
} from "toa-project";

export function FiltersPanel() {
  return (
    <Sheet defaultOpen>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update your contact details. Changes are saved to your organisation
            directory.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>Full name</Label>
              <Input defaultValue="Eleanor Whitfield" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>Email address</Label>
              <Input defaultValue="eleanor.whitfield@acme.co.uk" />
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost">Cancel</Button>} />
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function DetailsPanel() {
  return (
    <Sheet defaultOpen>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Notification settings</SheetTitle>
          <SheetDescription>
            Choose how this workspace keeps you informed.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p style={{ fontSize: 14 }} className="text-fg-muted">
            Weekly digests are delivered every Monday morning, summarising
            activity across all your projects.
          </p>
        </SheetBody>
        <SheetFooter>
          <Button>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
