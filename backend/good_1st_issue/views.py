from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# for token authentication
from rest_framework.permissions import IsAuthenticated

from . import models

import datetime
from django.utils import timezone

import re

# for API call
import requests

# for tweet
import tweepy

# for environment variables
import environ

# Initialise environment variables
env = environ.Env()
environ.Env.read_env()


class Good1stIssueView(APIView):
    permission_classes = (IsAuthenticated,)

    def shortUrl(self, url):
        # https://github.com/org/repo/issues/1 => org/repo#1
        url = url.replace("https://github.com/", "")
        url = url.replace("/issues/", "#")
        return url.lower()

    def hashToString(self, hash):
        # remove '#' if present in the beginning
        hash = re.sub(r"^#", "", hash)
        # split the string by capital letters
        hash = re.sub(r"(?<!^)(?=[A-Z])", " ", hash)
        return hash

    def get(self, request, format=None):
        try:
            labelsData = []
            labels = models.Good1stIssueLabelModel.objects.all()
            for label in labels:
                issue_count = label.issues.count()
                if issue_count > 0:
                    labelsData.append(
                        {
                            "label": self.hashToString(label.label),
                            "issue_count": issue_count,
                        }
                    )

            issuesData = []
            issues = models.Good1stIssueModel.objects.all().order_by("-created_at")
            for issue in issues:
                issue_title = issue.issue_title
                issue_author = issue.issue_author
                issue_url = issue.issue_url
                issue_short_url = self.shortUrl(issue_url)
                issue_labels = []
                for label in issue.issue_labels.all():
                    issue_labels.append(self.hashToString(label.label))
                issuesData.append(
                    {
                        "issue_title": issue_title,
                        "issue_author": issue_author,
                        "issue_url": issue_url,
                        "issue_short_url": issue_short_url,
                        "issue_labels": issue_labels,
                    }
                )

            return Response(
                data={"labels": labelsData, "issues": issuesData},
                status=status.HTTP_200_OK,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        try:
            # get the data from the request
            tweet_text = request.data.get("tweet_text")
            issue_title = request.data.get("issue_title")
            issue_author = request.data.get("issue_author")
            issue_url = request.data.get("issue_url")
            labels_text = request.data.get("labels_text")

            tweet_text = (
                tweet_text
                + """

{}

{}

{}""".format(
                    issue_title, labels_text, issue_url
                )
            )
            # print(tweet_text)

            label_list = labels_text.split(" ")
            # remove empty strings
            label_list = list(filter(None, label_list))

            # check if the issue already exists
            issue = models.Good1stIssueModel.objects.filter(issue_url=issue_url)

            if issue:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST, data="Issue already exists"
                )

            # # get latest issue data from github api
            # latestIssueData = requests.get(
            #     "https://api.github.com/repos/"
            #     + issue_url.replace("https://github.com/", "")
            # ).json()
            # latestIssueLabels = [
            #     label["name"].lower() for label in latestIssueData["labels"]
            # ]
            # # if there is no assignee and
            # # 'good first issue' or 'good-first-issue' or 'good_first_issue' label is available and
            # # issue state is 'open'
            # if (
            #     latestIssueData["assignee"] is None
            #     and (
            #         "good first issue" in latestIssueLabels
            #         or "good-first-issue" in latestIssueLabels
            #         or "good_first_issue" in latestIssueLabels
            #     )
            #     and latestIssueData["state"] == "open"
            # ):

            # get latest tweet_at time
            try:
                latest_tweet_at = (
                    models.Good1stIssueModel.objects.all()
                    .order_by("-tweet_at")
                    .first()
                    .tweet_at
                )
                # if latest_tweet_at is smaller than now, set it to now
                if latest_tweet_at < timezone.now():
                    latest_tweet_at = timezone.now()
            except:
                latest_tweet_at = timezone.now()

            # add 1 minutes to latest_tweet_at
            latest_tweet_at = latest_tweet_at + datetime.timedelta(minutes=1)

            # create the issue
            issue = models.Good1stIssueModel()
            issue.issue_title = issue_title
            issue.issue_author = issue_author
            issue.issue_url = issue_url
            issue.tweet_text = tweet_text
            issue.tweet_at = latest_tweet_at
            issue.save()

            # add labels to the issue
            for label in label_list:
                # check if the label already exists
                labelData = models.Good1stIssueLabelModel.objects.filter(label=label)
                if labelData:
                    labelData = labelData.first()
                else:
                    labelData = models.Good1stIssueLabelModel()
                    labelData.label = label
                    labelData.save()
                issue.issue_labels.add(labelData)

            # save the issue
            issue.save()

            return Response(status=status.HTTP_202_ACCEPTED, data="Tweet Scheduled :)")

            # return Response(
            #     status=status.HTTP_400_BAD_REQUEST, data="Issue not eligible :("
            # )
        except:
            return Response(
                status=status.HTTP_400_BAD_REQUEST, data="Error while scheduling tweet"
            )

    def patch(self, request, format=None):
        # try:
        # get all issues that are scheduled to be tweeted
        issues = models.Good1stIssueModel.objects.filter(
            tweet_at__lte=timezone.now(), tweeted=False
        )
        if issues.count() > 0:
            issue = issues.first()
            print(issue.issue_url)

            # get latest issue data from github api
            latestIssueData = requests.get(
                "https://api.github.com/repos/"
                + issue.issue_url.replace("https://github.com/", "")
            ).json()
            latestIssueLabels = [
                label["name"].lower() for label in latestIssueData["labels"]
            ]
            # if there is no assignee and
            # 'good first issue' or 'good-first-issue' or 'good_first_issue' label is available and
            # issue state is 'open'
            if (
                latestIssueData["assignee"] is None
                and (
                    "good first issue" in latestIssueLabels
                    or "good-first-issue" in latestIssueLabels
                    or "good_first_issue" in latestIssueLabels
                )
                and latestIssueData["state"] == "open"
            ):
                # tweet the issue
                # create twitter client
                client = tweepy.Client(
                    consumer_key=env("TWITTER_CONSUMER_KEY"),
                    consumer_secret=env("TWITTER_CONSUMER_SECRET"),
                    access_token=env("TWITTER_ACCESS_TOKEN"),
                    access_token_secret=env("TWITTER_ACCESS_TOKEN_SECRET"),
                )

                message = client.create_tweet(text=issue.tweet_text)
                print(message)
                tweet_id = message.data["id"]

                issue.tweeted = True
                issue.tweet_id = tweet_id
                issue.save()

                return Response(
                    status=status.HTTP_202_ACCEPTED, data="Tweeted Successfully :)"
                )
            else:
                issue.tweeted = True
                issue.save()
                return Response(
                    status=status.HTTP_202_ACCEPTED,
                    data="Issue is not available anymore :(",
                )
        else:
            return Response(
                status=status.HTTP_202_ACCEPTED, data="No issues to tweet :("
            )
        # except:
        # return Response(status=status.HTTP_400_BAD_REQUEST, data="Error while tweeting !!!")

    def delete(self, request, format=None):
        try:
            # get the data from the request
            issue_url = request.data.get("issue_url")

            # check if the issue exists
            issue = models.Good1stIssueModel.objects.filter(issue_url=issue_url)

            if issue:
                issue = issue.first()

                # # get latest issue data from github api
                # latestIssueData = requests.get(
                #     "https://api.github.com/repos/"
                #     + issue_url.replace("https://github.com/", "")
                # ).json()
                # latestIssueLabels = [
                #     label["name"].lower() for label in latestIssueData["labels"]
                # ]

                # print(latestIssueData)
                # print(latestIssueData["assignee"] is not None)
                # print(
                #     "good first issue" not in latestIssueLabels
                #     and "good-first-issue" not in latestIssueLabels
                #     and "good_first_issue" not in latestIssueLabels
                # )
                # print(latestIssueData["state"] == "closed")
                # # if there is an assignee or / and
                # # 'good first issue' or 'good-first-issue' or 'good_first_issue' label is not available or
                # # issue is closed
                # if (
                #     latestIssueData["assignee"] is not None
                #     or (
                #         "good first issue" not in latestIssueLabels
                #         and "good-first-issue" not in latestIssueLabels
                #         and "good_first_issue" not in latestIssueLabels
                #     )
                #     or latestIssueData["state"] == "closed"
                # ):

                if issue.tweet_id:
                    # delete tweet
                    # create twitter client
                    client = tweepy.Client(
                        consumer_key=env("TWITTER_CONSUMER_KEY"),
                        consumer_secret=env("TWITTER_CONSUMER_SECRET"),
                        access_token=env("TWITTER_ACCESS_TOKEN"),
                        access_token_secret=env("TWITTER_ACCESS_TOKEN_SECRET"),
                    )

                    message = client.delete_tweet(id=issue.tweet_id)
                    print(message)

                # delete the issue
                issue.delete()

                return Response(
                    status=status.HTTP_202_ACCEPTED,
                    data="Tweet Deleted Successfully :)",
                )

                # else:
                #     return Response(
                #         status=status.HTTP_202_ACCEPTED,
                #         data="Issue is still available :)",
                #     )
            else:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST, data="Issue does not exist"
                )
        except:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data="Error while deleting tweet !!!",
            )


class Good1stIssueWebhookView(APIView):
    def post(self, request, format=None):
        return Response(status=status.HTTP_202_ACCEPTED, data="Webhook Received :)")
