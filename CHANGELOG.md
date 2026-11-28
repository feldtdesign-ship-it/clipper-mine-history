# Changelog

## 20 Nov 2026, v1

Added
- Repo set up, public. Only cleared material is included; the rest is held off the repo (see RIGHTS.md).
- Timeline: 34 rows, each checked against its source page (timeline.csv, TIMELINE.md).
- Documents: Lamont 1972 and 1973 annual reports
  (DTIC AD0744130, AD0760585, copies from the Internet Archive); DGGS OFR 157 text; USGS ARDF 2001;
  Nash's News Aug 2013 page 9. The Lamont 1971 report is linked, not hosted (it prints a 1971 home address).
- Maps: OFR 157 Plate 1 and three crops; Lamont Figure I-2 and Figure II-1; USMS 2493 plat; USGS topo 1949
  and 2024.
- Photos: Lamont 1971 Plate 7.
- Film: AAF-1869 record and link. Audio: citation and link only.
- Model: two still renders, owner labels hidden.
- ORGANIZATIONS.md: organizations named in the record, with sources.
- Site: one-page scroll site in site/. Opening map and seismograph trace (illustration), scroll walk-in to the station door (Lamont Plate 7), image carousel, timeline in three chapters. Scroll layout and carousel adapted from Codrops demos (MIT License).

Corrected against the brief's seed list
- The $295,000 contract figure is confirmed in AD0744130 (PDF p. 5), but it covers the whole program of
  stations, not Fairbanks alone.
- ARDF Clipper record FB047 is on printed pp. 100 to 102, not 99 to 101.
- The 1930s hand mining by Lloyd Lounsbury is tied in the ARDF to the workings "by 1932".
- Nash's News does not say "station". The timeline quotes its "once top secret mission" wording instead.
- The 1992 oral history is about Wiseman. It does not mention the Clipper or the station.

New findings
- The USMS 2493 plat prints a claim corner position near 64 51 N, which bears on the coordinate question.
- The plat may carry a 1988 survey date. Not used; see OPEN-QUESTIONS.md.

## 20 Nov 2026, v1.1

- Removed the scroll walk-in section from the site. It did not work well mid-scroll.
- Removed the smooth-scroll library (Lenis) and ScrollTrigger; the page now scrolls normally.

## 23 Nov 2026, v1.2

Added
- Site: new section "Five strings, one knot." Five dated threads from 1951 to 1970 (listening at College,
  Lamont underground, the University on Ester Dome, people in between, the Lounsburys at the Clipper) drawn
  meeting at Lamont's site sheet of 28 Aug 1970. Each point is listed below the drawing with its source.
  The drawing hides on phones; the list stays.
- Timeline: 13 rows, now 47. New "Context" category and a fourth chapter, "Around the mine," for work near the
  mine and at Lamont before 1970. Each row checked against its source text on 23 Nov 2026.
- New rows outside Context: 1951 USGS report naming Lloyd Lounsbury at the Clipper; 28 Aug 1970 Lamont site sheet
  naming the Old Clipper Gold Mine; 21 Dec 2000 federal patent.
- SOURCES.md: context sources (linked, not hosted).
- OPEN-QUESTIONS.md: the 1970 site sheet conflicts; a section on the years before 1970.

- Site: image carousel simplified to one image at a time, with arrows, swipe and a fade. Click opens the
  full-screen viewer. The GSAP and Flip animation files and the Codrops-based code are removed.

Corrected
- Frank Press was at Caltech in 1959, not Lamont (panel report member list). Only Jack Oliver was from Lamont.

## 24 Nov 2026, v1.3

Added
- Site: link preview. When the site link is pasted into an email, message or chat, it now shows a title, a one
  line description and a picture (site/preview.jpg, the title screen). Preview tags added to index.html and
  site/index.html. No change to the visible pages or the timeline.

## 25 Nov 2026, v1.4

Added
- Timeline: 10 new rows, 57 in all. Seven are about the wider program (the sister stations at Charters Towers,
  Chiang Mai and Eilat; the Toledo delay; the stated distance of two stations from presumed test sites; the
  handover to NOAA; Ogdensburg staffing in 1975). Three are about Fairbanks (start of recording and early
  faults; detection range; the February to March 1972 test month).
- Sources: nine more Lamont reports listed in SOURCES.md, each linked to the Internet Archive. None is hosted
  here, because each prints addresses or phone numbers.
- Open questions: why the station closed; Toledo; the "M. Connor" reading; three new conflicts in the sources.

Changed
- The two April 1972 close-out rows now also cite the 1972 semi-annual report (DTIC AD0751960), where the same
  sentences are printed legibly.
- Site: the "Around the mine" chapter label now reads 1957 to 1975.

How this update was checked
- Twelve Lamont reports were read start to end from their text layer. Every page a new row cites was also
  checked against the page image.
- Not examined: the photographs in those reports, and the engineering drawings and parts lists.

## 28 Nov 2026, v1.5

Corrected
- Ownership in the 1930s. The timeline and README called Lloyd Lounsbury "the owner" on one oral source from
  2000. Reed 1938 (printed pp. 8 to 9) names seven other owners and says the mine was "under lease to Lloyd P.
  Lounsbury." Both are kept, the conflict is marked, and a new 1938 row quotes Reed.
- Production in 1937 and 1938. Reed gives about 19 and about 25 tons "produced", worth $28 to $30 a ton. The
  "0.8 oz per ton" figure is OFR 157's restatement, not Reed's. The two rows now cite Reed directly.
- The plat. It was certified by the BLM in December 1988. The old row dated it 2001 and called 50-2001-0164 a
  recording number. That number matches the 21 Dec 2000 patent serial. The row is redated; README and
  SOURCES.md follow.

Added
- Timeline: 5 new rows, 62 in all. The 1932 assessment work; the 1938 lease; the Toledo installation of 15 Jul
  to 17 Aug 1971 and its cited installation report by "Cory, S.E."; the Fairbanks tape deck failure of 22 Aug
  to 30 Oct 1971; and Lamont's 1973 statement that horizontal seismometers belong 150 to 200 m down.
- Sources: the two territorial mining reports (1932 and 1938). Cited, not hosted yet.
- Open questions: owner or lessee; production; "Cory, S.E."; whether the claim was federal land in 1970;
  whether the 1973 depth finding explains the Fairbanks noise; Herbert Mann.

Settled
- Toledo: when it was installed (was open).
- The "PBK" tape deck reading: the page prints FBK (was unchecked).
- The plat's certification year, 1988 (was "may be").

How this update was checked
- Every page cited by a new or corrected row was looked at as a page image on 28 Nov 2026.
- Not done: the patent itself has not been saved or read. Its date and names still rest on the BLM web record
  as read on 23 Nov 2026. The survey dates on the plat are still unreadable.
- Not changed: the site pages. The site reads timeline.csv, so the new rows will show there.
