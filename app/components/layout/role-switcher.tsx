import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { ROLE_LABELS, type Role } from "~/data";
import { useActor, ROLE_PRESETS } from "~/context/actor-context";

/**
 * Dev-only role switcher (stands in for sign-in). Changing the role swaps the
 * acting Actor for every data-layer call and re-renders the role-aware nav.
 */
export function RoleSwitcher() {
  const { role, setRole } = useActor();
  return (
    <div className="flex items-center gap-2">
      <Text as="span" size="xs" variant="muted" className="hidden sm:inline">
        Acting as
      </Text>
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_PRESETS.map(({ role: r }) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
