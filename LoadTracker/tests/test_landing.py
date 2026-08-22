"""Smoke test for the landing page and its EN/Hinglish toggle.

Run against a dev server:  npm run dev  (then, in another shell)
    python3 -m venv venv && source venv/bin/activate
    pip install -r requirements.txt && playwright install chromium
    python test_landing.py

Deliberately asserts on structure and on the *change* between languages rather
than on specific marketing copy, so routine wording edits don't break the test.
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("LOADBUDDY_URL", "http://localhost:5173")


def test_landing_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print(f"Navigating to {BASE_URL} ...")
            page.goto(BASE_URL)
            page.wait_for_load_state("networkidle")

            print("Checking the landing page rendered ...")
            assert page.locator(".nav-logo").text_content().strip() == "LoadBuddy"

            english_title = page.locator(".hero-title").text_content().strip()
            assert english_title, "hero title is empty"
            assert page.locator(".feature-card").count() == 4, "expected 4 feature cards"
            assert page.locator("#science-section").count() == 1, "missing science section"

            print("Toggling language ...")
            page.locator(".lang-toggle-btn").click()
            page.wait_for_timeout(500)

            hinglish_title = page.locator(".hero-title").text_content().strip()
            assert hinglish_title, "hero title is empty after toggle"
            assert hinglish_title != english_title, (
                f"toggle did not change the hero title (still {english_title!r})"
            )

            print("Toggling back ...")
            page.locator(".lang-toggle-btn").click()
            page.wait_for_timeout(500)
            assert page.locator(".hero-title").text_content().strip() == english_title

            print("All tests passed.")
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        test_landing_page()
    except Exception as exc:  # noqa: BLE001 - surface any failure to the shell
        print(f"Test failed: {exc}")
        sys.exit(1)
