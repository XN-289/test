import os
import re

files = [
    "absorbable-sutures.html",
    "biopsy-forceps.html",
    "cdh29p.html",
    "ethicon-b5lt.html",
    "guidewires.html",
    "hem-o-lok.html",
    "hemoclips.html",
    "nomoflow.html",
    "polymer-clips.html",
    "snares.html",
    "staplers.html",
    "trocars.html",
    "ultrasonic-shears.html",
    "veress-needles.html",
    "compliance.html"
]

dir_path = "/mnt/d/OneDrive/Studio/USP/skill/website_out/pages/"

new_nav = """      <div class="nav-links">
        <a href="trocars.html">Trocars</a>
        <a href="hemoclips.html">Hemoclips</a>
        <a href="biopsy-forceps.html">Biopsy Forceps</a>
        <a href="staplers.html">Staplers</a>
        <a href="absorbable-sutures.html">Sutures</a>
        <a href="nomoflow.html">Technology</a>
        <a href="compliance.html">Compliance</a>
      </div>"""

new_footer = """  <footer style="border-top: 1px solid var(--surface-divider); padding: 64px 0; background-color: var(--lab-gray);">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 40px;">
        <div style="flex: 1; min-width: 250px;">
          <div style="font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--foundational-blue); margin-bottom: 16px;">VIASURG</div>
          <p style="font-size: 14px; color: var(--slate-light); line-height: 1.6;">Clinical Minimalism. Verified Transparency. The new standard for surgical consumables.</p>
        </div>
        <div>
          <h4 class="blueprint-label" style="margin-bottom: 16px;">Core Categories</h4>
          <ul style="list-style: none; padding: 0; font-size: 14px; line-height: 2;">
            <li><a href="trocars.html" style="text-decoration: none; color: var(--slate-core);">Trocars</a></li>
            <li><a href="hemoclips.html" style="text-decoration: none; color: var(--slate-core);">Hemoclips</a></li>
            <li><a href="biopsy-forceps.html" style="text-decoration: none; color: var(--slate-core);">Biopsy Forceps</a></li>
            <li><a href="staplers.html" style="text-decoration: none; color: var(--slate-core);">Staplers</a></li>
          </ul>
        </div>
        <div>
          <h4 class="blueprint-label" style="margin-bottom: 16px;">Resources</h4>
          <ul style="list-style: none; padding: 0; font-size: 14px; line-height: 2;">
            <li><a href="absorbable-sutures.html" style="text-decoration: none; color: var(--slate-core);">Sutures</a></li>
            <li><a href="nomoflow.html" style="text-decoration: none; color: var(--slate-core);">NomoFlow Tech</a></li>
            <li><a href="compliance.html" style="text-decoration: none; color: var(--slate-core);">Compliance</a></li>
            <li><a href="../index.html" style="text-decoration: none; color: var(--slate-core);">Home</a></li>
          </ul>
        </div>
      </div>
      <div style="margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--surface-divider);">
        <p style="font-size: 12px; color: var(--slate-light); text-transform: uppercase; letter-spacing: 0.05em;">© 2025 ViaSurg Global. Clinical Minimalism Applied.</p>
      </div>
    </div>
  </footer>"""

for filename in files:
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace nav-links with regex to handle potential formatting issues
    content = re.sub(r'\s*<div class="nav-links">.*?</div>', "\n" + new_nav, content, flags=re.DOTALL)
    
    # Ensure logo link
    content = re.sub(r'<div class="logo">\s*<a href="[^"]+"', r'<div class="logo">\n        <a href="../index.html"', content)

    # Replace footer
    content = re.sub(r'\s*<footer.*?</footer>', "\n" + new_footer, content, flags=re.DOTALL)
    
    # Cleanup: Ensure double newlines before footer if needed or fix multiple newlines
    content = re.sub(r'\n\s*\n\s*\n', r'\n\n', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + "\n")

print(f"Updated {len(files)} files.")
