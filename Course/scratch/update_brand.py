content = open(r'd:\Love Boi\MY\Course\index.html', encoding='utf-8').read()

# Brand name
content = content.replace('CourseMap</span>\n          <span class="brand-sub">Career Intelligence Matrix</span>', 
                          'SIDDHAN TECHNOLOGIES</span>\n          <span class="brand-sub">Career Intelligence Matrix</span>')

# Footer brand name (second occurrence)
content = content.replace('>CourseMap<', '>SIDDHAN TECHNOLOGIES<')

# Contact phone
content = content.replace('+91 00000 00000', '+91 96007 47753')

# Contact email
content = content.replace('info@coursemap.edu', 'siddhantechnologies@gmail.com')

# Page title
content = content.replace('Course &amp; Software Topic Mapping \u2014 Executive Dashboard', 
                          'SIDDHAN TECHNOLOGIES | Course &amp; Software Topic Mapping')

# Copyright
content = content.replace('&copy; 2026 CourseMap.', '&copy; 2026 SIDDHAN TECHNOLOGIES.')

# jsPDF script tag - add before </head>
if 'jspdf' not in content:
    content = content.replace('  <link rel="stylesheet" href="style.css" />\n</head>',
                              '  <link rel="stylesheet" href="style.css" />\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>\n</head>')

open(r'd:\Love Boi\MY\Course\index.html', 'w', encoding='utf-8').write(content)
print('Done! Size:', len(content))
