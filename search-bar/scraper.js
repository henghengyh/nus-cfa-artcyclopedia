const fs = require('fs');

const urls = [
  'https://nus-cac.com/',
  'https://nus-cac.com/venue',
  'https://nus-cac.com/funding',
  'https://nus-cac.com/publicity-resources',
  'https://nus-cac.com/student-groups',
  'https://nus-cac.com/equipment-loaning',
  'https://nus-cac.com/about'
];

// 🚀 HARDCODED BACKUPS: If Hostinger hides dynamic JS content during raw crawls,
// we inject these clean text blocks to ensure search works flawlessly.
const manualContentBackups = {
  'https://nus-cac.com/venue': `
    Yusof Ishak House YIH Multipurpose Rooms Ascent Beacon Elevate Illuminate Lumina Pinnacle Quest Wisdom 
    Other Spaces Multipurpose Areas Flow Motion StepUp Harmony Rhythm Jamming Studio
    University Cultural Centre UCC Ho Bee Auditorium Theatre Dance Studio Function Rooms Atrium Theatre Foyer Ho Bee Auditorium Foyer
    University Town UTown Performance Auditorium Green Dance Dance Studio Dance Atelier Dance Atelier 2
    Music Practice Music Studio Practice Room 1 Practice Room L1 Practice Room L3 Practice Room M1 Practice Room M2 Practice Room M3 Practice Room M4 Practice Room M5 Studio M1 Studio M2 Studio M3 Studio M4 Studio M5 Studio M6
    Sports Hall MPSH Seminar Rooms
    Libraries Central Library Level 1 Event Space Level 4 Event Spaces Medical Science Library Collaboration Space L1 Collaboration Space L2 Wan Boo Sow Chinese Library Corridor Section 1 Corridor Section 2 Level 6 Event Space Law Library Gallery Space L2
    University Hall UHall Corridor Section 1 Corridor Section 2
    School of Computing SoC COM3 Foyer
    Yong Siew Toh Conservatory YST Conservatory Concert Hall
    Other Venues Shaw Foundation Alumni House Auditorium Yale-NUS College College Hall Ngee Ann Kongsi Auditorium
    Faculty Spaces Science Lecture Theatres Seminar Rooms Foyers FASS Lecture Theatres Seminar Rooms Business Lecture Theatres Seminar Rooms CDE Lecture Theatres Seminar Rooms General Teaching Facilities Lecture Theatres Seminar Rooms Tutorial Rooms Foyers
  `,
  'https://nus-cac.com/student-groups': `
    Student Groups Directory CCA Co-Curricular Activities Arts Culture Club Performing Arts
    NUS Centre For the Arts (CFA) Groups:
    NUS Amplified, NUS Angklung Ensemble, NUS Chinese Orchestra, NUS Dikir Barat, NUS Electronic Music Lab,
    NUS Fingerstyle Guitar, NUS Guitar Ensemble, NUS Harmonica, NUS Indian Instrumental Ensemble, NUS Jazz Band,
    NUS Piano Ensemble, NUS Resonance, NUS Symphony Orchestra, NUS Voices, NUS Wind Symphony, The NUSChoir,
    BreakiNUS, NUS Ballroom, NUS Chinese Dance, NUS d'Hoppers, NUS Dance Blast!, NUS Dance Ensemble,
    NUS Dance Synergy, NUS Funkstyles, NUS Ilsa Tari, NUS Indian Dance, NUS Jazzttitude, NUS Lion Dance,
    Viva LatiNUS, NUS Chinese Drama, NUS STAGE, NUS Arts Production Crew, nuSTUDIOS Film Productions, Third space.
    
    Acacia College: Anova (Street Dance), Babushkraft (Craft), Aftertones (Music).
    
    College of Alice & Peter Tan (CAPT): CAPT Clubs & Societies, CAPTure (Photography), CAPTinSYNC (Music),
    CAPT Tunes, HanDIYcraft, Guitarpella, Chapter (Literary), CAPTivate (Dance).
    
    PGPR: Band, Craft and culture.
    
    Tembusu College: tArt (Visual Arts), tCrews (Dance), SlaTe (Theatre), Tembolly (Music), Tempo (Music),
    Rolling Tones (Music), Yarn & Doodles (Craft).
    
    Temasek Hall: Temasek Hall Dance Club (THDC), THRESHOLD (Theatre), THEATRETTE (Theatre),
    Temasek Hall's Dance Production (THDP), VOX (Music).
    
    King Edward VII (KE7) Hall: KEVII Band, KEVII Choir, KE7 Dance, acaKE, KE Ensemble,
    King Edward VII Hall Chinese Drama Club, KE VII HallPlay.
    
    Raffles Hall: Raffles Hall Culture Committee, RH Dance, RHebels, Raffles Hall Unplugged, RH Voices,
    RHythm, RHMP, RHockerfellas, Raffles Hall Musical Production.
    
    Eusoff Hall: Culture Management Committee, Eusoff Hall Drama-Dance Production (EHDP), Chorapella,
    Eusoff Band, Eusoff Drama, Eusoff Dance Crew.
    
    Kent Ridge Hall: Kent Ridge Hall Video Production Team, KRaphics (Visual Arts), Photo Committee,
    Kent Ridge Hall Dance, KR Rockers, KR Inspire, KRemix, Kent Ridge Acappella, KR Choir.
    
    Sheares Hall: Sheares Hall Cultural Management Board, Chorale, DanSHers, EnSHemble, Geyao,
    SHaccapella, Sheares Band, Sheares Beats, Sheares Production, Sheares Media.
    
    NUS Interest Groups & Cultural Societies:
    NUS Origami Club, NUS Comedy Club, NUS Arttero, NUS Makeup and Design, NUS Literacy Society,
    NUS Comics and Animation Society, The Photographic Society of NUS, NUS Crocheting Club,
    NUS Makers' Alley, n:ow arts, NUS DJ Collective (SynQ), STUDYO, NUSSU Videography & Photography Committee,
    Radio Pulze, NUANSA Cultural Production, NUS Musical Theatre Interest Group (NUSical),
    NUS French Hexagon Club, NUS Southeast Asian Studies Society, NUS Japanese Studies Society,
    JSS Book Club, Nihon Buyo, Japanese Music Club, KotoKottoN, Odoro!!, NUS Sado Club,
    NUS Chinese Society, Tamil Language Society, NUS Malay Language Society (PBMUKS), NUS Hindu Club,
    NUS Indian Cultural Society, NAACH, NUS Korean Cultural Interest Group, KCIG Cultural Session (KCS),
    KCIG Dance Team (KDT), KCIG Vocal Team (KVT).
    
    Categories: Music, Dance, Theatre, Film & Production, Visual Arts, Photography, Craft, Cultural, Literary, General.
  `,
  'https://nus-cac.com/about': `
    management committee culture arts heritage vision mission history executive committee history team members
  `
};

