#!/usr/bin/env python3

import os, sys

try:
    code = sys.argv[1]
    os.system('curl -s -F grant_type=authorization_code -F client_id=3abe804af24b93683af50cc13f370833e49b97d8431026f7333497922021abf0 -F client_secret=f90c0a91ba638e2223192c3ab3b3278d2cf53ef313130e70c531690dff8a0e50 -F code={} -F redirect_uri=http://localhost:3000/ -X POST https://api.intra.42.fr/oauth/token'.format(code))

except:
    print('Usage: ./getToken.py [token]')
    exit(1)
