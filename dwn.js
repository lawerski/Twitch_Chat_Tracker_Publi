const puppeteer = require('puppeteer');
const fs = require('fs'); // File system module to write to a file

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
const channels = ['YoungMulti', 'xmerghani', 'NEEXcsgo', 'Grendy', 'Nervarien', 'EWROON', 'H2P_Gucio', 'IzakOOO', 'RybsonLoL_', 'BanduraCartel', 'ToJaDenis', 'pisicela', 'qlnek', 'PLKDAMIAN', 'MrDzinold', 'Putrefy', 'ZONY', 'Fatek_', 'xntentacion', 'sawardega', 'revo_toja', 'Kaseko', 'PAGO3', 'polsatgames', 'Slayproxx', 'Kasix', 'MokrySuchar', 'puniogaming', 'betclicpolska', 'masle1', 'xth0rek', 'meduska', 'OfficialHyper', 'Bonkol', 'GALINEOS', 'demonzz1', 'kuqe2115', 'delordione', 'RockAlone', 'exhiie', 'N3utr4LSF', 'adrian1g__', 'Overpow', 'Angela35', 'parisplatynov', 'tuszol', 'RandomBruceTV', 'junajtedtv', 'NewMultiShow', 'krutkii_', 'tiger_scot', 'cyganzor', 'ajemge1', 'tamae_', 'LukiSteve', 'BlackFIreIce', 'vysotzky', 'BaniakBaniaka', 'zuberx', 'ArQuel', 'xspeedyq', 'Ali5cali', 'zalewskyy_', 'Gluhammer', 'mlodziutki7', 'Diables', 'bedoes2111111111115', 'achtenWlodar', 'pajalockk', 'AwizoTV', 'Patiro', 'peVoR13', 'Popo', 'GeneratorFrajdy', 'Kamyk', 'Testree', 'Aspen_tv_', 'CrownyCro', 'Kazama5', 'blachu_', 'Nieuczesana', '1wron3k', 'KamiFN1', 'Mamm0n', 'natanzgorzyk', 'Kubx', 'MARIOspzoo', 'Leroooitsme', 'szelioficjalnie', 'Navcia', 'remsua', 'piecharsom', 'xToM223', 'KasiaBabis', 'Kezman22', 'dejvid_tibijski_zadymiarz', 'jaskol95', 'Kalach444', 'Wujabudyn', 'lawekyt', 'Ortis', 'Alviniasty', 'Michu_HM', 'Amar8ygg', 'shini_waifu', 'bIazej', 'Maxigashi', 'DobrodziejDobrodziejski', 'AmadeuszFerrari', 'anka_e', 'hades1337', 'Lachu', 'MatiskaterrYFL', 'Monsteryoo', 'lulciaBOT', 'Avmusia', 'kebab_u_rudego', 'rudaninja', 'stasienieniek', 'pyka97', 'inet_saju', 'czesio_invi', 'avalogy', 'xEmtek', 'TechnikKowalPL', 'xglobus_', 'Spartiatix', 'bejott', 'MrCreatifee', 'gangamurun', 'Cinkrofwest', 'Szzalony', 'Vdr1984', 'road2dubai', 'vvvictorie', 'SkopzzoR', 'Kubon_', 'anksiv', 'PajotreQ', 'MaaiLinh', 'FurmanN_', 'Filipo11', 'Leh_TV', 'teeqfn_', 'byalli', 'OjciecTrapcio', 'Emidzemi', 'bruz777', 'Miniuwa', 'Olaczka', 'srokaaa_', 'MBagietson', 'paprycjuszek_', 'gieras51', 'klqudka', 'DawidSSonek', 'Qreii', 'PaPaPawian', 'YoloSlaw2', 'edenitoo', 'Roocket__', 'KamilEater', 'IndyStarCraft', 'kolor_pl', 'Borys8', 'dags_szef_', 'niceniksa1', 'NadinWins', 'ChappyCherri', 'Miszel', 'KUZYN7', 'Zwyro', 'Znix_', 'pakocs2', 'DJSMIERC', 'kubanczyk_official', 'ThrashingMadPL', 'Paamelka', 'Kagaminium', 'dmajszi', 'maharadzza', 'Kondyss', 'packo', 'SuDak_', 'kraken_junior8', 'Slowek', 'maharr_', 'PiotrMaciejczak', 'R3D64', 'ZWIERZAAAK', 'k4rolinv_', 'FURAZEK', 'steryd3', 'neexepl', 'Lipej', 'money420mitch', 'Menders_7', 'Hira_', 'GerciuTV', 'Lewus', 'Odi11__', 'KECAJEK', 'takefun_', 'Haemhype', 'Bladii309', 'olszakumpel', 'RiotGamesPL', 'EnigmaStreamuje', 'ferdekwspanialy', 'kycu', 'Niklaus', 'LakarnumPL', 'Diabeuu6', 'vaniszek1916', 'LosiuGra', 'Kangurek_Kao_Pej', 'jullean', 'Karczmarz', 'MiksonFN', 'ben3kk', 'KEREMEcoach', 'pukistylee', 'islythi', 'VeneK__', 'kubixon9964', 'UrQueeen', 'damiefifa', 'G13ras', 'claudien_', 'My_Zone_', 'kesZu_h3', 'Makito_', 'lupisora', 'J0K3R7x', 'khamires', 'Inomagic', 'Kasia_22', 'thejust_lava', 'BixenteHS', 'Chrisztof', 'WPATKA', 'Misilia', 'DayRa1sE', '369_val', 'melfonide', 'Lady_Claw', 'Dawidu91', 'Bozydar44', 'charyyy__', 'gnddk', 'gerdziu5', 'szysszka_', 'Janowicz', 'kaajak1', 'melod_ja', 'xN0rth', 'angelkacs', 'LordRobson', 'Tagard', 'Sabalcio', 'Szopa666h3', 'orwell122', 'syzmek', 'xWeza', 'zamulek', 'STOMPcsgo', 'BuraczekNadaje', 'v4ru__', 'Altairri', 'xkacperskycs', 'Sakebinii', 'inet_easy', 'Chef_jan', 'KubaNorek', 'Cashnalot', 'mrs_NOCKA', 'Netrodalo', 'Psemkowski', 'Haziano', 'Flothar', 'discokarol', 'TTobias_lol', 'KapitanAlien', 'iammielzky', 'finesGG', 'ZavadaHS', 'frajgo_', 'SayKamstar', 'LazyAngie', 'HIGHSTYLED', 'MORK', 'KenoN__', 'chocolate_puma', 'AdryanHDStream', 'tyrisftw', 'Ciiorny', 'matixoxoo_', 'hipatty_', 'czarny_piotrus', 'Bungo21', 'MICHU', 'Nimuena_', 'mikrocypek1', 'Rysiek', 'ZeronPeron', 'shvkitty', 'Buazii', 'Denzaay', 'RajotGPLAY', 'MrSetoKami', 'DMGPOLAND', 'Namaenonaii', 'Liazal', 'Anterias', 'rybkaa__', 'Tubson_', 'Ognisty', 'muzykatv1', 'Axia', 'DaskiCosin', 'elothteam', 'Avalanche_1', 'Frinu', 'Yuuhi', 'Bobeek', 'Noutaro', 'youlia', 'OshiKira', 'hallack', 'arkadiojose', 'pandoraa99', 'krazowskii', 'Bytake', 'DED87', 'ChudyChudziutki', 'Maggothy', 'suziannna', 'domcialupinska', 'Skladas', 'komura_1', 'ChesscomPL', 'teuzzz', 'Druvik_', 'LiLqki', 'fgchallenge', 'JessieTiltman', 'cygus134', 'bezumbezum', 'Czekolad_', 'krasnalcs', 'branko_live', 'AikoiEmil', 'Misiu987', 'InkaPurinka', 'KarisKapiko', 'DRWAL_rebajlo', 'exusin', 'ostre_szachy', 'darkocsgo', 'TVKowalowe', 'kingakujawska', 'Mocieek', 'trashmousey', 'sandrulaax', 'Noobuser95', 'TheChucken', 'bykmateo', 'Neerven', 'dYnkSxMonster', 'Kasaczek', 'hoshichaan_', 'NietoperzByku', 'plmodri25', 'JohnVerrinePL', 'zolza_97', 'shreddin_', 'ArcLarka', 'OniMizu', 'tyranuxus11', 'xkaleson', 'pulek7', 'LubieStareGry', 'h3gg', 'JustMeyson', 'erem_tv', 'call_me_piotr', 'Inspirawka', 'LisekHD_', 'Jenkinsss', 'mlynek', 'Sinmivak', 'VanessaSzwaczka', 'Tokiox_', 'trolikhd', 'ViniPlayPL', 'DehunTV', 'Niivzy', 'zioLive', 'OniEmiko', 'PeciuCJDR', 'roots_rat', 'kmntxd', 'sustanonik', 'zgrywu_', 'jamnior_muncio', 'SzparuMen', 'skyfenek', 'BiegasTV', 'szczurkowski', 'L2pLelouch', 'models_films_art', 'MeBadboyz', 'Amosfn_', 'KinetykHD', 'SouShibo', 'AutomattPL', 'korneelcia', 'Kane_fifka', 'xRobin__', 'ancymon777', 'pozdrawiam_wegorza', 'ANPHEER', 'ozi_rider', 'Werka_Sportsmenka', 'lempiank', 'Asaiika', 'ManiekYZ', 'SpiralusGTM', 'SZPERO', 'fake_natalia', 'sojeczkaaa', 'OskarStachowski', 'KANAL10main', 'Czajnikkk__', 'Zbrojson', 'MiksoN________', 'KlaudiaCroft', 'Troglodytaa', 'grb_ttv', 'SzklanaY2J_', 'gabciiaa', 'ciriell', 'ghashpl', 'cryvietv', 'WoznyTV', 'exLoveer', 'zlemyslisz', 'ano_liwia', 'Splawik_9', 'carlos_0701', 'Maja__x', 'xklaudziaa', 'Keksereslol', 'Tomek_Poradzisz', 'SirCwany', 'AgraveiN', 'pendzel_banned_v4', 'AlterMMO_pl', 'fanboyPL', 'Bagiet_24', 'djAmadi', 'Expio_tetruS', 'czaaakii', 'matik_x', 'mor3_0n', 'CresiiK', 'iRiffy_', 'seny', 'GraBaRtek', 'mokrazabka', 'Corle', 'yavor_tv', 'AngrySebbe', 'Chylek', 'KubaNowaczkiewicz', 'kaszpe__', 'meesyka_', 'szparagus1', 'LegioN', 'Frytka', 'Smayro', 'freshmcd', 'Plaga', 'FR33____', 'PusherVision', 'MadKingX', 'mafiasolecofficial', 'xAnulkaaa', 'Rubsoon', 'GrabaGra', 'kromkachleba', 'GugaGamerka', 'zeekxD', 'pr0tzyQ', 'Esgaroth16', 'ProfesorGamora', 'Tysiologia', 'VgZ2k', 'aderr_cs'];

