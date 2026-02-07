import os
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Configure logging to stdout Only
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def track_shipment(tracking_id):
    logging.info(f"Starting tracking process for ID: {tracking_id}")
    
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    # Path for Chrome binary in Linux/Docker if needed
    chrome_bin = "/usr/bin/google-chrome"
    if os.path.exists(chrome_bin):
        options.binary_location = chrome_bin
        logging.info(f"Using Chrome binary at: {chrome_bin}")

    driver = None
    try:
        logging.info("Initializing Chrome Driver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        url = "https://trackcourier.io/dtdc-tracking"
        logging.info(f"Navigating to: {url}")
        driver.get(url)

        wait = WebDriverWait(driver, 15)
        
        # Search for input field
        logging.info("Waiting for tracking number input field...")
        input_selector = "input#trackingNumber"
        input_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, input_selector)))
        
        input_field.clear()
        input_field.send_keys(tracking_id)
        logging.info(f"Entered tracking ID: {tracking_id}")

        # Click track button
        button_selector = "button.btn-info"
        track_button = driver.find_element(By.CSS_SELECTOR, button_selector)
        track_button.click()
        logging.info("Track button clicked.")

        # Wait for results or URL change
        expected_url_part = f"/track-and-trace/dtdc/{tracking_id}"
        logging.info(f"Waiting for URL to contain: {expected_url_part}")
        wait.until(EC.url_contains(expected_url_part))
        
        # Give content time to load
        time.sleep(3)
        
        logging.info(f"URL loaded: {driver.current_url}")
        
        # Parse status
        try:
            status_element = driver.find_element(By.CSS_SELECTOR, "span.modern-status-badge")
            status = status_element.text.strip()
            
            latest_location = driver.find_element(By.CSS_SELECTOR, "div.modern-timeline-item--first div.modern-timeline-item__location").text.strip()
            latest_activity = driver.find_element(By.CSS_SELECTOR, "div.modern-timeline-item--first div.modern-timeline-item__activity span").text.strip()
            latest_timestamp = driver.find_element(By.CSS_SELECTOR, "div.modern-timeline-item--first div.modern-timeline-item__timestamp").text.strip()
            
            result = {
                "status": status,
                "latest_event": {
                    "activity": latest_activity,
                    "location": latest_location,
                    "timestamp": latest_timestamp
                }
            }
            logging.info(f"Successfully parsed tracking data: {result}")
            return result

        except Exception as e:
            logging.warning(f"Precise parsing failed, attempting fallback: {e}")
            body_text = driver.find_element(By.TAG_NAME, "body").text
            if "Delivered" in body_text:
                status = "Delivered"
            elif "In Transit" in body_text:
                status = "In Transit"
            else:
                status = "Status Unknown"
                
            return {
                "status": status,
                "details": "Tracking info found but layout parsing was limited.",
                "preview": body_text[:150]
            }

    except Exception as e:
        logging.error(f"Tracking failed for {tracking_id}: {str(e)}")
        # In Docker, we can't easily see screenshots, but we can log the error
        return {"error": f"Tracking service error: {str(e)}"}
    
    finally:
        if driver:
            logging.info("Closing Chrome browser.")
            driver.quit()

if __name__ == "__main__":
    test_id = "V3500546621"
    print(track_shipment(test_id))
