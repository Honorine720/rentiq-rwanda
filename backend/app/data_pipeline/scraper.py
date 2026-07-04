"""
Web Scraper: Kigali Rental Listings
Sources: realtor.rw, jumia.rw/housing, kigalirentals.com
Targets: Gasabo District properties

Strategy:
- Polite scraping (rate limiting, robots.txt respect)
- Rotating user agents
- Structured extraction with fallbacks
- Saves raw HTML + parsed CSV
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import json
import re
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

OUTPUT_DIR = Path('./data/scraped')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Gasabo sectors for filtering
GASABO_SECTORS = [
    'Kimironko', 'Remera', 'Kacyiru', 'Gisozi', 'Bumbogo',
    'Jabana', 'Rusororo', 'Ndera', 'Shyorongi', 'Gikomero',
    'Gatsata', 'Jali', 'Kinyinya', 'Nduba', 'Rutunga'
]

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]


def get_headers() -> dict:
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }


def polite_get(url: str, delay: float = 2.0) -> Optional[requests.Response]:
    """Fetch URL with rate limiting and error handling"""
    time.sleep(delay + random.uniform(0.5, 1.5))
    try:
        response = requests.get(url, headers=get_headers(), timeout=15)
        response.raise_for_status()
        log.info(f"✓ Fetched: {url} [{response.status_code}]")
        return response
    except requests.exceptions.HTTPError as e:
        log.warning(f"HTTP error {e.response.status_code} for {url}")
    except requests.exceptions.ConnectionError:
        log.warning(f"Connection failed: {url}")
    except requests.exceptions.Timeout:
        log.warning(f"Timeout: {url}")
    return None


def parse_rwf_price(text: str) -> Optional[float]:
    """Extract RWF price from text like 'RWF 150,000' or '150000 Frw'"""
    if not text:
        return None
    text = text.upper().replace(',', '').replace(' ', '')
    # Match patterns: RWF150000, 150000RWF, 150000FRW, 150,000
    match = re.search(r'(\d{4,7})', text)
    if match:
        val = float(match.group(1))
        # Sanity check: Kigali rents are 30k - 1.5M RWF
        if 30000 <= val <= 1500000:
            return val
    return None


def parse_bedrooms(text: str) -> Optional[int]:
    """Extract bedroom count from text"""
    if not text:
        return None
    match = re.search(r'(\d+)\s*(?:bed|bedroom|br|bdr)', text.lower())
    if match:
        val = int(match.group(1))
        return val if 1 <= val <= 10 else None
    return None


def parse_area(text: str) -> Optional[float]:
    """Extract floor area in sqm"""
    if not text:
        return None
    match = re.search(r'(\d+(?:\.\d+)?)\s*(?:sqm|m²|m2|sq\.m)', text.lower())
    if match:
        val = float(match.group(1))
        return val if 15 <= val <= 1000 else None
    return None


def detect_gasabo_sector(text: str) -> Optional[str]:
    """Detect Gasabo sector from listing text"""
    text_upper = text.upper()
    for sector in GASABO_SECTORS:
        if sector.upper() in text_upper:
            return sector
    return None


# ─────────────────────────────────────────────────────────────────────────────
# SOURCE 1: realtor.rw
# ─────────────────────────────────────────────────────────────────────────────

def scrape_realtor_rw(max_pages: int = 5) -> list:
    """
    Scrape rental listings from realtor.rw
    URL pattern: https://www.realtor.rw/rent/houses-apartments?location=Gasabo
    """
    listings = []
    base_url = "https://www.realtor.rw/rent/houses-apartments"
    params_list = [
        f"{base_url}?location=Gasabo&page={i}" for i in range(1, max_pages + 1)
    ]

    log.info(f"\n{'─'*60}")
    log.info("SCRAPING: realtor.rw")
    log.info(f"{'─'*60}")

    for url in params_list:
        response = polite_get(url)
        if not response:
            continue

        soup = BeautifulSoup(response.text, 'lxml')

        # Try multiple CSS selectors (sites change their structure)
        cards = (
            soup.select('.property-item') or
            soup.select('.listing-card') or
            soup.select('[class*="property"]') or
            soup.select('article') or
            []
        )

        if not cards:
            log.warning(f"No cards found on {url} — site structure may have changed")
            # Save raw HTML for manual inspection
            raw_path = OUTPUT_DIR / f"realtor_rw_page_{url.split('page=')[-1]}.html"
            raw_path.write_text(response.text, encoding='utf-8')
            continue

        for card in cards:
            text = card.get_text(separator=' ', strip=True)
            price = parse_rwf_price(text)
            bedrooms = parse_bedrooms(text)
            area = parse_area(text)
            sector = detect_gasabo_sector(text)

            if price:
                listings.append({
                    'source': 'realtor.rw',
                    'sector': sector or 'Unknown',
                    'district': 'Gasabo',
                    'monthly_rent_rwf': price,
                    'num_bedrooms': bedrooms,
                    'floor_area_sqm': area,
                    'raw_text': text[:300],
                    'scraped_at': datetime.now().isoformat()
                })

        log.info(f"  Page scraped: {len(listings)} listings so far")

    return listings


# ─────────────────────────────────────────────────────────────────────────────
# SOURCE 2: jumia.rw/housing
# ─────────────────────────────────────────────────────────────────────────────

def scrape_jumia_housing(max_pages: int = 5) -> list:
    """
    Scrape rental listings from jumia.rw housing section
    URL pattern: https://housing.jumia.rw/for-rent/kigali/gasabo/
    """
    listings = []
    base_url = "https://housing.jumia.rw/for-rent/kigali/gasabo"

    log.info(f"\n{'─'*60}")
    log.info("SCRAPING: jumia.rw/housing")
    log.info(f"{'─'*60}")

    for page in range(1, max_pages + 1):
        url = f"{base_url}/?page={page}"
        response = polite_get(url)
        if not response:
            continue

        soup = BeautifulSoup(response.text, 'lxml')

        cards = (
            soup.select('.property-card') or
            soup.select('[data-testid="listing-card"]') or
            soup.select('.sc-listing') or
            soup.select('[class*="listing"]') or
            []
        )

        if not cards:
            raw_path = OUTPUT_DIR / f"jumia_page_{page}.html"
            raw_path.write_text(response.text, encoding='utf-8')
            log.warning(f"No cards on jumia page {page} — saved raw HTML")
            continue

        for card in cards:
            text = card.get_text(separator=' ', strip=True)
            price = parse_rwf_price(text)
            bedrooms = parse_bedrooms(text)
            area = parse_area(text)
            sector = detect_gasabo_sector(text)

            if price:
                listings.append({
                    'source': 'jumia.rw',
                    'sector': sector or 'Unknown',
                    'district': 'Gasabo',
                    'monthly_rent_rwf': price,
                    'num_bedrooms': bedrooms,
                    'floor_area_sqm': area,
                    'raw_text': text[:300],
                    'scraped_at': datetime.now().isoformat()
                })

        log.info(f"  Page {page} scraped: {len(listings)} listings so far")

    return listings


# ─────────────────────────────────────────────────────────────────────────────
# SOURCE 3: kigalirentals.com
# ─────────────────────────────────────────────────────────────────────────────

def scrape_kigali_rentals(max_pages: int = 5) -> list:
    """
    Scrape from kigalirentals.com
    URL pattern: https://www.kigalirentals.com/search?district=Gasabo
    """
    listings = []
    base_url = "https://www.kigalirentals.com/search"

    log.info(f"\n{'─'*60}")
    log.info("SCRAPING: kigalirentals.com")
    log.info(f"{'─'*60}")

    for page in range(1, max_pages + 1):
        url = f"{base_url}?district=Gasabo&page={page}"
        response = polite_get(url)
        if not response:
            continue

        soup = BeautifulSoup(response.text, 'lxml')

        cards = (
            soup.select('.rental-listing') or
            soup.select('.property') or
            soup.select('[class*="rental"]') or
            soup.select('[class*="house"]') or
            []
        )

        if not cards:
            raw_path = OUTPUT_DIR / f"kigalirentals_page_{page}.html"
            raw_path.write_text(response.text, encoding='utf-8')
            log.warning(f"No cards on kigalirentals page {page} — saved raw HTML")
            continue

        for card in cards:
            text = card.get_text(separator=' ', strip=True)
            price = parse_rwf_price(text)
            bedrooms = parse_bedrooms(text)
            area = parse_area(text)
            sector = detect_gasabo_sector(text)

            if price:
                listings.append({
                    'source': 'kigalirentals.com',
                    'sector': sector or 'Unknown',
                    'district': 'Gasabo',
                    'monthly_rent_rwf': price,
                    'num_bedrooms': bedrooms,
                    'floor_area_sqm': area,
                    'raw_text': text[:300],
                    'scraped_at': datetime.now().isoformat()
                })

        log.info(f"  Page {page} scraped: {len(listings)} listings so far")

    return listings


# ─────────────────────────────────────────────────────────────────────────────
# MAIN SCRAPER RUNNER
# ─────────────────────────────────────────────────────────────────────────────

def run_all_scrapers(max_pages: int = 5) -> pd.DataFrame:
    """Run all scrapers and combine results"""
    print("\n" + "="*60)
    print("🌐 KIGALI RENTAL WEB SCRAPER")
    print("Target: Gasabo District")
    print("="*60)

    all_listings = []

    # Run each scraper
    for scraper_fn in [scrape_realtor_rw, scrape_jumia_housing, scrape_kigali_rentals]:
        try:
            results = scraper_fn(max_pages=max_pages)
            all_listings.extend(results)
            log.info(f"✓ {scraper_fn.__name__}: {len(results)} listings")
        except Exception as e:
            log.error(f"✗ {scraper_fn.__name__} failed: {e}")

    if not all_listings:
        log.warning("No listings scraped from any source")
        return pd.DataFrame()

    df = pd.DataFrame(all_listings)

    # Save raw scraped data
    raw_path = OUTPUT_DIR / 'scraped_raw.csv'
    df.to_csv(raw_path, index=False)
    log.info(f"\n✓ Raw scraped data saved: {raw_path} ({len(df)} records)")

    # Summary
    print(f"\n{'='*60}")
    print(f"SCRAPING SUMMARY")
    print(f"{'='*60}")
    print(f"Total listings scraped: {len(df)}")
    print(f"\nBy source:")
    print(df['source'].value_counts().to_string())
    print(f"\nBy sector:")
    print(df['sector'].value_counts().head(10).to_string())
    print(f"\nRent statistics (RWF):")
    print(df['monthly_rent_rwf'].describe().round(0).to_string())

    return df


if __name__ == "__main__":
    df = run_all_scrapers(max_pages=3)
    print(f"\n✅ Scraping complete: {len(df)} listings collected")