function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x26;/g, '&');
}

async function buildIndex() {
  const searchIndex = [];

  for (const url of urls) {
    let title = url; // Default title
    let bodyText = "";

    try {
      console.log(`Fetching site index from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) title = titleMatch[1].trim();

        const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
        bodyText = bodyMatch ? bodyMatch[1] : html;
      } else {
        console.warn(`⚠️ Hostinger returned status ${response.status}. Relying on manual backups.`);
      }
    } catch (error) {
      console.warn(`⚠️ Network fetch failed for ${url}. Relying on manual backups.`);
    }

    // 🛡️ GUARANTEED INJECTION: 
    // Whether the fetch succeeded, failed, or was blocked, we inject the backup data!
    if (manualContentBackups[url]) {
      console.log(`   └─ Injecting manual dictionary for ${url}`);
      bodyText += " " + manualContentBackups[url];
    }

    // Clean up text
    bodyText = bodyText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') 
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   
      .replace(/<[^>]+>/g, ' ')                         
      .replace(/\s+/g, ' ')                             
      .trim()
      .toLowerCase();

    // Only save if there is actual content
    if (bodyText.length > 0) {
      searchIndex.push({
        title: title,
        url: url,
        content: bodyText
      });
      console.log(`✅ Successfully indexed: "${title}"`);
    } else {
      console.log(`❌ Skipped ${url}: No content and no backup dictionary found.`);
    }
  }

  fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
  console.log(`🏁 Successfully wrote ${searchIndex.length} pages to search-index.json!`);
}

buildIndex();