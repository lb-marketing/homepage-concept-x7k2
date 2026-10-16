import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('index.html').read()
s=s.replace('<meta charset="utf-8">\n','',1)
i=s.index('</style>')+len('</style>')
out='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+s[:i]+'\n</head>\n<body>\n'+s[i:]+'\n</body>\n</html>\n'
open('LinearB-AI-assistant-page.html','w').write(out)
