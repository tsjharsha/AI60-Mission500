import Link from "next/link";
export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-32">
      <p className="eyebrow mb-5">Privacy & demo data</p>
      <h1 className="text-4xl">Know what is saved.</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-400">
        <p>
          This is an independent challenge simulation, not an official NxtWave
          enrollment service. Use fictional contact details when testing.
        </p>
        <p>
          Registration asks for name, college, graduation year, project choice,
          and email. A WhatsApp number is optional. Contact details are used for
          workshop registration only. No messages are sent automatically.
        </p>
        <p>
          In simulation mode, contact email and phone are validated but not
          retained. Name and project are held temporarily in server memory;
          local browser state holds your project and pass. Simulation squads and
          sessions may expire on server restart.
        </p>
        <p>
          When the owner configures a live database, registration information is
          saved there. The owner must set a retention policy, provide a
          contact/deletion process, and confirm the event schedule before
          collecting real participants. Reset Demo clears your browser state and
          session cookie; it does not delete live database records.
        </p>
        <p>
          Analytics use an anonymous browser ID and a small allowlist of event
          attributes. Email, phone, name, and full profile answers are excluded
          from event payloads. Invite links show only teammate first names,
          project, and roles. Do not include private information in project
          names.
        </p>
        <p>
          Signing cookies are HttpOnly and limited to this site. Server secrets
          are never placed in public environment variables. Follow-up
          communication requires separate implementation and consent.
        </p>
      </div>
      <Link href="/admin" className="text-link mt-8 inline-block">
        Open demo reset
      </Link>
    </div>
  );
}
