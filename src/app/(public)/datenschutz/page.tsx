export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <h1 className="font-display text-3xl text-ink">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Platzhalter — bitte durch vollständige, rechtlich geprüfte Angaben ersetzen.
      </p>

      <div className="mt-8 flex flex-col gap-8 leading-relaxed text-ink">
        <section>
          <h2 className="font-display text-xl">1. Verantwortliche Person</h2>
          <p className="mt-2 text-ink-soft">
            [Name]
            <br />
            [Anschrift]
            <br />
            [E-Mail-Adresse]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">2. Welche Daten werden erhoben</h2>
          <p className="mt-2 text-ink-soft">
            Bei einer Reservierung oder Bestellung werden Vorname, Nachname, E-Mail-Adresse
            sowie — bei Versand — die Versandadresse (Straße, Hausnummer, PLZ, Ort, Land)
            gespeichert. Optional kann ein Instagram- oder TikTok-Nutzername angegeben
            werden.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">3. Zweck der Verarbeitung</h2>
          <p className="mt-2 text-ink-soft">
            Die Daten werden ausschließlich zur Abwicklung der Buchreservierung bzw. des
            Versands verwendet — [ggf. Rechtsgrundlage ergänzen, z. B. Art. 6 Abs. 1 lit. b
            DSGVO].
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">4. Speicherung &amp; Sicherheit</h2>
          <p className="mt-2 text-ink-soft">
            Die Daten werden bei [Supabase / Hosting-Anbieter, Serverstandort ergänzen]
            gespeichert. Der Zugriff ist auf autorisierte Verwaltungszugänge beschränkt.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">5. Zahlungsabwicklung</h2>
          <p className="mt-2 text-ink-soft">
            Versandkosten werden über einen externen Zahlungsdienstleister
            [z. B. Revolut, Anbieter ergänzen] abgewickelt. Es gelten dessen eigene
            Datenschutzbestimmungen.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">6. Deine Rechte</h2>
          <p className="mt-2 text-ink-soft">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
            Verarbeitung deiner Daten. Wende dich dazu an [Kontakt ergänzen].
          </p>
        </section>
      </div>
    </div>
  );
}
