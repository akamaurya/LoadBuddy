import sys
from playwright.sync_api import sync_playwright

def test_landing_page():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Navigating to http://localhost:5173...")
        page.goto('http://localhost:5173')
        
        # Wait for network idle to ensure the React app has mounted
        page.wait_for_load_state('networkidle')
        
        print("Checking default English content...")
        # Check that the hero title contains "Periodization"
        expect_en_title = page.locator('.hero-title').text_content()
        assert "Periodization" in expect_en_title, f"Expected 'Periodization' in title, got: {expect_en_title}"
        print("English content verified!")
        
        print("Clicking language toggle...")
        # Click the language toggle
        page.locator('.lang-toggle-btn').click()
        
        # Wait for the transition
        page.wait_for_timeout(500)
        
        print("Checking Hindi content...")
        # Check that the hero title contains "Autopilot hai na"
        expect_hi_title = page.locator('.hero-title').text_content()
        assert "Autopilot hai na" in expect_hi_title, f"Expected Hindi content in title, got: {expect_hi_title}"
        print("Hindi content verified!")
        
        print("All tests passed successfully.")
        browser.close()

if __name__ == "__main__":
    try:
        test_landing_page()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
