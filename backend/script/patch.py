import requests
import threading

# Access environment variables
import environ

env = environ.Env()
environ.Env.read_env()


def PATCH():
    # after every 5 minute
    threading.Timer(300.0, PATCH).start()
    res = requests.patch(
        url=env("BACKEND_URL") + "/good1stissue/",
        headers={
            "Authorization": "Token " + env("BACKEND_ACCESS_TOKEN"),
            "Content-Type": "application/json",
        },
    )

    print(res.status_code, res.text)


PATCH()
