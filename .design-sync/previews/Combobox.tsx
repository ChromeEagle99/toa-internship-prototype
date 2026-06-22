import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "toa-project";

const regions = ["Europe", "North America", "Asia Pacific", "South America", "Africa"];

export function Trigger() {
  return (
    <div style={{ width: 280 }}>
      <Combobox items={regions} defaultValue="Europe">
        <ComboboxTrigger />
        <ComboboxContent>
          <ComboboxList>
            {regions.map((region) => (
              <ComboboxItem key={region} value={region}>
                {region}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Placeholder() {
  return (
    <div style={{ width: 280 }}>
      <Combobox items={regions}>
        <ComboboxTrigger />
        <ComboboxContent>
          <ComboboxList>
            {regions.map((region) => (
              <ComboboxItem key={region} value={region}>
                {region}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Input() {
  return (
    <div style={{ width: 280 }}>
      <Combobox items={regions} defaultValue="Asia Pacific">
        <ComboboxInput placeholder="Search regions…" />
        <ComboboxContent>
          <ComboboxList>
            {regions.map((region) => (
              <ComboboxItem key={region} value={region}>
                {region}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ width: 280 }}>
      <Combobox items={regions} defaultValue="Europe" disabled>
        <ComboboxTrigger />
      </Combobox>
    </div>
  );
}
