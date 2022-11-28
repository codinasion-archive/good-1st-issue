from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import git
import os

# For Gihub signatue verification
import requests
from ipaddress import ip_address, ip_network
import hmac
from hashlib import sha1
from django.conf import settings
from django.utils.encoding import force_bytes

from . import models


class ServerUpdateView(APIView):
    def post(self, request):
        try:
            # https://simpleisbetterthancomplex.com/tutorial/2016/10/31/how-to-handle-github-webhooks-using-django.html
            # Verify if request came from GitHub
            forwarded_for = "{}".format(request.META.get("HTTP_X_FORWARDED_FOR"))
            client_ip_address = ip_address(forwarded_for)
            whitelist = requests.get("https://api.github.com/meta").json()["hooks"]

            for valid_ip in whitelist:
                if client_ip_address in ip_network(valid_ip):
                    break
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)

            # Verify the request signature
            header_signature = request.META.get("HTTP_X_HUB_SIGNATURE")
            if header_signature is None:
                return Response(status=status.HTTP_403_FORBIDDEN)

            sha_name, signature = header_signature.split("=")
            if sha_name != "sha1":
                return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

            mac = hmac.new(
                force_bytes(settings.GITHUB_WEBHOOK_SECRET),
                msg=force_bytes(request.body),
                digestmod=sha1,
            )
            if not hmac.compare_digest(
                force_bytes(mac.hexdigest()), force_bytes(signature)
            ):
                return Response(status=status.HTTP_403_FORBIDDEN)

            # If request reached this point we are in a good shape
            # Process the GitHub events
            event = request.META.get("HTTP_X_GITHUB_EVENT", "ping")

            if event == "ping":
                return Response(status=status.HTTP_200_OK)
            elif event == "push":
                try:
                    # Perform git pull
                    repo = git.Repo(
                        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        search_parent_directories=True,
                    )
                    origin = repo.remotes.origin
                    origin.pull()

                    # Add server update status to database
                    server_update = models.ServerUpdateModel()
                    server_update.server_update_status = True
                    server_update.save()

                    return Response(
                        {"message": "Successfully updated the server code !!!"},
                        status=status.HTTP_200_OK,
                    )

                except Exception as e:
                    print(e)

                    # Add server update status to database
                    server_update = models.ServerUpdateModel()
                    server_update.server_update_status = False
                    server_update.server_update_error = str(e)
                    server_update.save()

                    return Response(
                        {"message": "Error updating server code :("},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # In case we receive an event that's not ping or push
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            return Response(
                {"message": "Error updating server code :("},
                status=status.HTTP_400_BAD_REQUEST,
            )
