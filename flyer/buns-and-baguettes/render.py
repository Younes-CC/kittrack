"""Baut den druckfertigen Flyer: logo.svg einsetzen, PDF (mit 3 mm Beschnitt) + PNG-Vorschauen rendern.

    python3 render.py
"""
import pathlib
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).parent
out = here / "export"
out.mkdir(exist_ok=True)

logo = (here / "logo.svg").read_text()
html = (here / "flyer.html").read_text().replace("<!--LOGO-->", logo)
build = here / ".flyer.build.html"  # neben fonts/, damit relative Pfade greifen
build.write_text(html)

MM = 96 / 25.4  # CSS px pro mm
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    page = browser.new_page(viewport={"width": round(154 * MM), "height": round(216 * MM)}, device_scale_factor=4)
    page.goto(build.as_uri(), wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.pdf(path=str(out / "buns-baguettes-flyer-A5-druck.pdf"), width="154mm", height="216mm",
             print_background=True, prefer_css_page_size=True)
    for i, name in enumerate(["vorderseite", "rueckseite"]):
        el = page.locator(".page").nth(i)
        box = el.bounding_box()
        b = 3 * MM  # Beschnitt abziehen → Endformat-Vorschau
        page.screenshot(path=str(out / f"{name}.png"), full_page=True,
                        clip={"x": box["x"] + b, "y": box["y"] + b,
                              "width": box["width"] - 2 * b, "height": box["height"] - 2 * b})
    browser.close()
build.unlink()
print("ok")
