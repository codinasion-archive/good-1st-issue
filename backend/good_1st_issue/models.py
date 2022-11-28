from django.db import models

from django.utils import timezone


class Good1stIssueLabelModel(models.Model):
    label = models.CharField(max_length=100, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.label

    class Meta:
        verbose_name = "Label"
        verbose_name_plural = "Labels"


class Good1stIssueModel(models.Model):
    issue_url = models.URLField(unique=True)
    issue_title = models.CharField(max_length=200, default="", blank=True, null=True)
    issue_author = models.CharField(max_length=100, default="", blank=True, null=True)
    issue_labels = models.ManyToManyField(
        Good1stIssueLabelModel, related_name="issues"
    )

    tweet_text = models.TextField(default="", blank=True, null=True)
    tweet_id = models.CharField(max_length=100, default="", blank=True, null=True)
    tweet_at = models.DateTimeField(default=timezone.now, blank=True, null=True)
    tweeted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.issue_url.replace("https://github.com/", "").replace(
            "/issues/", "#"
        )

    class Meta:
        verbose_name = "Issue"
        verbose_name_plural = "Issues"
