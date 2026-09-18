-- 6 eindeutig markierte DEMO-Bücher zum Testen von Layout & Funktionen.
-- is_demo = true, damit sie klar von echten Beständen unterscheidbar sind.
-- Können im Admin-Bereich jederzeit gelöscht/deaktiviert werden.

insert into books (title, author, category, description, condition, stock_total, stock_available, active, is_demo)
values
  ('[DEMO] Der Weg zur Selbstdisziplin', 'Amina Yousef', 'Persönlichkeitsentwicklung', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Wie neu', 3, 3, true, true),
  ('[DEMO] Grundlagen der Finanzplanung', 'Karim El-Sayed', 'Finanzen', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Gut', 2, 2, true, true),
  ('[DEMO] Geschichten aus der Geschichte', 'Laila Hassan', 'Geschichte', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Sehr gut', 1, 1, true, true),
  ('[DEMO] Gesund und achtsam leben', 'Yusuf Demir', 'Gesundheit', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Wie neu', 4, 4, true, true),
  ('[DEMO] Mein Leben, meine Wege', 'Sara Ahmadi', 'Biografie', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Gut', 1, 0, true, true),
  ('[DEMO] Wirtschaft einfach erklärt', 'Tarek Nasser', 'Wirtschaft', 'Beispieltext zur Vorschau der Buchdetailseite.', 'Gut', 2, 2, true, true);
