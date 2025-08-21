<script setup lang="ts">
import type { ChatMetadata, ChatUIMessage, Job } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { MODELS } from '~~/shared/constants'

const { data } = useNuxtData<Job[]>('jobs')
const jobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat<ChatUIMessage>({
  transport: new DefaultChatTransport({
    api: '/api/chats',
    prepareSendMessagesRequest({ messages }) {
      const body = {
        messages,
        jobs: [...jobs.value],
      }

      input.value = ''
      jobs.value = []

      return { body }
    },
  }),
  onData({ type, data }) {
    console.log({ type, data })
  },
  onError(error) {
    console.error(error)
  },

  messages: [
    {
      parts: [
        {
          type: 'text',
          text: 'Can you find for me jobs related to geography?\n\n',
        },
      ],
      id: 'qixkrtD1RyRP5fyf',
      role: 'user',
    },
    {
      id: 'ioJnRibYeKZixLTM',
      metadata: {
        model: 'gemini-2.0-flash',
        totalTokens: 30,
        inputTokens: 25,
        outputTokens: 5,
        duration: 3.023,
        finishReason: 'tool-calls',
      },
      role: 'assistant',
      parts: [
        {
          type: 'data-classification',
          id: 'YTWkqmeSVQzbNFq3',
          data: {
            reasoning: 'This is a request to search the job database for jobs related to geography.',
            type: 'job_search',
            confidence: 0.98,
            status: 'done',
          },
        },
        {
          type: 'step-start',
        },
        {
          type: 'tool-get_jobs',
          toolCallId: 'bKmoRdNTHAS28Hg8',
          state: 'output-available',
          input: {
            query: 'geography',
          },
          output: {
            jobs: [
              {
                jobId: '822802',
                angebotstitel: 'Geoinformatiker/in',
                kurzbeschreibung: 'Zur Verstärkung unseres Teams suchen wie zum nächstmöglichen Zeitpunkt in Vollzeit ein:e Geoinformatiker/in (d/m/w) in Homeoffice/Hybrid (Grafenwoehr)',
                firma: 'NRI GmbH',
                emailAnsprechpartner: 'info@nri-site.com',
                freigabedatum: '2024-04-23T08:05:00.600Z',
                arbeitsort: '92655 Grafenwöhr, Germany',
                anzeigeText: 'Über UnsDie Natural Resource Innovations GmbH (NRI) ist ein führendes Dienstleistungsunternehmen im Bereich Umwelttechnik und Umweltmanagement. Wir sind ein Team von innovativen Ingenieuren und Beratern, das eng mit Unternehmen zusammenarbeitet, um deren Geodatenmanagement kundenorientiert und effizient zu optimieren. NRI erstellt, verwaltet und analysiert GIS und CAD-Daten im Bereich Umweltmanagement, und Liegenschaftsmanagement. Von der Projektplanung über die Projektsteuerung, bis hin zur Projektumsetzung, decken wir alle Bereiche ab, um einen reibungslosen Projektabschluss zu gewährleisten.\nIhre Aufgaben:\n Konsolidierung und Überprüfung vorhandener (Geo)daten\n Aktualisierung und Einarbeitung von Sachdaten in Geodatenbanken\n Fortführung und Neuanlage von Metadaten gemäß vorgegebenen Standards\n Akquise und Validierung von räumlichen Daten\n Integration von CAD-Daten in Geodatenbanken\n Betreuung und Pflege von Raumdatenbanken\n Bestandsaufnahme und Abgleich von Referenzplänen\n Erstellung, Durchführung und Bereitstellung von Datenauswertungen\n\nQualifikationen und Anforderungen\n Staatsangehörigkeit NATO- Mitgliedstaaten und mindestens 2 Jahre Aufenthalt in Deutschland (wegen Zusammenarbeit mit NATO-Mitgliedstaaten)\n Studium der Kartografie, Geoinformatik, Geografie, Umwelttechnik mit dem Schwerpunkt GIS oder eine vergleichbare Ausbildung\n Gute Erfahrung mit GIS und CAD Software (ArcGIS/ArcPro, MicroStation, AutoCAD)\n Erfahrung mit MS Office insbesondere MS Access / Excel\n Sachkenntnisse im Bereich Kartierung\n Englisch- und Deutschkenntnissen auf hohem Niveau (C1)\n Führerschein Kat. B\n Geringe Reisebereitschaft (4-5 mal im Jahr)\n\nWas bieten wir an\n Attraktives Gehalt\n Flexible Arbeitszeiten\n Mitarbeit in einem internationalen Team\n Regelmäßige Team-Workshops und Training in unserem Hauptsitz in Heidelberg\n Zahlreiche Entwicklungsmöglichkeiten durch individuelle Weiterbildungsmöglichkeiten im Unternehmen\n Die Position ist Home-Office-basiert, es wird jedoch erwartet, dass Sie einige Male im Jahr zum Kunden (Grafenwöhr, Bayern) reisen.\n\nSo bewerben Sie sich:Bitte senden Sie Ihren Lebenslauf und zeitliche Verfügbarkeit per E-Mail an:\n\nMarzena Wicht\n\nE-Mail: info&#64;nri-site.com',
                country: 'DE',
                einleitungTitel: 'Über Uns',
                einleitungText: '<p>Die Natural Resource Innovations GmbH (NRI) ist ein führendes Dienstleistungsunternehmen im Bereich Umwelttechnik und Umweltmanagement. Wir sind ein Team von innovativen Ingenieuren und Beratern, das eng mit Unternehmen zusammenarbeitet, um deren Geodatenmanagement kundenorientiert und effizient zu optimieren. NRI erstellt, verwaltet und analysiert GIS und CAD-Daten im Bereich Umweltmanagement, und Liegenschaftsmanagement. Von der Projektplanung über die Projektsteuerung, bis hin zur Projektumsetzung, decken wir alle Bereiche ab, um einen reibungslosen Projektabschluss zu gewährleisten.</p>',
                aufgabenTitel: 'Ihre Aufgaben:',
                aufgabenText: '<ul><li>Konsolidierung und Überprüfung vorhandener (Geo)daten</li><li>Aktualisierung und Einarbeitung von Sachdaten in Geodatenbanken</li><li>Fortführung und Neuanlage von Metadaten gemäß vorgegebenen Standards</li><li>Akquise und Validierung von räumlichen Daten</li><li>Integration von CAD-Daten in Geodatenbanken</li><li>Betreuung und Pflege von Raumdatenbanken</li><li>Bestandsaufnahme und Abgleich von Referenzplänen</li><li>Erstellung, Durchführung und Bereitstellung von Datenauswertungen</li></ul>',
                erwartungenTitel: 'Qualifikationen und Anforderungen',
                erwartungenText: '<ul><li><strong>Staatsangehörigkeit NATO- Mitgliedstaaten und mindestens 2 Jahre Aufenthalt in Deutschland (wegen Zusammenarbeit mit NATO-Mitgliedstaaten)</strong></li><li>Studium der Kartografie, Geoinformatik, Geografie, Umwelttechnik mit dem Schwerpunkt GIS oder eine vergleichbare Ausbildung</li><li>Gute Erfahrung mit GIS und CAD Software (ArcGIS/ArcPro, MicroStation, AutoCAD)</li><li>Erfahrung mit MS Office insbesondere MS Access / Excel</li><li>Sachkenntnisse im Bereich Kartierung</li><li>Englisch- und Deutschkenntnissen auf hohem Niveau (C1)</li><li>Führerschein Kat. B</li><li>Geringe Reisebereitschaft (4-5 mal im Jahr)</li></ul>',
                angebotTitel: 'Was bieten wir an',
                angebotText: '<ul><li>Attraktives Gehalt</li><li>Flexible Arbeitszeiten</li><li>Mitarbeit in einem internationalen Team</li><li>Regelmäßige Team-Workshops und Training in unserem Hauptsitz in Heidelberg</li><li>Zahlreiche Entwicklungsmöglichkeiten durch individuelle Weiterbildungsmöglichkeiten im Unternehmen</li><li>Die Position ist Home-Office-basiert, es wird jedoch erwartet, dass Sie einige Male im Jahr zum Kunden (Grafenwöhr, Bayern) reisen.</li></ul>',
                kontaktTitel: 'So bewerben Sie sich:',
                kontaktText: '<p><strong>Bitte senden Sie Ihren Lebenslauf und zeitliche Verfügbarkeit per E-Mail an:</strong></p>\n\n<p>Marzena Wicht</p>\n\n<p>E-Mail: info&#64;nri-site.com</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 20,
                arbeitszeitMax: 40,
                berufsfelder: 'Bau, Vermessung, Gebäudetechnik und Architektur|Geoinformatik|Klimawandel, Naturschutz, Umweltplanung|Technische Entwicklung, Konstruktion, CAD',
                fachbereiche: 'Angewandte Geistes- und Naturwissenschaften|Geoinformation|Maschinenbau/Umwelttechnik',
                homeoffice: '50-100% Homeoffice',
                jobtypen: 'Berufseinstieg nach dem Studium',
                score: 1,
              },
              {
                jobId: '822803',
                angebotstitel: 'Projektleiter (m/w/d) Altlasten und Umweltschutz',
                kurzbeschreibung: 'Zur Verstärkung unseres Teams am Standort München suchen wir zum nächstmöglichen Zeitpunkt einen Projektleiter (m/w/d) im Bereich Altlasten und Umweltschutz in Vollzeit.',
                firma: 'BFM Umwelt GmbH',
                emailAnsprechpartner: 'info@bfm-umwelt.de',
                freigabedatum: '2024-04-23T07:48:15.407Z',
                arbeitsort: 'München, Deutschland',
                anzeigeText: 'Die BFM Umwelt GmbH ist ein Sachverständigen- und Ingenieurbüro mit Hauptsitz in München Obermenzing sowie einer Niederlassung in Düsseldorf.Seit Gründung im Jahr 1998 bieten wir mit einem dynamischen und innovativen Team ein umfassendes Spektrum an Beratungs- und Planungsleistungen sowie Gutachter- und Sachverständigentätigkeiten in den Bereichen Altlasten, Flächenrecycling und Stoffstrommanagement sowie Gebäudeschadstoffe und Raumlufthygiene. Zur Gestaltung einer nachhaltigen Zukunft bieten wir zudem Planungsleistungen zur Nutzung der Geothermie an.\n\nFür uns stehen bei der Bearbeitung unserer komplexen Aufgabenstellungen kollegiale Strukturen und flache Hierarchien im Mittelpunkt.\n\nZur Verstärkung unseres Teams am Standort München suchen wir zum nächstmöglichen Zeitpunkt einen\nProjektleiter (m/w/d) im Bereich Altlasten und Umweltschutz in Vollzeit. \nIhre Aufgaben in unserem Unternehmen: \n  Selbständige Leitung und Bearbeitung von anspruchsvollen Projekten im Bereich Altlasten\n  Durchführung sowie Auswertung und Dokumentation von Untersuchungskampagnen\n  Erstellung von Planungen, Ausschreibungen und Gutachten\n  Fachgutachterliche Begleitung und örtliche Bauüberwachung von Baustellen\n  Projekt-Controlling sowie Abrechnung und Nachtragsmanagement\n  Kundenbetreuung und Akquisition\n\n\n \nDamit überzeugen Sie uns: \n Abgeschlossenes Studium im Bereich Natur-, Umwelt- oder Ingenieurwissenschaften\n Mehrjährige Berufserfahrung in den Bereichen Boden- und Grundwasserverunreinigungen,\n Flächenrecycling und Gebäuderückbau sowie umwelttechnischer Anlagen\n Sachkunde nach LAGA PN 98, DGUV-R 101-004, TRGS 519 und TRGS 521 von Vorteil\n Teamfähigkeit sowie motivierte, selbständige und qualitätsbewusste Arbeitsweise\n Sehr gute Deutschkenntnisse in Wort und Schrift\n Führerschein Klasse B\n\nWir bieten Ihnen: \n Unbefristetes Arbeitsverhältnis\n Leistungsgerechte Bezahlung sowie Sonderleistungen\n Flexible Arbeitszeiten und mobiles Arbeiten\n Abwechslungsreiche und zukunftssichere Tätigkeit in einem jungen, engagierten Team\n Individuelle Weiterbildungsangebote, beispielsweise zur / zum Sachverständigen\n Möglichkeiten zur Erweiterung der Themenschwerpunkte u.a. in Richtung Gebäudeschadstoffe und Geothermie\n\nInteresse? Schicken Sie bitte Ihre aussagekräftige Bewerbung an info&#64;bfm-umwelt.de ! \n\nAnsprechpartnerin: Frau Siri Romboy',
                country: 'DE',
                einleitungTitel: 'Die BFM Umwelt GmbH ist ein Sachverständigen- und Ingenieurbüro mit Hauptsitz in München Obermenzing  sowie einer Niederlassung in Düsseldorf.',
                einleitungText: '<p>Seit Gr&uuml;ndung im Jahr 1998 bieten wir mit einem dynamischen und innovativen Team ein umfassendes Spektrum an Beratungs- und Planungsleistungen sowie Gutachter- und Sachverst&auml;ndigent&auml;tigkeiten in den Bereichen Altlasten, Fl&auml;chenrecycling und Stoffstrommanagement sowie Geb&auml;udeschadstoffe und Raumlufthygiene. Zur Gestaltung einer nachhaltigen Zukunft bieten wir zudem Planungsleistungen zur Nutzung der Geothermie an.</p>\n\n<p>&nbsp;</p>\n\n<p>F&uuml;r uns stehen bei der Bearbeitung unserer komplexen Aufgabenstellungen kollegiale Strukturen und flache Hierarchien im Mittelpunkt.</p>\n\n<p>&nbsp;</p>\n\n<p>Zur Verst&auml;rkung unseres Teams am Standort M&uuml;nchen suchen wir zum n&auml;chstm&ouml;glichen Zeitpunkt einen Projektleiter (m/w/d) im Bereich Altlasten und Umweltschutz in Vollzeit.&nbsp;</p>',
                aufgabenTitel: 'Ihre Aufgaben in unserem Unternehmen:',
                aufgabenText: '<ul>\n\t<li>Selbst&auml;ndige Leitung und Bearbeitung von anspruchsvollen Projekten im Bereich Altlasten</li>\n\t<li>Durchf&uuml;hrung sowie Auswertung und Dokumentation von Untersuchungskampagnen</li>\n\t<li>Erstellung von Planungen, Ausschreibungen und Gutachten</li>\n\t<li>Fachgutachterliche Begleitung und &ouml;rtliche Bau&uuml;berwachung von Baustellen</li>\n\t<li>Projekt-Controlling sowie Abrechnung und Nachtragsmanagement</li>\n\t<li>Kundenbetreuung und Akquisition</li>\n</ul>\n\n<p>&nbsp;</p>',
                erwartungenTitel: 'Damit überzeugen Sie uns:',
                erwartungenText: '<ul>\n\t<li>Abgeschlossenes Studium im Bereich Natur-, Umwelt- oder Ingenieurwissenschaften</li>\n\t<li>Mehrj&auml;hrige Berufserfahrung in den Bereichen Boden- und Grundwasserverunreinigungen,</li>\n\t<li>Fl&auml;chenrecycling und Geb&auml;uder&uuml;ckbau sowie umwelttechnischer Anlagen</li>\n\t<li>Sachkunde nach LAGA PN 98, DGUV-R 101-004, TRGS 519 und TRGS 521 von Vorteil</li>\n\t<li>Teamf&auml;higkeit sowie motivierte, selbst&auml;ndige und qualit&auml;tsbewusste Arbeitsweise</li>\n\t<li>Sehr gute Deutschkenntnisse in Wort und Schrift</li>\n\t<li>F&uuml;hrerschein Klasse B</li>\n</ul>',
                angebotTitel: 'Wir bieten Ihnen:',
                angebotText: '<ul>\n\t<li>Unbefristetes Arbeitsverh&auml;ltnis</li>\n\t<li>Leistungsgerechte Bezahlung sowie Sonderleistungen</li>\n\t<li>Flexible Arbeitszeiten und mobiles Arbeiten</li>\n\t<li>Abwechslungsreiche und zukunftssichere T&auml;tigkeit in einem jungen, engagierten Team</li>\n\t<li>Individuelle Weiterbildungsangebote, beispielsweise zur / zum Sachverst&auml;ndigen</li>\n\t<li>M&ouml;glichkeiten zur Erweiterung der Themenschwerpunkte u.a. in Richtung Geb&auml;udeschadstoffe und Geothermie</li>\n</ul>',
                kontaktTitel: 'Interesse?',
                kontaktText: '<p>Schicken Sie bitte Ihre aussagekr&auml;ftige Bewerbung an<strong> info@bfm-umwelt.de ! </strong></p>\n\n<p>&nbsp;</p>\n\n<p>Ansprechpartnerin: Frau Siri Romboy</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 40,
                arbeitszeitMax: 40,
                berufsfelder: 'Klimawandel, Naturschutz, Umweltplanung|Umweltingenieurwesen',
                fachbereiche: 'Angewandte Geistes- und Naturwissenschaften|Angewandte Natur- und Geisteswissenschaften|Angewandte Natur- und Kulturwissenschaften|Angewandte Naturwissenschaften|Architektur und Bauingenieurwesen|Architektur und Bauwesen|Bauingenieurwesen|Geoinformation|Ingenieurwissenschaften|Interdisziplinäre und innovative Wissenschaften|Maschinenbau und Verfahrenstechnik|Maschinenbau/Umwelttechnik|Naturschutz / Umweltplanung|Studium Generale und Interdisziplinäre Studien|Technik|Umweltsicherung / Wassertechnologie|Verfahrenstechnik',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Berufseinstieg nach dem Studium',
                score: 0.956707805765783,
              },
              {
                jobId: '822850',
                angebotstitel: 'Praktikant / Werkstudent (m/w/d) Recruiting/ Personal',
                kurzbeschreibung: 'Praktikant/Werkstudent (m/w/d) gesucht: Aktives Mitarbeiten und Gestalten im Recruiting von Kandidat:innen in einer inhabergeführten Personalberatung!',
                firma: 'Theo Klein+Partner Personalberatung',
                emailAnsprechpartner: 'hr@tklein-partner.de',
                freigabedatum: '2024-04-23T10:57:52.543Z',
                arbeitsort: '63868 Großwallstadt, Deutschland',
                anzeigeText: 'Über uns:Nach unserer Philosophie „Beratung mit Begeisterung und Disziplin“ erarbeiten wir gemeinsam mit unseren\nmittelständischen Kunden aus Industrie, Handel und Dienstleistung pragmatische Konzepte zur Steigerung\ndes Unternehmenswertes und setzen diese gemeinsam um. Unsere Schwerpunkte liegen dabei in den Bereichen Einkauf, Vertrieb und Personal.\nWir wachsen weiter, daher suchen wir Dich zur Unterstützung für unser Team.\nDeine Aufgaben:\n Unterstützung des Beraterteams im Recruiting sowie im administrativen Bereich\n Gestaltung und Schaltung von Stellenanzeigen auf diversen Plattformen\n Kreative Identifizierung und professionelle Erstansprache geeigneter Kandidat:innen über Social-Media-Plattformen (XING, LinkedIn, Facebook, etc.)\n Eigenverantwortliche Kandidatenauswahl sowie weiterführende Bewerberkorrespondenz\n Unterstützung bei der Einführung eines Bewerber- und Datenbankmanagementsystems\n Gestaltung und Optimierung unseres Employer Brandings auf den Social-Media-Kanälen sowie Unterstützung in der Umsetzung von Online-Kampagnen\n\nDein Profil:\n Immatrikulierter Student (m/w/d) in einem betriebswirtschaftlichen oder vergleichbaren Studiengang\n Erfahrung und Affinität im Umgang mit sozialen Netzwerken\n Sehr gute Deutschkenntnisse in Wort und Schrift\n Routinierter Umgang mit den gängigen Office-Anwendungen\n Spaß am Telefonieren und Kommunizieren\n Selbständige, zielorientierte Arbeitsweise sowie Teamfähigkeit\n\nUnser Angebot:\n Spannende, abwechslungsreiche Aufgaben in einem jungen und dynamischen Team\n Eigenverantwortliches Arbeiten in einem familiengeführten Beratungshaus\n Flexible Arbeitszeitgestaltung z.B. in Form einer 4-Tage-Woche (auch im Praktikum&#x1f919;&#x1f3fc;)\n Faires Gehalt, kostenloser Parkplatz und tageweise Home-Office\n Wasser- und Kaffee-Flat statt Kaffee kochen &#x1f60a;\n\nHaben wir Dein Interesse geweckt?Dann rufe gerne unsere Berater Marcel oder Michelle an, nimm Kontakt über den QR-Code via Whatsapp auf oder sende uns deinen Lebenslauf an: hr&#64;tklein-partner.de',
                country: 'DE',
                einleitungTitel: 'Über uns:',
                einleitungText: '<p>Nach unserer Philosophie „Beratung mit Begeisterung und Disziplin“ erarbeiten wir gemeinsam mit unseren\nmittelständischen Kunden aus Industrie, Handel und Dienstleistung pragmatische Konzepte zur Steigerung\ndes Unternehmenswertes und setzen diese gemeinsam um. Unsere Schwerpunkte liegen dabei in den Bereichen Einkauf, Vertrieb und Personal.\nWir wachsen weiter, daher suchen wir Dich zur Unterstützung für unser Team.</p>',
                aufgabenTitel: 'Deine Aufgaben:',
                aufgabenText: '<ul><li>Unterstützung des Beraterteams im Recruiting sowie im administrativen Bereich</li><li>Gestaltung und Schaltung von Stellenanzeigen auf diversen Plattformen</li><li>Kreative Identifizierung und professionelle Erstansprache geeigneter Kandidat:innen über Social-Media-Plattformen (XING, LinkedIn, Facebook, etc.)</li><li>Eigenverantwortliche Kandidatenauswahl sowie weiterführende Bewerberkorrespondenz</li><li>Unterstützung bei der Einführung eines Bewerber- und Datenbankmanagementsystems</li><li>Gestaltung und Optimierung unseres Employer Brandings auf den Social-Media-Kanälen sowie Unterstützung in der Umsetzung von Online-Kampagnen</li></ul>',
                erwartungenTitel: 'Dein Profil:',
                erwartungenText: '<ul><li>Immatrikulierter Student (m/w/d) in einem betriebswirtschaftlichen oder vergleichbaren Studiengang</li><li>Erfahrung und Affinität im Umgang mit sozialen Netzwerken</li><li>Sehr gute Deutschkenntnisse in Wort und Schrift</li><li>Routinierter Umgang mit den gängigen Office-Anwendungen</li><li>Spaß am Telefonieren und Kommunizieren</li><li>Selbständige, zielorientierte Arbeitsweise sowie Teamfähigkeit</li></ul>',
                angebotTitel: 'Unser Angebot:',
                angebotText: '<ul><li>Spannende, abwechslungsreiche Aufgaben in einem jungen und dynamischen Team</li><li>Eigenverantwortliches Arbeiten in einem familiengeführten Beratungshaus</li><li>Flexible Arbeitszeitgestaltung z.B. in Form einer 4-Tage-Woche (auch im Praktikum&#x1f919;&#x1f3fc;)</li><li>Faires Gehalt, kostenloser Parkplatz und tageweise Home-Office</li><li>Wasser- und Kaffee-Flat statt Kaffee kochen &#x1f60a;</li></ul>',
                kontaktTitel: 'Haben wir Dein Interesse geweckt?',
                kontaktText: '<p>Dann rufe gerne unsere Berater Marcel oder Michelle an, nimm Kontakt über den QR-Code via Whatsapp auf oder sende uns deinen Lebenslauf an: hr&#64;tklein-partner.de</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 15,
                arbeitszeitMax: 35,
                berufsfelder: 'Management und Beratung, Consulting|Personalwesen, HR, Recruiting',
                fachbereiche: 'Wirtschaft und Recht',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Praktikum|Werkstudierendenstelle und HiWi-Stellen',
                score: 0.9406456789689854,
              },
              {
                jobId: '822885',
                angebotstitel: 'Werkstudent (m/w/d) in Kronach gesucht',
                kurzbeschreibung: 'Wärst Du gerne Teil eines innovativen und flexiblen Beratungsunternehmens, das seit über\n10 Jahren aus Überzeugung nachhaltige Geldanlagen und Versicherungen anbietet und hast Du Freude an der Unterstützung bei der allgemeinen Büroorganisation, Datenpflege und Zuarbeit für unsere Partner, dann suchen wir Dich!',
                firma: 'MehrWert',
                emailAnsprechpartner: 'info@mehrwert-finanzen.net',
                freigabedatum: '2024-04-23T12:31:35.113Z',
                arbeitsort: '96317 Kronach-Fischbach, Deutschland',
                anzeigeText: 'MehrWert GmbH - Nachhaltigkeit ist eine Selbstverständlichkeit in unserer BeratungMehrWert ist ein banken- und versicherungsunabhängiges Beratungsunternehmen und berät seit Gründung im Jahr 2010 Kunden aus Überzeugung ausschließlich in den Bereichen der nachhaltigen Geldanlage, der grünen Altersvorsorgestrategien und weiteren nachhaltigen Finanzdienstleistungen. Zu unseren Kunden zählen Privatkunden, nachhaltig ausgerichtete Unternehmen, Stiftungen und kirchliche Einrichtungen. Wir sind ein innovatives und professionell arbeitendes Beratungsunternehmen, bei dem unsere Mandanten im Mittelpunkt stehen. Mit unserer Arbeit wollen wir etwas bewegen und einen positiven Impact für Mensch, Gesellschaft, Natur und Klima erzielen.\nBürounterstützung für bis zu 10 Stunden pro WocheWir suchen Deine Unterstützung für:\n\n\n Datenpflege\n Allgemeine Büroorganisation\n Zuarbeit für MehrWert Berater und Beraterinnen\n Rückfragen bei Versicherern\n Antragsüberwachung\n\nFür die Arbeitsstelle benötigst Du gute MS-Office Kenntnisse und eine strukturierte und selbstständige Arbeitweise.Du passt am besten zu uns, wenn Du:\n\n\n über eine strukturierte und selbständige Arbeitsweise verfügst.\n gute MS-Office Kenntnisse hast\n ein positiver Mensch mit Interesse an nachhaltigen Themen und ein Teamplayer bist\n eingeschriebene Studentin/eingeschriebener Student bist\n eine abgeschlossene Ausbildung im Versicherungs- oder Bankenwesen hast, dies ist aber keine Voraussetzung\n\nWir bieten Dir flexible Arbeitszeiten, Gestaltungsspielraum und die Möglichkeit, neue Ideen einzubringen.\n Vielseitige Aufgaben, bei denen Du mitgestalten kannst\n Bei uns stehen die Menschen im Mittelpunkt\n Du arbeitest in Kronach\n Erfolge werden gefeiert\n Dein Studium steht im Vordergrund, deshalb kann Deine Arbeitszeit flexibel gestaltet werden\n Du erhältst individuelle Förderung\n\nGerne kannst Du Deine Bewerbungsunterlagen mit Anschreiben, Lebenslauf und Zeugnissen per Mail an uns schicken.Passen wir zu Dir? Dann freuen wir uns auf Deine Bewerbung. Schicke sie bitte an:\n\nHeike Beimborn info&#64;mehrwert-finanzen.net\n\nBei Rückfragen kannst Du Frau Beimborn gerne unter der 0951-30125565 anrufen.',
                country: 'DE',
                einleitungTitel: 'MehrWert GmbH - Nachhaltigkeit ist eine Selbstverständlichkeit in unserer Beratung',
                einleitungText: '<p><strong>MehrWert</strong> ist ein banken- und versicherungsunabhängiges Beratungsunternehmen und berät seit Gründung im Jahr 2010 Kunden aus Überzeugung ausschließlich in den Bereichen der nachhaltigen Geldanlage, der grünen Altersvorsorgestrategien und weiteren nachhaltigen Finanzdienstleistungen. Zu unseren Kunden zählen Privatkunden, nachhaltig ausgerichtete Unternehmen, Stiftungen und kirchliche Einrichtungen. Wir sind ein innovatives und professionell arbeitendes Beratungsunternehmen, bei dem unsere Mandanten im Mittelpunkt stehen. Mit unserer Arbeit wollen wir etwas bewegen und einen positiven Impact für Mensch, Gesellschaft, Natur und Klima erzielen.</p>',
                aufgabenTitel: 'Bürounterstützung für bis zu 10 Stunden pro Woche',
                aufgabenText: '<p>Wir suchen Deine Unterstützung für:</p>\n\n<ol><li>Datenpflege</li><li>Allgemeine Büroorganisation</li><li>Zuarbeit für MehrWert Berater und Beraterinnen</li><li>Rückfragen bei Versicherern</li><li>Antragsüberwachung</li></ol>',
                erwartungenTitel: 'Für die Arbeitsstelle benötigst Du gute MS-Office Kenntnisse und eine strukturierte und selbstständige Arbeitweise.',
                erwartungenText: '<p>Du passt am besten zu uns, wenn Du:</p>\n\n<ul><li>über eine strukturierte und selbständige Arbeitsweise verfügst.</li><li>gute MS-Office Kenntnisse hast</li><li>ein positiver Mensch mit Interesse an nachhaltigen Themen und ein Teamplayer bist</li><li>eingeschriebene Studentin/eingeschriebener Student bist</li><li>eine abgeschlossene Ausbildung im Versicherungs- oder Bankenwesen hast, dies ist aber <strong>keine</strong> Voraussetzung</li></ul>',
                angebotTitel: 'Wir bieten Dir flexible Arbeitszeiten, Gestaltungsspielraum und die Möglichkeit, neue Ideen einzubringen.',
                angebotText: '<ul><li>Vielseitige Aufgaben, bei denen Du mitgestalten kannst</li><li>Bei uns stehen die Menschen im Mittelpunkt</li><li>Du arbeitest in Kronach</li><li>Erfolge werden gefeiert</li><li>Dein Studium steht im Vordergrund, deshalb kann Deine Arbeitszeit flexibel gestaltet werden</li><li>Du erhältst individuelle Förderung</li></ul>',
                kontaktTitel: 'Gerne kannst Du Deine Bewerbungsunterlagen mit Anschreiben, Lebenslauf und Zeugnissen per Mail an uns schicken.',
                kontaktText: '<p>Passen wir zu Dir? Dann freuen wir uns auf Deine Bewerbung. Schicke sie bitte an:</p>\n\n<p>Heike Beimborn info&#64;mehrwert-finanzen.net</p>\n\n<p>Bei Rückfragen kannst Du Frau Beimborn gerne unter der 0951-30125565 anrufen.</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 5,
                arbeitszeitMax: 10,
                berufsfelder: 'Banken, Finanzdienstleister, Versicherungen, Immobilien|Finanzen, Controlling, Buchhaltung, Finance|Sonstige|Verwaltung, Assistenz, Organisation, Sekretariat',
                fachbereiche: 'Angewandte Naturwissenschaften|Soziale Arbeit und Gesundheit|Wirtschaftswissenschaften',
                homeoffice: '0% Homeoffice',
                jobtypen: 'Werkstudierendenstelle und HiWi-Stellen',
                score: 0.9187460646421433,
              },
              {
                jobId: '822934',
                angebotstitel: 'Marketing Werkstudent/-in (w, m, d)',
                kurzbeschreibung: 'Unser nettes Marketing-Team sucht baldmöglichst eine motivierte Unterstützung für verschiedene Tätigkeiten rund um das Kanzleimarketing',
                firma: 'Maiwald GmbH',
                emailAnsprechpartner: 'karriere@maiwald.eu',
                freigabedatum: '2024-04-23T14:11:14.447Z',
                arbeitsort: 'München, Deutschland',
                anzeigeText: 'Moderne Patent- und Rechtsanwaltskanzlei im Herzen MünchensUnsere Unternehmenskultur ist geprägt von einem besonderen Teamgeist, der sich in einer Mischung aus Begeisterung, Offenheit, Inspiration und gegenseitiger Wertschätzung widerspiegelt.\nDas sind deine Aufgaben \n\n\n Erstellen und Organisieren von Inhalten für Newsletter und Website\n Entwerfen und Veröffentlichen von Social-Media-Beiträgen (Text, Bild, Video) für alle Marketing-Bereiche (Content, Event, Employer Branding, …) und Entwickeln neuer Formate\n Unterstützung bei der Umsetzung von Kampagnen (paid und organic) für diverse Marketing-Kanäle\n Einbringen neuer Ideen und Umsetzung in Abstimmung mit unserem Marketingteam (online und offline)\n Unterstützung bei der Pressearbeit\n Organisation und Unterstützung in der Durchführung von Online-Events und Video-Seminaren\n Mitwirkung bei der Produktion von Videoformaten im hauseigenen Filmstudio\n Mitwirkung bei der Pflege der CRM-Datenbank\n generelle Unterstützung unseres Marketingteams\n\nDein Profil\n Student/in (m/w/d) der Fachrichtung Marketing, digitale Medien, Medien- und Kommunikations- oder Sprach-/Literaturwissenschaften oder Vergleichbarem mit Affinität für Online-Marketing\n sehr gutes Ausdrucksvermögen in Deutsch und Englisch in Wort und Schrift sowie jeweils passender Ton, egal ob z. B. bei LinkedIn, im Blogartikel oder den Newsletter-Inhalten\n kreative Ideen und Vorschläge für Marketingaktivitäten\n gute Kenntnisse in MS Office\n\nWir bieten dir:\n eine Beschäftigung mit flexiblen Arbeitszeiten, die gut mit Deinem Studium zu vereinbaren ist (12-20h/Woche) mit der Möglichkeit, auch remote zu arbeiten\n einen modernen Arbeitsplatz mitten in München - direkt am Hauptbahnhof\n die Zusammenarbeit mit zwei sehr netten Kolleginnen im Umfeld eines motivierten internationalen Teams\n eine freundliche und ungezwungene Arbeitsatmosphäre mit Open-Door-Policy\n freie Getränke und wöchentliche Obstkörbe\n abwechslungsreiche Mitarbeiter:innen-Events\n Fahrtkostenerstattung im MVV-Bereich\n Vergünstigungen bei bekannten Marken und Anbietern im Rahmen von „Corporate Benefits“\n\nBewerbungsunterlagen inkl. Anschreiben als pdf per EmailKristin Pichler',
                country: 'DE',
                einleitungTitel: 'Moderne Patent- und Rechtsanwaltskanzlei im Herzen Münchens',
                einleitungText: '<p>Unsere Unternehmenskultur ist gepr&auml;gt von einem besonderen Teamgeist, der sich in einer Mischung aus Begeisterung, Offenheit, Inspiration und gegenseitiger Wertsch&auml;tzung widerspiegelt.</p>',
                aufgabenTitel: 'Das sind deine Aufgaben',
                aufgabenText: '<ul>\n\t<li>Erstellen und Organisieren von Inhalten f&uuml;r Newsletter und Website</li>\n\t<li>Entwerfen und Ver&ouml;ffentlichen von Social-Media-Beitr&auml;gen (Text, Bild, Video) f&uuml;r alle Marketing-Bereiche (Content, Event, Employer Branding, &hellip;) und Entwickeln neuer Formate</li>\n\t<li>Unterst&uuml;tzung bei der Umsetzung von Kampagnen (paid und organic) f&uuml;r diverse Marketing-Kan&auml;le</li>\n\t<li>Einbringen neuer Ideen und Umsetzung in Abstimmung mit unserem Marketingteam (online und offline)</li>\n\t<li>Unterst&uuml;tzung bei der Pressearbeit</li>\n\t<li>Organisation und Unterst&uuml;tzung in der Durchf&uuml;hrung von Online-Events und Video-Seminaren</li>\n\t<li>Mitwirkung bei der Produktion von Videoformaten im hauseigenen Filmstudio</li>\n\t<li>Mitwirkung bei der Pflege der CRM-Datenbank</li>\n\t<li>generelle Unterst&uuml;tzung unseres Marketingteams</li>\n</ul>',
                erwartungenTitel: 'Dein Profil',
                erwartungenText: '<ul>\n\t<li>Student/in (m/w/d) der Fachrichtung Marketing, digitale Medien, Medien- und Kommunikations- oder Sprach-/Literaturwissenschaften oder Vergleichbarem mit Affinit&auml;t f&uuml;r Online-Marketing</li>\n\t<li>sehr gutes Ausdrucksverm&ouml;gen in Deutsch und Englisch in Wort und Schrift sowie jeweils passender Ton, egal ob z. B. bei LinkedIn, im Blogartikel oder den Newsletter-Inhalten</li>\n\t<li>kreative Ideen und Vorschl&auml;ge f&uuml;r Marketingaktivit&auml;ten</li>\n\t<li>gute Kenntnisse in MS Office</li>\n</ul>',
                angebotTitel: 'Wir bieten dir:',
                angebotText: '<ul>\n\t<li>eine Besch&auml;ftigung mit flexiblen Arbeitszeiten, die gut mit Deinem Studium zu vereinbaren ist (12-20h/Woche) mit der M&ouml;glichkeit, auch remote zu arbeiten</li>\n\t<li>einen modernen Arbeitsplatz mitten in M&uuml;nchen - direkt am Hauptbahnhof</li>\n\t<li>die Zusammenarbeit mit zwei sehr netten Kolleginnen im Umfeld eines motivierten internationalen Teams</li>\n\t<li>eine freundliche und ungezwungene Arbeitsatmosph&auml;re mit Open-Door-Policy</li>\n\t<li>freie Getr&auml;nke und w&ouml;chentliche Obstk&ouml;rbe</li>\n\t<li>abwechslungsreiche Mitarbeiter:innen-Events</li>\n\t<li>Fahrtkostenerstattung im MVV-Bereich</li>\n\t<li>Verg&uuml;nstigungen bei bekannten Marken und Anbietern im Rahmen von &bdquo;Corporate Benefits&ldquo;</li>\n</ul>',
                kontaktTitel: 'Bewerbungsunterlagen inkl. Anschreiben als pdf per Email',
                kontaktText: '<p>Kristin Pichler</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 12,
                arbeitszeitMax: 20,
                berufsfelder: 'Marketing, Werbung, Kommunikation, PR, Online Marketing, Eventmanagement',
                fachbereiche: 'Betriebswirtschaft|Design|Gestaltung|Innenarchitektur|Tourismus|Wirtschaft',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Werkstudierendenstelle und HiWi-Stellen',
                score: 0.9168976931870624,
              },
              {
                jobId: '822807',
                angebotstitel: 'WERKSTUDENT/IN (m/w) Real Estate Immobilien & Asset Management / Portfoliomanagement',
                kurzbeschreibung: 'Sie sind ein motivierte/r Student/in mit Interesse am Immobilienbereich? Wir suchen eine/n zuverlässige/n Werksstudent/in, der/die uns bei verschiedenen Aufgaben im Immobilienmanagement unterstützt.\nBewerben Sie sich jetzt und werden Teil unseres engagierten Teams!',
                firma: 'RAC Real Assets Capital GmbH',
                emailAnsprechpartner: 'sl@rac-immobilien.de',
                freigabedatum: '2024-04-23T08:57:09.370Z',
                arbeitsort: '63739 Aschaffenburg-Innenstadt, Deutschland',
                anzeigeText: 'Über unsDie RAC Real Assets Capital GmbH konzentriert sich seit rund einem Jahrzehnt ausschließlich auf die akribische Identifikation, den reibungslosen Ankauf, die Bewirtschaftung und die Entwicklung von Immobilien. Hierbei investieren wir maßgeblich in den Aufbau eines eigenen langfristigen und nachhaltigen Portfolios.\n\n \n\nUnser Ziel ist es, durch innovative Konzepte und strategisches Management nachhaltige Werte zu schaffen und unser Office in Aschaffenburg mit folgenden offenen Positionen auszubauen.\nIhre Aufgaben\n Unterstützung des Immobilienteams bei der Markt- und Standortanalyse\n Recherche von Immobilienangeboten und -nachfrage\n Erstellung von Präsentationen und Exposés\n Unterstützung bei der Kundenbetreuung und Kommunikation\n Allgemeine administrative Aufgaben\n\nIhre Anforderungen\n Eingeschriebener Student/in im Bereich Immobilienwirtschaft\n Erste Erfahrungen im Immobilienbereich von Vorteil\n Sicherer Umgang mit MS-Office/Apple\n Gute Kommunikations- und Teamfähigkeiten\n Eigeninitiative, Zuverlässigkeit und strukturierte Arbeitsweise\n\nWas wir bieten\n Faire Bezahlung\n Bis zu 30 Urlaubstage\n Fahrtkostenzuschüsse und weitere Incentives\n Freies und modernes Arbeiten in dynamischem Team und attraktiven Arbeitsumfeld mit top Verkehrsanbindungen\n Flache Hierarchien\n Moderne IT\n Ansprechendes Büro\n\nInteressiert und wissbegierig?Wir freuen uns auf Ihre aussagekräftige Bewerbung unter Angabe Ihrer Gehaltsvorstellung und Ihres frühestmöglichen Eintrittstermins.\n\n \n\nBitte senden Sie Ihre Unterlagen an:\n\nsl&#64;rac-immobilien.de',
                country: 'DE',
                einleitungTitel: 'Über uns',
                einleitungText: '<p>Die RAC Real Assets Capital GmbH konzentriert sich seit rund einem Jahrzehnt ausschließlich auf die akribische Identifikation, den reibungslosen Ankauf, die Bewirtschaftung und die Entwicklung von Immobilien. Hierbei investieren wir maßgeblich in den Aufbau eines eigenen langfristigen und nachhaltigen Portfolios.</p>\n\n<p> </p>\n\n<p>Unser Ziel ist es, durch innovative Konzepte und strategisches Management nachhaltige Werte zu schaffen und unser Office in Aschaffenburg mit folgenden offenen Positionen auszubauen.</p>',
                aufgabenTitel: 'Ihre Aufgaben',
                aufgabenText: '<ul><li>Unterstützung des Immobilienteams bei der Markt- und Standortanalyse</li><li>Recherche von Immobilienangeboten und -nachfrage</li><li>Erstellung von Präsentationen und Exposés</li><li>Unterstützung bei der Kundenbetreuung und Kommunikation</li><li>Allgemeine administrative Aufgaben</li></ul>',
                erwartungenTitel: 'Ihre Anforderungen',
                erwartungenText: '<ul><li>Eingeschriebener Student/in im Bereich Immobilienwirtschaft</li><li>Erste Erfahrungen im Immobilienbereich von Vorteil</li><li>Sicherer Umgang mit MS-Office/Apple</li><li>Gute Kommunikations- und Teamfähigkeiten</li><li>Eigeninitiative, Zuverlässigkeit und strukturierte Arbeitsweise</li></ul>',
                angebotTitel: 'Was wir bieten',
                angebotText: '<ul><li>Faire Bezahlung</li><li>Bis zu 30 Urlaubstage</li><li>Fahrtkostenzuschüsse und weitere Incentives</li><li>Freies und modernes Arbeiten in dynamischem Team und attraktiven Arbeitsumfeld mit top Verkehrsanbindungen</li><li>Flache Hierarchien</li><li>Moderne IT</li><li>Ansprechendes Büro</li></ul>',
                kontaktTitel: 'Interessiert und wissbegierig?',
                kontaktText: '<p>Wir freuen uns auf Ihre aussagekräftige Bewerbung unter Angabe Ihrer Gehaltsvorstellung und Ihres frühestmöglichen Eintrittstermins.</p>\n\n<p> </p>\n\n<p>Bitte senden Sie Ihre Unterlagen an:</p>\n\n<p>sl&#64;rac-immobilien.de</p>',
                spracheDeutsch: false,
                spracheLand: false,
                arbeitszeitMin: 20,
                arbeitszeitMax: 20,
                berufsfelder: 'Banken, Finanzdienstleister, Versicherungen, Immobilien',
                fachbereiche: 'Gesundheitswissenschaften|Ingenieurwissenschaften|Wirtschaft und Recht',
                homeoffice: '0% Homeoffice',
                jobtypen: 'Werkstudierendenstelle und HiWi-Stellen',
                score: 0.9142247996981572,
              },
              {
                jobId: '822580',
                angebotstitel: 'Duales Studium Elektrotechnik zum 01.09.2024 / Kaufering, Landkreis Landsberg a. Lech',
                kurzbeschreibung: 'Du interessierst dich für Technik und Elektrotechnik im Besonderen? Du willst studieren aber auch die praktischen Seiten des Ingenieurberufs kennenlernen? Dann ist das Verbundstudium Elektrotechnik genau das richtige für dich!',
                firma: 'Hilti',
                emailAnsprechpartner: 'ausbildung@hilti.com',
                freigabedatum: '2024-04-23T07:01:30.547Z',
                arbeitsort: 'Hiltistraße 6, 86916 Kaufering, Deutschland',
                anzeigeText: 'Hier kannst du nicht nur deine Chance entdecken, sondern auch wirklich nutzen.Hilti bietet viele Entwicklungsmöglichkeiten während und nach der Ausbildung und fördert dich persönlich. Die Hilti Gruppe beliefert die Bau- und Energieindustrie weltweit mit technologisch führenden Produkten, Systemlösungen, Software und Serviceleistungen.\n\nHilti steht für Innovation, Qualität und direkte Kundenbeziehungen. Mit rund 34.000 Teammitgliedern in über 120 Ländern bieten wir Ihnen ein Umfeld, in dem Sie wachsen, sich beweisen und Ihre Karriere gestalten können.\nWas sind deine Aufgaben?Als Student (m/w/d) im Verbundstudium kombinierst du Studium und Ausbildung.\n\nDu absolvierst in der vorlesungsfreien Zeit eine Ausbildung zum Elektroniker (m/w/d) für Betriebstechnik und arbeitest praxisnah an interessanten und anspruchsvollen Projekten mit. Das Studium an der Hochschule Augsburg beginnst du nach dem 1. Ausbildungsjahr.\n\nWährend der Ausbildung erarbeitest du in unserer top ausgestatteten Elektrowerkstatt unter Anleitung in kleinen Projekten die elektrotechnischen Grundlagen wie die Planung und Installation von Maschinen und Anlagen, die Programmierung und Konfiguration von Automatisierungssystemen und Schaltgeräten sowie die Inbetriebnahme und das Überprüfen der Sicherheit nach geltenden Normen und Vorschriften. Nach dreieinhalb Jahren erfolgt die Prüfung vor der Industrie- und Handelskammer.\n\nIm Anschluss bist du während der vorlesungsfreien Zeit in den Entwicklungsbereichen eingesetzt und kannst dein gelerntes Know-How in der Praxis anwenden.\n\nWährend der gesamten Ausbildung stehen dir dein qualifizierter Ausbilder, Lernpartner und Kollegen mit Rat und Tat zur Seite.\nDeine Voraussetzungen:\n Abgeschlossene Fachhochschulreife oder das Abitur mit guten Leistungen in Mathematik und Physik\n Ausgeprägtes technisches und mathematisches Verständnis\n Interesse am Umgang mit mechanischen und elektronischen Geräten\n\nWas bieten wir:In unserem modernen Ausbildungszentrum sind wir in der Lage dich individuell auf deinem Weg zu begleiten. Du erhältst eine attraktive Ausbildungsvergütung über die komplette Studienzeit.\n\nWarum suchen wir gerade dich?\n\nUnser besonderes Anliegen: Unternehmerisch denkende, selbstbewusste Menschen auszubilden, die mit Begeisterung dranbleiben und nachhaltig erfolgreich sind. Das kannst du bei Projekten in Zusammenarbeit mit den Entwicklungsbereichen unter Beweis stellen.\nDein Kontakt zu uns:Interessiert? Dann freuen wir uns auf deine aussagekräftige Bewerbung. Bitte reiche deine vollständigen Bewerbungsunterlagen (Anschreiben, Lebenslauf, Zeugnisse) ausschließlich über unser Bewerberportal ein.\n\nHilti steht für Chancengleichheit, wir freuen uns insbesondere über Bewerbungen schwerbehinderter und ihnen gleichgestellter behinderter Menschen.\n\nKontakt: Hilti GmbH Industriegesellschaft für Befestigungstechnik I Lisa Bittner I Berufsausbildung I ausbildung&#64;hilti.com',
                country: 'DE',
                einleitungTitel: 'Hier kannst du nicht nur deine Chance entdecken, sondern auch wirklich nutzen.',
                einleitungText: '<p>Hilti bietet viele Entwicklungsm&ouml;glichkeiten w&auml;hrend und nach der Ausbildung und f&ouml;rdert dich pers&ouml;nlich. Die Hilti Gruppe beliefert die Bau- und Energieindustrie weltweit mit technologisch f&uuml;hrenden Produkten, Systeml&ouml;sungen, Software und Serviceleistungen.</p>\n\n<p>&nbsp;</p>\n\n<p>Hilti steht f&uuml;r Innovation, Qualit&auml;t und direkte Kundenbeziehungen. Mit rund 34.000 Teammitgliedern in &uuml;ber 120 L&auml;ndern bieten wir Ihnen ein Umfeld, in dem Sie wachsen, sich beweisen und Ihre Karriere gestalten k&ouml;nnen.</p>',
                aufgabenTitel: 'Was sind deine Aufgaben?',
                aufgabenText: '<p>Als Student (m/w/d) im Verbundstudium kombinierst du Studium und Ausbildung.</p>\n\n<p>&nbsp;</p>\n\n<p>Du absolvierst in der vorlesungsfreien Zeit eine Ausbildung zum Elektroniker (m/w/d) f&uuml;r Betriebstechnik und arbeitest praxisnah an interessanten und anspruchsvollen Projekten mit. Das Studium an der Hochschule Augsburg beginnst du nach dem 1. Ausbildungsjahr.</p>\n\n<p>&nbsp;</p>\n\n<p>W&auml;hrend der Ausbildung erarbeitest du in unserer top ausgestatteten Elektrowerkstatt unter Anleitung in kleinen Projekten die elektrotechnischen Grundlagen wie die Planung und Installation von Maschinen und Anlagen, die Programmierung und Konfiguration von Automatisierungssystemen und Schaltger&auml;ten sowie die Inbetriebnahme und das &Uuml;berpr&uuml;fen der Sicherheit nach geltenden Normen und Vorschriften. Nach dreieinhalb Jahren erfolgt die Pr&uuml;fung vor der Industrie- und Handelskammer.</p>\n\n<p>&nbsp;</p>\n\n<p>Im Anschluss bist du w&auml;hrend der vorlesungsfreien Zeit in den Entwicklungsbereichen eingesetzt und kannst dein gelerntes Know-How in der Praxis anwenden.</p>\n\n<p>&nbsp;</p>\n\n<p>W&auml;hrend der gesamten Ausbildung stehen dir dein qualifizierter Ausbilder, Lernpartner und Kollegen mit Rat und Tat zur Seite.</p>',
                erwartungenTitel: 'Deine Voraussetzungen:',
                erwartungenText: '<ul>\n\t<li>Abgeschlossene Fachhochschulreife oder das Abitur mit guten Leistungen in Mathematik und Physik</li>\n\t<li>Ausgepr&auml;gtes technisches und mathematisches Verst&auml;ndnis</li>\n\t<li>Interesse am Umgang mit mechanischen und elektronischen Ger&auml;ten</li>\n</ul>',
                angebotTitel: 'Was bieten wir:',
                angebotText: '<p>In unserem modernen Ausbildungszentrum sind wir in der Lage dich individuell auf deinem Weg zu begleiten. Du erh&auml;ltst eine attraktive Ausbildungsverg&uuml;tung &uuml;ber die komplette Studienzeit.</p>\n\n<p>&nbsp;</p>\n\n<p><strong>Warum suchen wir gerade dich?</strong></p>\n\n<p>&nbsp;</p>\n\n<p>Unser besonderes Anliegen: Unternehmerisch denkende, selbstbewusste Menschen auszubilden, die mit Begeisterung dranbleiben und nachhaltig erfolgreich sind. Das kannst du bei Projekten in Zusammenarbeit mit den Entwicklungsbereichen unter Beweis stellen.</p>',
                kontaktTitel: 'Dein Kontakt zu uns:',
                kontaktText: '<p>Interessiert? Dann freuen wir uns auf deine aussagekr&auml;ftige Bewerbung. Bitte reiche deine vollst&auml;ndigen Bewerbungsunterlagen (Anschreiben, Lebenslauf, Zeugnisse) ausschlie&szlig;lich &uuml;ber unser Bewerberportal ein.</p>\n\n<p>&nbsp;</p>\n\n<p>Hilti steht f&uuml;r Chancengleichheit, wir freuen uns insbesondere &uuml;ber Bewerbungen schwerbehinderter und ihnen gleichgestellter behinderter Menschen.</p>\n\n<p>&nbsp;</p>\n\n<p>Kontakt: Hilti GmbH Industriegesellschaft f&uuml;r Befestigungstechnik I Lisa Bittner&nbsp;I Berufsausbildung I ausbildung@hilti.com</p>\n\n<p>&nbsp;</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 35,
                arbeitszeitMax: 40,
                berufsfelder: 'Bau, Vermessung, Gebäudetechnik und Architektur|Energietechnik, Elektrotechnik, Energieerzeugung, Automatisierungstechnik',
                fachbereiche: 'Elektrotechnik',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Duales Studium',
                score: 0.9080400464916696,
              },
              {
                jobId: '822806',
                angebotstitel: 'Planer/in für Breitbandprojekte und/oder kommunale Wärmeplanung (m/w/d)',
                kurzbeschreibung: 'Mach mit bei uns und wir treiben gemeinsam den Glasfaserausbau und die Energiewende voran!',
                firma: 'CreaTech Engineering GmbH',
                emailAnsprechpartner: 'bewerbung@createch.gmbh',
                freigabedatum: '2024-04-23T08:56:28.717Z',
                arbeitsort: 'Prinz-Ludwig-Straße 17, 93055 Regensburg, Deutschland',
                anzeigeText: 'CREATECH ENGINEERING - GIS Solutions made in RegensburgWir sind eine GeoIT- und Ingenieur-Unternehmensgruppe aus Regensburg. Unsere Kernkompetenzen liegen in der Anwendungsentwicklung von GIS-Lösungen und der Betreuung von Infrastrukturprojekten mit Fokus auf dem Ausbau der Breitband- bzw. Glasfaserversorgung, der kommunalen Wärmeplanung und der erneuerbaren Energien.\n\nKlingt interessant für dich? :)\nDeine möglichen Aufgaben\n Planung und Projektierung von Trassen und Versorgungsnetzen in Geoinformationssystemen\n Erstellen von Planunterlagen und Bauakten\n Dokumentation von Ausbauprojekten in GIS oder AutoCAD\n Optional: Baubegleitung und Vermessung vor Ort\n Optional: Mitentwicklung an neuen Anwendungen und Tools zur effizienten Trassenplanung (VBA, Python, C&#43;&#43;)\n\nDein Profil\n Offene Kommunikation, Zuverlässigkeit und Teamzusammenhalt\n Technisches Verständnis und Interesse an Themen rund um den Ausbau von Versorgungsinfrastrukturen\n Eigenständige, strukturierte und ergebnisorientierte Arbeitsweise\n Hohe Motivation und Lernbereitschaft\n Feedbackfähigkeit und Wunsch zur Weiterentwicklung\n Studienhintergrund: Bauingenieurwesen, Wirtschaftsingenieurwesen, Wirtschaftsinformatik, Geographie, Geowissenschaften, erneuerbare Energien, Betriebswirtschaftslehre oder Ähnliches\n\nDeine Benefits\n 100 % Arbeitgeberzuschuss zur betrieblichen Altersvorsorge\n Essenszuschuss zu unserem gesunden Catering\n Flexible Arbeitszeiten und Zeiteinteilung\n Persönliche Weiterentwicklung &amp; Weiterbildungsmöglichkeit\n Gemeinschaftsgefühl &amp; Feelgood-Atmosphäre in einem jungen Team\n\nDu möchtest mit uns gemeinsam etwas Großartiges aufbauen und hast eine klare Vorstellung davon, wie du dich mit deinen Stärken bei uns einbringen möchtest?Dann schicke deine Bewerbung direkt mit Lebenslauf per Mail an bewerbung&#64;createch.gmbh\n\nEs ist kein ausführliches Anschreiben notwendig, uns interessiert allerdings dein präferiertes Eintrittsdatum, deine Gehaltsvorstellung und wie du dich bei uns im Team einbringen möchtest.\n\nWir freuen uns auf dich!\n\nUnsere Socials:\n\nLinkedIn: https://www.linkedin.com/company/createch-engineering/mycompany/ Instagram: https://www.instagram.com/createch.engineering/ YouTube: https://youtu.be/o5_J4_V5vVE?si&#61;_ygiSNdDoPpZZNbV',
                country: 'DE',
                einleitungTitel: 'CREATECH ENGINEERING - GIS Solutions made in Regensburg',
                einleitungText: '<p>Wir sind eine GeoIT- und Ingenieur-Unternehmensgruppe aus Regensburg. Unsere Kernkompetenzen liegen in der Anwendungsentwicklung von GIS-L&ouml;sungen und der Betreuung von Infrastrukturprojekten mit Fokus auf dem Ausbau der Breitband- bzw. Glasfaserversorgung, der kommunalen W&auml;rmeplanung und der erneuerbaren Energien.</p>\n\n<p>&nbsp;</p>\n\n<p>Klingt interessant f&uuml;r dich? :)</p>',
                aufgabenTitel: 'Deine möglichen Aufgaben',
                aufgabenText: '<ul>\n\t<li>Planung und Projektierung von Trassen und Versorgungsnetzen in Geoinformationssystemen</li>\n\t<li>Erstellen von Planunterlagen und Bauakten</li>\n\t<li>Dokumentation von Ausbauprojekten in GIS oder AutoCAD</li>\n\t<li>Optional: Baubegleitung und Vermessung vor Ort</li>\n\t<li>Optional: Mitentwicklung an neuen Anwendungen und Tools zur effizienten Trassenplanung&nbsp;(VBA, Python, C++)</li>\n</ul>',
                erwartungenTitel: 'Dein Profil',
                erwartungenText: '<ul>\n\t<li>Offene Kommunikation, Zuverl&auml;ssigkeit und Teamzusammenhalt</li>\n\t<li>Technisches Verst&auml;ndnis und Interesse an Themen rund um den Ausbau von Versorgungsinfrastrukturen</li>\n\t<li>Eigenst&auml;ndige, strukturierte und ergebnisorientierte Arbeitsweise</li>\n\t<li>Hohe Motivation und Lernbereitschaft</li>\n\t<li>Feedbackf&auml;higkeit und Wunsch zur Weiterentwicklung</li>\n\t<li>Studienhintergrund:&nbsp;Bauingenieurwesen, Wirtschaftsingenieurwesen, Wirtschaftsinformatik, Geographie, Geowissenschaften, erneuerbare Energien, Betriebswirtschaftslehre oder &Auml;hnliches</li>\n</ul>',
                angebotTitel: 'Deine Benefits',
                angebotText: '<ul>\n\t<li>100 % Arbeitgeberzuschuss zur betrieblichen Altersvorsorge</li>\n\t<li>Essenszuschuss zu unserem gesunden Catering</li>\n\t<li>Flexible Arbeitszeiten und Zeiteinteilung</li>\n\t<li>Pers&ouml;nliche Weiterentwicklung &amp; Weiterbildungsm&ouml;glichkeit</li>\n\t<li>Gemeinschaftsgef&uuml;hl &amp; Feelgood-Atmosph&auml;re in einem jungen Team</li>\n</ul>',
                kontaktTitel: 'Du möchtest mit uns gemeinsam etwas Großartiges aufbauen und hast eine klare Vorstellung davon, wie du dich mit deinen Stärken bei uns einbringen möchtest?',
                kontaktText: '<p>Dann schicke deine Bewerbung direkt mit Lebenslauf per Mail an&nbsp;<strong>bewerbung@createch.gmbh</strong></p>\n\n<p>&nbsp;</p>\n\n<p>Es ist kein ausf&uuml;hrliches Anschreiben notwendig, uns interessiert allerdings dein pr&auml;feriertes Eintrittsdatum, deine Gehaltsvorstellung und wie du dich bei uns im Team einbringen m&ouml;chtest.</p>\n\n<p>&nbsp;</p>\n\n<p>Wir freuen uns auf dich!</p>\n\n<p>&nbsp;</p>\n\n<p><strong>Unsere Socials:</strong></p>\n\n<p>&nbsp;</p>\n\n<p><strong>LinkedIn</strong>: https://www.linkedin.com/company/createch-engineering/mycompany/</p>\n\n<p>&nbsp;</p>\n\n<p><strong>Instagram:</strong> https://www.instagram.com/createch.engineering/</p>\n\n<p>&nbsp;</p>\n\n<p><strong>YouTube</strong>: https://youtu.be/o5_J4_V5vVE?si=_ygiSNdDoPpZZNbV</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 20,
                arbeitszeitMax: 40,
                berufsfelder: 'Bau, Vermessung, Gebäudetechnik und Architektur|Datenbankentwicklung|Geoinformatik|IT und Telekommunikation, IT Beratung, IT Vertrieb, Wirtschaftsinformatik|Softwareentwicklung, Programmierung|Systemadministration, Netzwerkadministration|Technische Entwicklung, Konstruktion, CAD|Webentwicklung|Wirtschaftsingenieurwesen',
                fachbereiche: 'Angewandte Geistes- und Naturwissenschaften|Angewandte Naturwissenschaften|Angewandte Naturwissenschaften und Mechatronik|Architektur|Architektur und Bauingenieurwesen|Architektur und Bauwesen|BWL-Dienstleistungsmanagement|Bauingenieurwesen|Betriebswirtschaft|Business School|Elektro- und Informationstechnik|Elektrotechnik|Elektrotechnik und Informatik|Elektrotechnik und Informationstechnik|Elektrotechnik/Wirtschaftsingenieurwesen|Erneuerbare Energien / Nachwachsende Rohstoffe|Fakultät Betriebswirtschaft|Fakultät Elektrotechnik|Fakultät Informatik|Fakultät Maschinenbau|Geoinformation|Gestaltung|Gesundheitswissenschaften|Informatik|Informatik und Mathematik|Informatik und Wirtschaftsinformatik|Ingenieurwissenschaften|Interdisziplinäre und innovative Wissenschaften|Maschinen- und Bauwesen|Maschinenbau|Maschinenbau und Automobiltechnik|Maschinenbau und Verfahrenstechnik|Maschinenbau/Umwelttechnik|Medien|Nachhaltige Infrastruktur|Naturschutz / Umweltplanung|Technik|Weiden Business School|Wein – Technologie – Management|Wirtschaft|Wirtschaft und Recht|Wirtschaftsinformatik|Wirtschaftsingenieurwesen|Wirtschaftsingenieurwesen und Gesundheit|Wirtschaftswissenschaften',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Arbeitsstelle|Berufseinstieg nach dem Studium|Berufserfahrene',
                score: 0.903673795032348,
              },
              {
                jobId: '822911',
                angebotstitel: 'Werkstudent (m/w/d) HR',
                kurzbeschreibung: 'LEONINE Studios ist ein führendes unabhängiges Medienunternehmen. Wir produzieren Kinofilme, Serien, TV-Shows und Entertainment-Formate.\n\nFür unseren Standort in München suchen wir zum nächstmöglichen Zeitpunkt einen\nWerkstudent (m/w/d) HR',
                firma: 'Leonine Holding GmbH',
                emailAnsprechpartner: 'jobs@leoninestudios.com',
                freigabedatum: '2024-04-23T22:00:00.000Z',
                arbeitsort: 'Taunusstraße 21, 80807 München, Deutschland',
                anzeigeText: 'LEONINE Studios ist ein führendes unabhängiges MedienunternehmenWir produzieren Kinofilme, Serien, TV-Shows und Entertainment-Formate sowie fiktionalen und nicht-fiktionalen Content für Social Media. Wir bringen diesen Content selbst ins Kino, vertreiben ihn im Home Entertainment oder zeigen ihn auf unseren eigenen SVOD-Kanälen. Darüber hinaus lizenzieren wir diesen Content an Programmanbieter aller Art, vorrangig im deutschsprachigen Europa, aber auch international.\n\nZu unseren Produktionen zählen u.a. DIE SCHULE DER MAGISCHEN TIERE 2, NIGHTLIFE, KITZ, DIE IBIZA AFFÄRE, FC BAYERN - BEHIND THE LEGEND, DARK, LETZTE SPUR BERLIN, EIN FALL FÜR ZWEI, DER STAATSANWALT, KLEIN GEGEN GROSS und STERN TV. Zu unserem Vertriebsportfolio im Spielfilm- und Serienbereich gehören z.B. KNIVES OUT – MORD IST FAMILIENSACHE, OPERATION FORTUNE, JOHN WICK: KAPITEL 4, CHASE, DIRTY DANCING und viele weitere Highlights aus Kino, SVOD oder Fernsehen.\n\n \n\nFür unseren Standort in München suchen wir zum nächstmöglichen Zeitpunkt einen\n\nWerkstudent (m/w/d) HR\n\nDie Stelle ist zunächst befristet zu besetzen.\nDu unterstützt unser HR-Team in allen relevanten HR-Bereichen.\n Du unterstützt das HR-Team bei der operativen Personalarbeit vom Onboarding bis zum Offboarding sowie im Vertragsmanagement und der Personalstammdatenpflege.\n Du erstellst Zeugnisse und Bescheinigungen.\n Du bist zuständig für die Pflege unserer HR-Tools.\n Du unterstützt im Recruitingprozess an verschiedenen Stellen der Candidate Journey, übernimmst Aufgaben im Bereich Bewerberkorrespondenz sowie Koordination und Abwicklung der Rekrutierungsprozesse.\n Darüber hinaus arbeitest du an HR-Projekten mit und übernimmst auch eigenverantwortlich kleine Sonderprojekte.\n\nGroßes Kino für Deine Karriere!\n Du studierst Betriebswirtschaftslehre, Sozialwissenschaften oder eine vergleichbare Fachrichtung, idealerweise mit Schwerpunkt Personal.\n Erste praktische Erfahrungen im Personalbereich, beispielsweise durch ein Praktikum oder andere studentische Tätigkeiten sind wünschenswert, aber kein Muss.\n Du überzeugst durch deine äußerst genaue Arbeitsweise und kombinierst eine ausgeprägte Dienstleistungsorientierung mit einem souveränen, freundlichen und empathischen Auftreten.\n Du bist ein Organisationstalent und hast Freude am „multi tasking“ und wechselnden Aufgabenfeldern.\n Mit Deinen guten Englisch- und Deutschkenntnissen überzeugst Du sowohl in der schriftlichen als auch in der mündlichen Kommunikation.\n\nUnser Angebot an Dich\n Renommierte Produzent*innen, Expert*innen sowie hervorragende kreative Talente mit umfangreicher Erfahrung in der Medienbranche, die gemeinsam die Vision verfolgen, die führende Marke für Premium-Inhalte weiter voranzubringen.\n Ein Team, das sich freut, mit Dir zusammen einen richtig guten Job zu machen.\n Eine Arbeitsatmosphäre, die von Kreativität, Vertrauen und Kollegialität geprägt ist und Dir die Möglichkeit gibt, Dich weiterzuentwickeln.\n Flexible Arbeitszeiten und die Möglichkeit zum mobilen Arbeiten.\n Modernste Büroräume, eine Dachterrasse mit Blick über die Skyline Münchens, sowie U-Bahn und Busverbindungen vor der Tür.\n Betriebliche Sozialleistungen, wie z.B. Mobilitätszuschuss, subventioniertes Mittagessen im hauseigenen Bistro und Corporate Benefits.\n Regelmäßige Mitarbeiter*innen-Events und -Schulungen, Aus- und Weiterbildungsmöglichkeiten sowie ein internes Netzwerk zu den Themen Diversität, Gleichstellung, Inklusion und Unternehmenskultur.\n\nHaben wir Dein Interesse geweckt? Dann freuen wir uns auf Deine Bewerbungsunterlagen inkl. Angabe Deines frühestmöglichen Eintrittstermins.Leonine Holding GmbH\n\nz.Hd. Jana Rudolph',
                country: 'DE',
                einleitungTitel: 'LEONINE Studios ist ein führendes unabhängiges Medienunternehmen',
                einleitungText: '<p>Wir produzieren Kinofilme, Serien, TV-Shows und Entertainment-Formate sowie fiktionalen und nicht-fiktionalen Content für Social Media. Wir bringen diesen Content selbst ins Kino, vertreiben ihn im Home Entertainment oder zeigen ihn auf unseren eigenen SVOD-Kanälen. Darüber hinaus lizenzieren wir diesen Content an Programmanbieter aller Art, vorrangig im deutschsprachigen Europa, aber auch international.</p>\n\n<p>Zu unseren Produktionen zählen u.a. DIE SCHULE DER MAGISCHEN TIERE 2, NIGHTLIFE, KITZ, DIE IBIZA AFFÄRE, FC BAYERN - BEHIND THE LEGEND, DARK, LETZTE SPUR BERLIN, EIN FALL FÜR ZWEI, DER STAATSANWALT, KLEIN GEGEN GROSS und STERN TV. Zu unserem Vertriebsportfolio im Spielfilm- und Serienbereich gehören z.B. KNIVES OUT – MORD IST FAMILIENSACHE, OPERATION FORTUNE, JOHN WICK: KAPITEL 4, CHASE, DIRTY DANCING und viele weitere Highlights aus Kino, SVOD oder Fernsehen.</p>\n\n<p> </p>\n\n<p>Für unseren Standort in München suchen wir zum nächstmöglichen Zeitpunkt einen</p>\n\n<p><strong>Werkstudent (m/w/d) HR</strong></p>\n\n<p>Die Stelle ist zunächst befristet zu besetzen.</p>',
                aufgabenTitel: 'Du unterstützt unser HR-Team in allen relevanten HR-Bereichen.',
                aufgabenText: '<ul><li>Du unterstützt das HR-Team bei der operativen Personalarbeit vom Onboarding bis zum Offboarding sowie im Vertragsmanagement und der Personalstammdatenpflege.</li><li>Du erstellst Zeugnisse und Bescheinigungen.</li><li>Du bist zuständig für die Pflege unserer HR-Tools.</li><li>Du unterstützt im Recruitingprozess an verschiedenen Stellen der Candidate Journey, übernimmst Aufgaben im Bereich Bewerberkorrespondenz sowie Koordination und Abwicklung der Rekrutierungsprozesse.</li><li>Darüber hinaus arbeitest du an HR-Projekten mit und übernimmst auch eigenverantwortlich kleine Sonderprojekte.</li></ul>',
                erwartungenTitel: 'Großes Kino für Deine Karriere!',
                erwartungenText: '<ul><li>Du studierst Betriebswirtschaftslehre, Sozialwissenschaften oder eine vergleichbare Fachrichtung, idealerweise mit Schwerpunkt Personal.</li><li>Erste praktische Erfahrungen im Personalbereich, beispielsweise durch ein Praktikum oder andere studentische Tätigkeiten sind wünschenswert, aber kein Muss.</li><li>Du überzeugst durch deine äußerst genaue Arbeitsweise und kombinierst eine ausgeprägte Dienstleistungsorientierung mit einem souveränen, freundlichen und empathischen Auftreten.</li><li>Du bist ein Organisationstalent und hast Freude am „multi tasking“ und wechselnden Aufgabenfeldern.</li><li>Mit Deinen guten Englisch- und Deutschkenntnissen überzeugst Du sowohl in der schriftlichen als auch in der mündlichen Kommunikation.</li></ul>',
                angebotTitel: 'Unser Angebot an Dich',
                angebotText: '<ul><li>Renommierte Produzent*innen, Expert*innen sowie hervorragende kreative Talente mit umfangreicher Erfahrung in der Medienbranche, die gemeinsam die Vision verfolgen, die führende Marke für Premium-Inhalte weiter voranzubringen.</li><li>Ein Team, das sich freut, mit Dir zusammen einen richtig guten Job zu machen.</li><li>Eine Arbeitsatmosphäre, die von Kreativität, Vertrauen und Kollegialität geprägt ist und Dir die Möglichkeit gibt, Dich weiterzuentwickeln.</li><li>Flexible Arbeitszeiten und die Möglichkeit zum mobilen Arbeiten.</li><li>Modernste Büroräume, eine Dachterrasse mit Blick über die Skyline Münchens, sowie U-Bahn und Busverbindungen vor der Tür.</li><li>Betriebliche Sozialleistungen, wie z.B. Mobilitätszuschuss, subventioniertes Mittagessen im hauseigenen Bistro und Corporate Benefits.</li><li>Regelmäßige Mitarbeiter*innen-Events und -Schulungen, Aus- und Weiterbildungsmöglichkeiten sowie ein internes Netzwerk zu den Themen Diversität, Gleichstellung, Inklusion und Unternehmenskultur.</li></ul>',
                kontaktTitel: 'Haben wir Dein Interesse geweckt? Dann freuen wir uns auf Deine Bewerbungsunterlagen inkl. Angabe Deines frühestmöglichen Eintrittstermins.',
                kontaktText: '<p>Leonine Holding GmbH</p>\n\n<p>z.Hd. Jana Rudolph</p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 15,
                arbeitszeitMax: 20,
                berufsfelder: 'Personalwesen, HR, Recruiting|Verwaltung, Assistenz, Organisation, Sekretariat',
                fachbereiche: 'Angewandte Sozialwissenschaften|Betriebswirtschaft|Fakultät Betriebswirtschaft|Medien|Wirtschaftswissenschaften',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Werkstudierendenstelle und HiWi-Stellen',
                score: 0.9033615577786326,
              },
              {
                jobId: '822800',
                angebotstitel: 'Werkstudent Normenmanagement (m/w/d)',
                kurzbeschreibung: '? Unterstützung bei der Erstellung von Werknormen unter Einhaltung der \nGestaltungsleitsätze\n? Abstimmung der Inhalte mit der Fachabteilung\n? Pflege der Normenverwaltungssoftware eNorm\n? Pflege der entsprechenden Stammdaten in SAP\n? Begleitung des Erstellungsprozesses bis zur Veröffentlichung von Werknormen',
                firma: 'Flottweg SE',
                emailAnsprechpartner: 'karriere@flottweg.com',
                freigabedatum: '2024-04-30T22:00:00.000Z',
                arbeitsort: '84137 Vilsbiburg, Deutschland',
                anzeigeText: 'Raus aus dem Hörsaal! Bei uns sind Sie vom ersten Tag an in unser Team integriert und übernehmen eigenständig Projekte und Aufgaben. Unsere erfahrenen Mitarbeiter unterstützen Sie und vermitteln Ihnen einen Einblick in unseren Arbeitsalltag. Dadurch können Sie die erlernte Theorie aus dem Studium in die Praxis umsetzen und wertvolle Erfahrungen sammeln.\nIhre Aufgaben• Unterstützung bei der Erstellung von Werknormen unter Einhaltung der Gestaltungsleitsätze\n\n• Abstimmung der Inhalte mit der Fachabteilung\n\n• Pflege der Normenverwaltungssoftware eNorm\n\n• Pflege der entsprechenden Stammdaten in SAP\n\n• Begleitung des Erstellungsprozesses bis zur Veröffentlichung von Werknormen\nIhr Profil• Studium im technischen Bereich\n\n• Sicherer Umgang mit MS-Office\n\n• Organisationsgeschick und selbständige Arbeitsweise\nWir bieten• Respektvollen, fairen Umgang miteinander und eine kollegiale Zusammenarbeit\n\n• Verantwortungsvolle Tätigkeiten und Integration in die Fachabteilung mit direkter Betreuung\n\n• Einblick in den Arbeitsalltag eines modernen Maschinenbauunternehmens\n\n• Attraktive Vergütung und verkehrsgünstige Lage sowie Möglichkeit auf Homeoffice\nSo bewerben Sie sichIhre Ansprechpartnerin: Frau Barbara Steinberger, Tel. &#43;49 8741 1928, E-Mail: karriere&#64;flottweg.com',
                country: 'DE',
                einleitungTitel: 'Raus aus dem Hörsaal!',
                einleitungText: '<p>Bei uns sind Sie vom ersten Tag an in unser Team integriert und übernehmen eigenständig Projekte und Aufgaben. Unsere erfahrenen Mitarbeiter unterstützen Sie und vermitteln Ihnen einen Einblick in unseren Arbeitsalltag. Dadurch können Sie die erlernte Theorie aus dem Studium in die Praxis umsetzen und wertvolle Erfahrungen sammeln.</p>',
                aufgabenTitel: 'Ihre Aufgaben',
                aufgabenText: '<p>• Unterstützung bei der Erstellung von Werknormen unter Einhaltung der Gestaltungsleitsätze</p>\n\n<p>• Abstimmung der Inhalte mit der Fachabteilung</p>\n\n<p>• Pflege der Normenverwaltungssoftware eNorm</p>\n\n<p>• Pflege der entsprechenden Stammdaten in SAP</p>\n\n<p>• Begleitung des Erstellungsprozesses bis zur Veröffentlichung von Werknormen</p>',
                erwartungenTitel: 'Ihr Profil',
                erwartungenText: '<p>• Studium im technischen Bereich</p>\n\n<p>• Sicherer Umgang mit MS-Office</p>\n\n<p>• Organisationsgeschick und selbständige Arbeitsweise</p>',
                angebotTitel: 'Wir bieten',
                angebotText: '<p>• Respektvollen, fairen Umgang miteinander und eine kollegiale Zusammenarbeit</p>\n\n<p>• Verantwortungsvolle Tätigkeiten und Integration in die Fachabteilung mit direkter Betreuung</p>\n\n<p>• Einblick in den Arbeitsalltag eines modernen Maschinenbauunternehmens</p>\n\n<p>• Attraktive Vergütung und verkehrsgünstige Lage sowie Möglichkeit auf Homeoffice</p>',
                kontaktTitel: 'So bewerben Sie sich',
                kontaktText: '<p>Ihre Ansprechpartnerin: Frau Barbara Steinberger, Tel. &#43;49 8741 1928, E-Mail: karriere&#64;flottweg.com</p>\n\n<p> </p>',
                spracheDeutsch: true,
                spracheLand: false,
                arbeitszeitMin: 8,
                arbeitszeitMax: 20,
                berufsfelder: 'Einkauf, Materialwirtschaft, Logistik, SCM, Qualitätswesen|Rechtswesen, Steuerwesen, Wirtschaftsprüfung, Steuerberatung|Sonstige',
                fachbereiche: 'Betriebswirtschaft|Elektrotechnik und Informationstechnik|Maschinen- und Bauwesen|Maschinenbau|Wirtschaftsingenieurwesen',
                homeoffice: '0-49% Homeoffice',
                jobtypen: 'Werkstudierendenstelle und HiWi-Stellen',
                score: 0.8696368447706282,
              },
            ],
          },
        },
      ],
    },
  ],

})