(async () => {
  for (const channel of channels) {
    console.log(`Processing channel: ${channel}`);

    // Launch the browser
    const browser = await puppeteer.launch({ headless: true }); // Set headless: true for a non-UI browser
    const page = await browser.newPage();

    try {
      // Navigate to the page
      await page.goto('https://7tv.app'); // Replace with the actual URL
      await delay(2000);
      await page.click('#app > nav > div > button > svg');
      await page.click('#app > nav > div > div.collapse > div.account > div:nth-child(1)');

      // Wait for the input field to appear
      const inputSelector = '#app > nav > div > div.collapse > div.account > main > div > input[type=text]';
      await page.waitForSelector(inputSelector);

      // Input data into the field
      await page.type(inputSelector, channel); // Replace 'Your Input Data' with your actual data
      await delay(2000);

      const firstResultSelector = '#app > nav > div > div.collapse > div.account > main > div.result-tray > a:nth-child(1)';
      await page.waitForSelector(firstResultSelector);

      // Click on the first result
      await page.click(firstResultSelector);

      // Wait for the target element to appear after the last delay
      await delay(3000);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Extract the username
      const username = await page.evaluate(() => {
        const mainElement = document.querySelector('main.user-root');
        return mainElement ? mainElement.getAttribute('user') : 'Username not found';
      });

      console.log('Extracted Username:', username);

      // Write the username to a file
      fs.appendFileSync('username.txt', `${username} ${channel}\n`, 'utf8');
      console.log('Username written to file: username.txt');
    } catch (error) {
      console.error(`Error processing channel "${channel}":`, error);
    } finally {
      // Close the browser
      await browser.close();
      console.log(`Finished processing channel: ${channel}`);
    }
  }
})();
