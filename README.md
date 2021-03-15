## Eine neue Aufgabe anlegen

Installation (einmalig):
1. Überprüfen Sie zunächst, ob Sie die nötige Administrator-Berechtigung für die Riemann-App besitzen. Hierfür muss in der Datenbank (MongoDB) für Ihren Benutzer das isAdmin-Flag auf true gesetzt sein.
2. Installieren Sie [MuseScore](https://musescore.org/de/download) auf Ihrem PC.
3. Installieren Sie das MuseScore-Plugin [ABC_ImpEx](https://github.com/mist13/ABC_ImpEx). _Hinweis: Damit das Plugin in MuseScore ausgeführt werden kann, müssen Sie (in Windows) weiterhin die Dateien [xml2abc.exe](https://wim.vree.org/svgParse/xml2abc.html) und [abc2xml.exe](https://wim.vree.org/svgParse/abc2xml.html) herunterladen und in den Plugin-Ordner (standardmäßig C:\Program Files (x86)\MuseScore 3\plugins\ABC_ImpEx) kopieren.

Neue Aufgabe anlegen:
5. Erstellen Sie in MuseScore eine neue Partitur und fügen Sie alle Noten ein.
6. Fügen Sie Funktionssymbole hinzu:
- Klicken sie auf die tiefste Note einer Harmonie und drücken Sie STRG+E. _Hinweis: Funktionssymbole werden als Ausdruckstext hinzugefügt, damit alle Sonderzeichen korrekt verarbeitet werden.
- Abweichende Basstöne werden durch vorangestellten Unterstrich gekennzeichnet; also beispielsweise \_3D für eine Dominante mit Terzbass. Es werden Grund-, Terz- und Quintbässe unterstützt.
- Harmoniefremde Töne werden durch nachfolgenden Bindestrich gekennzeichnet; also beispielsweise D-46 für einen Dominantquartsextakkord. Pro Funktion können maximal zwei harmoniefremde Töne angegeben werden. Die möglichen harmoniefremden Töne reichen von 2 bis 9.
- Für verkürzte Dominanten wird /D notiert.
- Für Zwischendominanten wird (D) notiert. Doppeldominanten sind als Zwischendominanten zu notieren.
- Funktionen, die durch App-Benutzende zu lösen sind, werden in geschweifte Klammern gesetzt. Diese Funktionen werden App-Benutzenden demzufolge nicht angezeigt. Kommen mehrere Lösungen für eine Funktion in Betracht, so werden diese durch einen Querstrich getrennt. Bsp.: {...|...}.

Hinweis: Folgende Funktionen werden aktuell nicht von Riemann-App unterstützt:
- Alterationen
- Modulationen
- Doppelsubdominanten
- Rückbezügliche Zwischendominanten
- Ellipsen
Überprüfen Sie, ob der Modus (Dur/Moll) in der ABC-Datei richtig gesetzt ist und passen sie ihn gegebenenfalls von Hand an (z. B. Em statt G)
Kopieren Sie die Zeichenkette in die Zwischenablage (STRG+C) und fügen Sie sie im Formular in das entsprechende Feld ein.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