function handleSubmit(e: Event) {
  e.preventDefault()
  chat.sendMessage({ text: input.value })
  input.value = ''
}

const clipboard = useClipboard()
const copied = shallowRef(false)
function copy(text: string) {
  clipboard.copy(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function drop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')
  if (!id)
    return

  const job = data.value?.find(j => j.jobId === id)
  if (!job)
    return

  if (jobs.value.find(j => j.jobId === id))
    return

  jobs.value.push(job)
}

function remove(job: Job) {
  console.log(job)
  jobs.value = jobs.value.filter(j => j.jobId !== job.jobId)
}
</script>

<template>
  <UDashboardPanel
    id="app-chat"
    :ui="{
      root: 'max-w-1/2',
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <div class="h-(--ui-header-height) shrink-0 flex items-center border-b border-default p-4 gap-3">
        <UIcon name="i-lucide-bot" class="size-5" />
        <p class="font-semibold text-highlighted truncate">
          AI Assistant
        </p>
      </div>
    </template>

    <template #body>
      <div class="grid gap-4">
        <template
          v-for="message in chat.messages"
          :key="message.id"
        >
          <template v-if="message.role === 'user'">
            <template
              v-for="part in message.parts"
              :key="`${message.id}-${message.role}-${part.type}`"
            >
              <template v-if="part.type === 'step-start'" />
              <template v-if="part.type === 'text'">
                <div class="group grid gap-2">
                  <div class="text-pretty min-w-0 bg-elevated/50 px-3 py-1.5 rounded-md w-fit ms-auto ring ring-default">
                    {{ part.text }}
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center w-fit ms-auto">
                    <div class="flex item-center gap-2">
                      <UButton
                        icon="i-lucide-refresh-ccw"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="chat.regenerate({ messageId: message.id })"
                      />

                      <UButton
                        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="copy(part.text)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>

          <template v-if="message.role === 'assistant'">
            <template
              v-for="part in message.parts"
              :key="`${message.id}-${message.role}-${part.type}`"
            >
              <template v-if="part.type === 'step-start'" />

              <template v-if="part.type === 'text'">
                <div class="group grid gap-2">
                  <div class="text-pretty min-w-0 rounded-md">
                    <MDCCached
                      :value="part.text"
                      :cache-key="`${message.id}-${message.role}-${part.type}`"
                      unwrap="p"
                      :parser-options="{ highlight: false }"
                    />
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                    <div class="flex item-center gap-2">
                      <UButton
                        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="copy(part.text)"
                      />

                      <UButton
                        icon="i-lucide-refresh-ccw"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="chat.regenerate({ messageId: message.id })"
                      />
                    </div>

                    <div class="flex items-center gap-3 text-xs">
                      <span
                        v-if="(message.metadata as ChatMetadata)?.model"
                        class="font-medium"
                      >
                        {{ (message.metadata as ChatMetadata)?.model }}
                      </span>

                      <span
                        v-if="(message.metadata as ChatMetadata)?.duration"
                        class="flex items-center gap-1"
                      >
                        <UIcon name="i-lucide-zap" class="size-3" />
                        {{ (message.metadata as ChatMetadata)?.duration }}s
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="part.type === 'data-classification'">
                <UAccordion
                  v-if="part.data.status === 'loading'"
                  :items="[{ label: 'Classifying', icon: 'i-lucide-rotate-cw' }]"
                  :ui="{
                    root: 'text-muted',
                    leadingIcon: 'size-4 animate-spin me-1',
                    trailingIcon: 'hidden',
                  }"
                />

                <UAccordion
                  v-else
                  :items="[{ label: `${part.data.type.toUpperCase()} - ${part.data.confidence}`, icon: 'i-lucide-check' }]"
                  :ui="{
                    root: 'text-muted',
                    leadingIcon: 'size-4 me-1 text-primary',
                  }"
                >
                  <template #content>
                    <p class="text-dimmed text-sm">
                      {{ part.data.reasoning }}
                    </p>
                  </template>
                </UAccordion>
              </template>

              <template v-if="part.type === 'tool-get_jobs'">
                <div>
                  <p>Input: {{ part.input?.query }}</p>

                  <ul
                    v-if="part.output?.jobs"
                    class="grid gap-4"
                  >
                    <li
                      v-for="job in part.output.jobs"
                      :key="job.jobId"
                    >
                      <NuxtLink
                        class="block p-4 bg border border-accented rounded-md hover:border-inverted/80 transition-colors"
                        :to="`/jobs/${job.jobId}`"
                      >
                        <p class="font-semibold text-lg leading-tight line-clamp-1 mb-4">
                          {{ job.angebotstitel }} {{ job.score }}
                        </p>

                        <div class="grid gap-1.5 text-sm">
                          <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-building-2" /> {{ job.firma }}
                          </div>
                          <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-map-pin" /> {{ job.arbeitsort }}
                          </div>

                          <div class="flex items-center flex-wrap gap-2 my-1">
                            <UBadge
                              v-for="typ in job.jobtypen.split('|')"
                              :key="typ"
                              color="neutral"
                              variant="outline"
                            >
                              <UIcon name="i-lucide-briefcase" /> {{ typ }}
                            </UBadge>

                            <UBadge color="neutral" variant="outline">
                              <UIcon name="i-lucide-clock" />
                              <template v-if="job.arbeitszeitMin >= job.arbeitszeitMax">
                                {{ job.arbeitszeitMax }}h/week
                              </template>
                              <template v-else>
                                {{ job.arbeitszeitMin }}-{{ job.arbeitszeitMax }}h/week
                              </template>
                            </UBadge>
                            <UBadge color="neutral" variant="outline">
                              <UIcon name="i-lucide-house" /> {{ job.homeoffice }}
                            </UBadge>
                          </div>
                        </div>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </template>
            </template>
          </template>
        </template>

        <MDC
          class="mt-8"
          :value="`
