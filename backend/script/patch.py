import requests
import threading

import sys

# get arguments
BACKEND_URL = sys.argv[1]
BBACKEND_ACCESS_TOKEN = sys.argv[2]


def PATCH():
    # after every 5 minute
    threading.Timer(300.0, PATCH).start()
    res = requests.patch(
        url=BACKEND_URL + "/good1stissue/",
        headers={
            "Authorization": "Token " + BACKEND_ACCESS_TOKEN,
            "Content-Type": "application/json",
        },
    )

    print(res.status_code, res.text)


PATCH()
