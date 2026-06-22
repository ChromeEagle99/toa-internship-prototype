import { Prose } from "toa-project";

export function Article() {
  return (
    <Prose style={{ width: 480 }}>
      <h2>Getting started with the platform</h2>
      <p>
        Welcome to the workspace. This short guide walks you through the essentials so
        you can invite your team and ship your first project with confidence.
      </p>
      <h3>Before you begin</h3>
      <p>
        Make sure you have administrator access. You will need it to configure
        integrations and manage <strong>billing</strong> for your organisation.
      </p>
      <ul>
        <li>Confirm your organisation name and primary contact.</li>
        <li>Invite at least one other administrator.</li>
        <li>Connect your single sign-on provider.</li>
      </ul>
      <p>
        For anything else, see our <a href="#">help centre</a> or reach out to support.
      </p>
    </Prose>
  );
}

export function ReleaseNotes() {
  return (
    <Prose style={{ width: 480 }}>
      <h3>Release 4.2 &mdash; June 2026</h3>
      <p>This release focuses on performance and accessibility improvements.</p>
      <ol>
        <li>Dashboards now load roughly twice as fast on large datasets.</li>
        <li>Keyboard navigation has been refined across all dialogs.</li>
        <li>
          The <code>export</code> command now supports CSV and Parquet formats.
        </li>
      </ol>
      <blockquote>
        Upgrading is recommended for all customers on the Team and Enterprise plans.
      </blockquote>
    </Prose>
  );
}
