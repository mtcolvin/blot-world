#!/usr/bin/env python3
"""
Convert markdown eBook to professionally styled PDF
"""

import markdown
from weasyprint import HTML, CSS
from pygments.formatters import HtmlFormatter
import sys

def create_styled_html(markdown_content):
    """Convert markdown to HTML with professional styling"""

    # Convert markdown to HTML with extensions
    md = markdown.Markdown(
        extensions=[
            'fenced_code',
            'codehilite',
            'tables',
            'toc',
            'nl2br',
            'sane_lists'
        ],
        extension_configs={
            'codehilite': {
                'css_class': 'highlight',
                'linenums': False
            },
            'toc': {
                'title': 'Table of Contents'
            }
        }
    )

    html_content = md.convert(markdown_content)
    toc = md.toc

    # Get Pygments CSS for code highlighting
    formatter = HtmlFormatter(style='monokai')
    pygments_css = formatter.get_style_defs('.highlight')

    # Professional styling
    css = f"""
    <style>
        /* Pygments syntax highlighting */
        {pygments_css}

        /* Page setup */
        @page {{
            size: Letter;
            margin: 1in 0.75in;

            @top-right {{
                content: "Website Performance Optimization Blueprint";
                font-size: 9pt;
                color: #666;
                font-style: italic;
            }}

            @bottom-right {{
                content: "Page " counter(page);
                font-size: 9pt;
                color: #666;
            }}
        }}

        @page :first {{
            @top-right {{
                content: none;
            }}
            @bottom-right {{
                content: none;
            }}
        }}

        /* Typography */
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
        }}

        /* Headings */
        h1 {{
            font-size: 32pt;
            font-weight: 700;
            color: #0D28F2;
            margin-top: 0;
            margin-bottom: 24pt;
            page-break-after: avoid;
            page-break-inside: avoid;
            line-height: 1.2;
        }}

        h2 {{
            font-size: 24pt;
            font-weight: 700;
            color: #0D28F2;
            margin-top: 36pt;
            margin-bottom: 16pt;
            page-break-before: always;  /* Each chapter starts on new page */
            page-break-after: avoid;
            page-break-inside: avoid;
            border-bottom: 2px solid #0D28F2;
            padding-bottom: 8pt;
        }}

        /* Don't page break before "About This Guide" section */
        .content > h2:first-of-type {{
            page-break-before: auto;
        }}

        /* Special handling for "About This Guide" - keep it together */
        h2:contains("About This Guide") {{
            page-break-before: auto;
        }}

        /* Anchor links (markdown) */
        a[name] {{
            display: block;
            position: relative;
            top: -10pt;
            visibility: hidden;
        }}

        h3 {{
            font-size: 18pt;
            font-weight: 600;
            color: #333;
            margin-top: 24pt;
            margin-bottom: 12pt;
            page-break-after: avoid;
            page-break-inside: avoid;
        }}

        h4 {{
            font-size: 14pt;
            font-weight: 600;
            color: #555;
            margin-top: 18pt;
            margin-bottom: 10pt;
            page-break-after: avoid;
            page-break-inside: avoid;
        }}

        /* Paragraphs */
        p {{
            margin-bottom: 12pt;
            text-align: justify;
            orphans: 4;          /* Minimum 4 lines at bottom of page */
            widows: 4;           /* Minimum 4 lines at top of page */
        }}

        /* Keep heading + next paragraph together */
        h2 + p,
        h3 + p,
        h4 + p {{
            page-break-before: avoid;
        }}

        /* Links */
        a {{
            color: #0D28F2;
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}

        /* Lists */
        ul, ol {{
            margin-bottom: 12pt;
            margin-left: 24pt;
            page-break-inside: avoid;  /* Try to keep entire list together */
        }}

        li {{
            margin-bottom: 6pt;
            page-break-inside: avoid;  /* Don't split individual list items */
            orphans: 2;
            widows: 2;
        }}

        /* Keep heading + list together */
        h2 + ul,
        h2 + ol,
        h3 + ul,
        h3 + ol,
        h4 + ul,
        h4 + ol {{
            page-break-before: avoid;
        }}

        /* Code blocks */
        pre {{
            background: #2d2d2d;
            border-radius: 6pt;
            padding: 12pt;
            margin: 12pt 0;
            overflow-x: auto;
            page-break-inside: avoid;  /* Never split code blocks */
            page-break-before: auto;
            page-break-after: auto;
            font-family: "Courier New", Courier, monospace;
            font-size: 9pt;
            line-height: 1.4;
        }}

        /* Keep heading + code block together */
        h2 + pre,
        h3 + pre,
        h4 + pre,
        p + pre {{
            page-break-before: avoid;
        }}

        code {{
            font-family: "Courier New", Courier, monospace;
            font-size: 9.5pt;
            background: #f4f4f4;
            padding: 2pt 4pt;
            border-radius: 3pt;
            color: #c7254e;
        }}

        pre code {{
            background: transparent;
            padding: 0;
            color: #f8f8f2;
        }}

        .highlight {{
            background: #2d2d2d;
            color: #f8f8f2;
        }}

        /* Blockquotes */
        blockquote {{
            border-left: 4pt solid #0D28F2;
            padding-left: 16pt;
            margin-left: 0;
            margin-right: 0;
            margin-bottom: 12pt;
            font-style: italic;
            color: #555;
            page-break-inside: avoid;
        }}

        /* Keep heading + blockquote together */
        h2 + blockquote,
        h3 + blockquote,
        h4 + blockquote {{
            page-break-before: avoid;
        }}

        /* Tables */
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 12pt 0;
            page-break-inside: avoid;  /* Never split tables */
        }}

        /* Keep heading + table together */
        h2 + table,
        h3 + table,
        h4 + table,
        p + table {{
            page-break-before: avoid;
        }}

        th {{
            background: #0D28F2;
            color: white;
            font-weight: 600;
            padding: 8pt;
            text-align: left;
        }}

        td {{
            border: 1pt solid #ddd;
            padding: 8pt;
        }}

        tr:nth-child(even) {{
            background: #f9f9f9;
        }}

        /* Horizontal rules */
        hr {{
            border: none;
            border-top: 2pt solid #e0e0e0;
            margin: 24pt 0;
        }}

        /* Cover page */
        .cover {{
            text-align: center;
            page-break-after: always;
            padding-top: 200pt;
        }}

        .cover h1 {{
            font-size: 42pt;
            margin-bottom: 12pt;
            color: #0D28F2;
        }}

        .cover .subtitle {{
            font-size: 18pt;
            color: #666;
            margin-bottom: 48pt;
            font-weight: 400;
        }}

        .cover .author {{
            font-size: 16pt;
            margin-top: 48pt;
            font-weight: 600;
        }}

        .cover .version {{
            font-size: 12pt;
            color: #999;
            margin-top: 12pt;
        }}

        /* Table of Contents */
        .toc {{
            page-break-after: always;
            margin: 24pt 0;
        }}

        .toc h2 {{
            color: #0D28F2;
        }}

        .toc ul {{
            list-style: none;
            margin-left: 0;
        }}

        .toc li {{
            margin-bottom: 8pt;
        }}

        .toc a {{
            text-decoration: none;
            color: #333;
        }}

        .toc a:hover {{
            color: #0D28F2;
        }}

        /* Utilities */
        .page-break {{
            page-break-after: always;
        }}

        /* Checkboxes */
        input[type="checkbox"] {{
            margin-right: 6pt;
        }}

        /* Strong emphasis */
        strong {{
            font-weight: 600;
            color: #000;
        }}

        em {{
            font-style: italic;
        }}

        /* Special markers */
        p:has(> strong:first-child:contains("✅")),
        p:has(> strong:first-child:contains("❌")),
        p:has(> strong:first-child:contains("💡")),
        p:has(> strong:first-child:contains("🎯")) {{
            margin-left: 12pt;
        }}
    </style>
    """

    # Create cover page
    cover_html = """
    <div class="cover">
        <h1>Website Performance<br>Optimization Blueprint</h1>
        <div class="subtitle">From Bloated to Lightning-Fast: A Technical Guide</div>
        <div class="author">Alex Morgan</div>
        <div class="version">Version 1.0 • November 2025</div>
    </div>
    """

    # Combine everything
    full_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Website Performance Optimization Blueprint</title>
        {css}
    </head>
    <body>
        {cover_html}
        <div class="toc">
            {toc}
        </div>
        <div class="content">
            {html_content}
        </div>
    </body>
    </html>
    """

    return full_html

def main():
    input_file = 'documents/website-performance-optimization-blueprint.md'
    output_file = 'documents/website-performance-optimization-blueprint.pdf'

    print(f"📚 Reading markdown from: {input_file}")

    # Read markdown file
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()

    print("🎨 Converting to styled HTML...")

    # Convert to HTML
    html_content = create_styled_html(markdown_content)

    print("📄 Generating PDF...")

    # Generate PDF
    HTML(string=html_content).write_pdf(
        output_file,
        stylesheets=None,
        presentational_hints=True
    )

    print(f"✅ PDF created successfully: {output_file}")
    print(f"📊 File size: {get_file_size(output_file)}")

def get_file_size(filepath):
    """Get human-readable file size"""
    import os
    size = os.path.getsize(filepath)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

if __name__ == '__main__':
    main()
