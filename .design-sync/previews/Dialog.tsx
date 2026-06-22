import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from "toa-project";

export function ConfirmDialog() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace</DialogTitle>
          <DialogDescription>
            This will permanently remove the “Finance” workspace and all of its
            reports. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="ghost">Cancel</Button>
            }
          />
          <Button variant="danger">Delete workspace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InviteDialog() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a colleague</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organisation. They’ll receive an
            email with the next steps.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button>Send invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
