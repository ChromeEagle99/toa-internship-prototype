import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
} from "toa-project";

export function HelpTooltip() {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Sync now</Button>} />
        <TooltipContent side="bottom">
          Pulls the latest changes from your connected sources
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ShortcutTooltip() {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Save</Button>} />
        <TooltipContent side="bottom">Save changes · Ctrl + S</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