<details>
  <summary>Debug Messages</summary>

  \`\`\`json
  ${JSON.stringify(chat.messages, null, 2)}
  \`\`\`
</details>`"
        />
      </div>
    </template>

    <template #footer>
      <div
        class="p-4"
        @dragover.prevent
        @drop="drop"
      >
        <UChatPrompt
          v-model="input"
          :error="chat.error"
          :status="chat.status"
          variant="subtle"
          class="px-2 bg-white dark:bg-neutral-900"
          :ui="{ body: 'my-1.5' }"
          @submit="handleSubmit"
        >
          <template #header>
            <ul
              v-if="jobs.length"
              class="grid gap-2"
            >
              <li
                v-for="job in jobs"
                :key="job.jobId"
                class="group border border-muted px-2 py-1 rounded-md w-fit flex items-center gap-2"
              >
                <span>{{ job.angebotstitel }}</span>

                <button class="flex-center" @click="remove(job)">
                  <UIcon name="i-lucide-x" class="size-3.5 text-muted group-hover:text-error transition-colors" />
                </button>
              </li>
            </ul>
          </template>
          <template #footer>
            <div class="flex gap-1">
              <UButton
                icon="i-lucide-paperclip"
                color="neutral"
                size="sm"
                variant="ghost"
                disabled
              />
              <UButton
                icon="i-lucide-globe"
                color="neutral"
                size="sm"
                variant="ghost"
                disabled
              />
            </div>

            <div class="flex items-center gap-1">
              <USelect
                default-value="gemini-2.0-flash"
                :items="MODELS"
                label-key="name"
                value-key="key"
                variant="ghost"
                size="sm"
                class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
                :ui="{
                  content: 'min-w-fit',
                  trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
              >
                <template #item-trailing="{ item }">
                  <span class="text-xs text-muted">{{ item.company }}</span>
                </template>
              </USelect>

              <UChatPromptSubmit
                :status="chat.status"
                size="sm"
                :label="chat.status === 'streaming' || chat.status === 'submitted' ? 'Stop' : undefined"
                @stop="chat.stop"
                @reload="chat.regenerate"
              />
            </div>
          </template>
        </UChatPrompt>
      </div>
    </template>
  </UDashboardPanel>
</template>
