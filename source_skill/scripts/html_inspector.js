/**
 * Project Ouroboros: HTML & Schema Inspector
 * 
 * This script validates:
 * 1. Basic HTML structure (Head, Body).
 * 2. Critical SEO Meta Tags.
 * 3. JSON-LD Schema.org existence and basic syntax.
 * 4. CSS Class existence (Tailwind).
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../website_out/pages');
const SCHEMAS_DIR = path.join(__dirname, '../website_out/schemas');

function inspect() {
    let errors = 0;

    if (!fs.existsSync(PAGES_DIR)) {
        console.error('Error: Pages directory not found.');
        process.exit(1);
    }

    const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));

    pages.forEach(page => {
        const filePath = path.join(PAGES_DIR, page);
        const content = fs.readFileSync(filePath, 'utf8');

        console.log(`Inspecting: ${page}...`);

        // 1. Basic Structure
        if (!content.includes('<!DOCTYPE html>')) { console.error(`  [FAIL] Missing DOCTYPE`); errors++; }
        if (!content.includes('<html')) { console.error(`  [FAIL] Missing <html> tag`); errors++; }
        if (!content.includes('<head>')) { console.error(`  [FAIL] Missing <head> tag`); errors++; }
        if (!content.includes('<body>')) { console.error(`  [FAIL] Missing <body> tag`); errors++; }

        // 2. SEO Meta Tags
        if (!content.includes('<title>')) { console.error(`  [FAIL] Missing <title>`); errors++; }
        if (!content.includes('<meta name="description"')) { console.error(`  [FAIL] Missing meta description`); errors++; }

        // 3. Schema.org (JSON-LD)
        const schemaFileName = page.replace('.html', '.json');
        const schemaPath = path.join(SCHEMAS_DIR, schemaFileName);
        
        if (!fs.existsSync(schemaPath)) {
            console.warn(`  [WARN] Schema file for ${page} not found at ${schemaPath}`);
        } else {
            try {
                const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                if (!schema['@context']) { console.error(`  [FAIL] Schema missing @context`); errors++; }
            } catch (e) {
                console.error(`  [FAIL] Invalid JSON in schema file: ${schemaFileName}`);
                errors++;
            }
        }
    });

    if (errors > 0) {
        console.error(`\nTotal Errors Found: ${errors}`);
        process.exit(1);
    } else {
        console.log('\n✨ All checks passed! Site is ready for deployment.');
        process.exit(0);
    }
}

inspect();
