import { Code, CodeBlock } from "toa-project";

export function Inline() {
  return (
    <p className="text-sm text-fg" style={{ maxWidth: 420 }}>
      Run <Code>npm install</Code> to fetch dependencies, then start the dev server with{" "}
      <Code>npm run dev</Code>. Configuration lives in <Code>app/app.css</Code>.
    </p>
  );
}

export function Block() {
  return (
    <div style={{ maxWidth: 480 }}>
      <CodeBlock>{`export function greet(name: string) {
  return \`Hello, \${name}!\`;
}

greet("colleague");`}</CodeBlock>
    </div>
  );
}

export function Command() {
  return (
    <div style={{ maxWidth: 480 }}>
      <CodeBlock>{`$ git checkout -b feature/billing
$ git commit -m "Add invoice export"
$ git push origin feature/billing`}</CodeBlock>
    </div>
  );
}
