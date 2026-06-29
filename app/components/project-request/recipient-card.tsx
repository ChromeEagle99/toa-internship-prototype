import { ChevronDown, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Required } from "./fields";
import {
  CONTACTS,
  EDUCATION_LEVELS,
  type EducationRow,
  type Recipient,
} from "./model";

export function RecipientCard({
  recipient,
  index,
  canRemove,
  showErrors,
  onToggle,
  onRemove,
  onPrimaryChange,
  onCcDraftChange,
  onAddCc,
  onRemoveCc,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: {
  recipient: Recipient;
  index: number;
  canRemove: boolean;
  showErrors: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onPrimaryChange: (value: string | null) => void;
  onCcDraftChange: (value: string) => void;
  onAddCc: () => void;
  onRemoveCc: (cc: string) => void;
  onRowChange: (rowId: string, patch: Partial<EducationRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-bg-subtle px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left"
          aria-expanded={!recipient.collapsed}
        >
          <Text size="sm" weight="semibold">
            Recipient{index > 0 ? ` ${index + 1}` : ""}
          </Text>
          {recipient.primary ? (
            <Text size="xs" variant="muted" className="truncate">
              · {recipient.primary}
            </Text>
          ) : null}
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={recipient.collapsed ? "Expand recipient" : "Collapse recipient"}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                recipient.collapsed && "-rotate-90",
              )}
            />
          </Button>
          {canRemove ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Remove recipient"
              className="text-danger hover:bg-bg-muted hover:text-danger"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {!recipient.collapsed ? (
        <div className="space-y-5 p-5">
          <div>
            <Text size="sm" weight="medium">
              Recipient details
            </Text>
            <Text size="sm" variant="muted" className="mt-0.5">
              Select who should receive this project request and who should be
              copied.
            </Text>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`primary-${recipient.id}`}>
              Primary recipient <Required />
            </Label>
            <Combobox
              items={[...CONTACTS]}
              value={recipient.primary}
              onValueChange={onPrimaryChange}
            >
              <ComboboxTrigger id={`primary-${recipient.id}`} className="w-full">
                <span
                  className={recipient.primary ? "truncate" : "truncate text-fg-subtle"}
                >
                  {recipient.primary ?? "Search by name or email"}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </ComboboxTrigger>
              <ComboboxContent>
                <div className="border-b border-border p-1">
                  <ComboboxInput
                    placeholder="Search by name or email"
                    className="border-0 shadow-none focus-visible:outline-0"
                  />
                </div>
                <ComboboxEmpty>No recipients found.</ComboboxEmpty>
                <ComboboxList>
                  {(contact: string) => (
                    <ComboboxItem key={contact} value={contact}>
                      {contact}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {showErrors && !recipient.primary ? (
              <Text size="xs" className="text-danger">
                Please choose a primary recipient.
              </Text>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`cc-${recipient.id}`}>Copy recipients</Label>
            <div className="flex gap-2">
              <Input
                id={`cc-${recipient.id}`}
                type="email"
                value={recipient.ccDraft}
                onChange={(e) => onCcDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddCc();
                  }
                }}
                placeholder="Add optional copy recipients"
              />
              <Button variant="subtle" onClick={onAddCc} className="shrink-0">
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            {recipient.ccs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recipient.ccs.map((cc) => (
                  <Badge key={cc} variant="subtle" className="gap-1 pr-1">
                    {cc}
                    <button
                      type="button"
                      onClick={() => onRemoveCc(cc)}
                      aria-label={`Remove ${cc}`}
                      className="rounded-full p-0.5 text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label>
                  Education levels requested <Required />
                </Label>
                <Text size="sm" variant="muted" className="mt-0.5">
                  Add one row for each education level and specify the slots
                  required.
                </Text>
              </div>
              <Button variant="ghost" size="sm" onClick={onAddRow}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {recipient.rows.map((row) => (
                <div key={row.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Select
                      value={row.level}
                      onValueChange={(v) =>
                        onRowChange(row.id, { level: (v as string) ?? "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level…" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showErrors && !row.level ? (
                      <Text size="xs" className="text-danger">
                        Choose an education level.
                      </Text>
                    ) : null}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={row.slots}
                    onChange={(e) => onRowChange(row.id, { slots: e.target.value })}
                    className="w-24 shrink-0"
                    aria-label="Slots"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveRow(row.id)}
                    disabled={recipient.rows.length <= 1}
                    aria-label="Remove education level"
                    className="shrink-0 text-fg-muted hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
