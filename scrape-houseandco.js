
// scrape-houseandco.js
// Genera un file di knowledge per Avatar HeyGen usando gli annunci di houseandco.mc

import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";


// URL di partenza: vendite e affitti, Monaco / Costa Azzurra / International
const LISTING_SOURCES = [
  { url: "https://houseandco.mc/en/sales/monaco/", category: "Sale",   area: "Monaco" },
  { url: "https://houseandco.mc/en/sales/french-riviera/", category: "Sale",   area: "French Riviera" },
  { url: "https://houseandco.mc/en/sales/international/", category: "Sale",   area: "International" },
  { url: "https://houseandco.mc/en/rentals/monaco/", category: "Rent",  area: "Monaco" },
  { url: "https://houseandco.mc/en/rentals/french-riviera/", category: "Rent",  area: "French Riviera" },
  { url: "https://houseandco.mc/en/rentals/international/", category: "Rent",  area: "International" }
];

const OUTPUT_DIR = path.join(process.cwd(), "public");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "knowledge-annunci-houseandco.txt");

function clean(t) {
  return (t || "").replace(/\s+/g, " ").trim();
}

/**
 * Estrae tutti i link agli immobili (/en/apimo/...) da una pagina listing
 */
function extractPropertyLinks(listingHtml) {
  const $ = cheerio.load(listingHtml);
  const links = new Set();

  $("a").each((i, el) => {
    const href = $(el).attr("href") || "";
    if (!href) return;

    // Cerchiamo i link dettagli immobile
    if (href.includes("/en/apimo/")) {
      let full = href;
      if (!full.startsWith("http")) {
        full = "https://houseandco.mc" + (full.startsWith("/") ? full : "/" + full);
      }
      links.add(full.split("#")[0]); // rimuovo eventuali anchor
    }
  });

  return Array.from(links);
}

/**
 * Parsing della pagina dettaglio immobile
 */
function parsePropertyPage(html, url, meta) {
  const $ = cheerio.load(html);

  const title = clean($("h1").first().text());
  const zone = clean($("h3").first().text());

  // Prezzo: in genere è un <h4> vicino all'intestazione
  let price = "";
  $("h4, h3, h2, h5").each((i, el) => {
    const txt = clean($(el).text());
    if (txt.includes("€") && !price) {
      price = txt;
    }
  });

  // Testo completo per cercare superfici / rooms / bedrooms con regex
  const fullText = clean($.root().text());

  let surface = "";
  let rooms = "";
  let bedrooms = "";

  const mSurface = fullText.match(/(\\d[\\d\\s.,]*)\\s*m²/);
  if (mSurface) surface = mSurface[0];

  const mRooms = fullText.match(/(\\d+)\\s*rooms?/i);
  if (mRooms) rooms = mRooms[0];

  const mBedrooms = fullText.match(/(\\d+)\\s*bedroom[s]?/i);
  if (mBedrooms) bedrooms = mBedrooms[0];

  // Descrizione: blocco subito dopo "Further information"
  let description = "";
  const further = $("h2").filter((i, el) =>
    clean($(el).text()).toLowerCase().includes("further information")
  ).first();
  if (further && further.length) {
    const p = further.nextAll("p").first();
    if (p && p.length) {
      description = clean(p.text());
    }
  }
  if (!description) {
    // fallback: primo <p> significativo
    const p = $("p").filter((i, el) => clean($(el).text()).length > 50).first();
    if (p && p.length) {
      description = clean(p.text());
    }
  }

  return {
    title: title || "(senza titolo)",
    zone,
    price,
    surface,
    rooms,
    bedrooms,
    description,
    link: url,
    category: meta.category,
    area: meta.area
  };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MirkoBot/1.0)"
    }
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " su " + url);
  }
  return await res.text();
}

async function scrapeAll() {
  let allProps = [];
  const seenUrls = new Set();

  for (const src of LISTING_SOURCES) {
    console.log("Scarico pagina listing:", src.url);
    try {
      const html = await fetchText(src.url);
      const links = extractPropertyLinks(html);
      console.log("Link immobili trovati su questa pagina:", links.length);

      for (const link of links) {
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        console.log("  → Scarico immobile:", link);
        try {
          const detailHtml = await fetchText(link);
          const prop = parsePropertyPage(detailHtml, link, src);
          allProps.push(prop);
        } catch (err) {
          console.error("Errore dettaglio su", link, err.message);
        }
      }
    } catch (err) {
      console.error("Errore listing su", src.url, err.message);
    }
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, buildKnowledge(allProps), "utf-8");
  console.log("Knowledge aggiornata in:", OUTPUT_FILE);
}

function buildKnowledge(list) {
  let out = "";
  out += "=== KNOWLEDGE HOUSE & CO – ANNUNCI IMMOBILIARI ===\\n";
  out += "File generato automaticamente per Avatar HeyGen (consulenza e vendita immobiliare Monaco / Riviera / International).\\n";
  out += "Ogni blocco '=== ANNUNCIO_ID: N ===' rappresenta un immobile.\\n\\n";

  list.forEach((p, i) => {
    const id = i + 1;
    out += `=== ANNUNCIO_ID: ${id} ===\\n`;
    out += `Titolo: ${p.title}\\n`;
    out += `Zona: ${p.zone}\\n`;
    out += `Area: ${p.area}\\n`;
    out += `Categoria: ${p.category}\\n`;
    out += `Prezzo: ${p.price}\\n`;
    out += `Superficie: ${p.surface}\\n`;
    out += `Locali: ${p.rooms}\\n`;
    out += `Camere: ${p.bedrooms}\\n`;
    out += `Descrizione: ${p.description}\\n`;
    out += `Link: ${p.link}\\n\\n`;
  });

  if (!list.length) {
    out += "Nessun annuncio trovato. Controlla i selettori di scrape-houseandco.js o gli URL di listing.\\n";
  }

  return out;
}

scrapeAll().catch(err => {
  console.error("Errore generale:", err);
});
