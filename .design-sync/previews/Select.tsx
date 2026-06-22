import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "toa-project";

export function Default() {
  return (
    <div style={{ width: 240 }}>
      <Select defaultValue="enterprise">
        <SelectTrigger>
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Placeholder() {
  return (
    <div style={{ width: 240 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eu">Europe</SelectItem>
          <SelectItem value="us">North America</SelectItem>
          <SelectItem value="apac">Asia Pacific</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ width: 240 }}>
      <Select defaultValue="pro" disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
