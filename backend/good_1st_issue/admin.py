from django.contrib import admin

from django.urls import reverse
from django.utils.http import urlencode
from django.utils.html import format_html

from . import models


@admin.register(models.Good1stIssueLabelModel)
class Good1stIssueLabelModelAdmin(admin.ModelAdmin):
    list_display = ("label", "get_issues_count", "created_at")
    search_fields = ("label",)

    def get_issues_count(self, obj):
        issue_count = obj.issues.count()
        url = (
            reverse("admin:good_1st_issue_good1stissuemodel_changelist")
            + "?"
            + urlencode({"labels__id": f"{obj.id}"})
        )
        return format_html(
            '<a href="{}" target="__blank">{} Issues</a>', url, issue_count
        )

    get_issues_count.short_description = "Issues Count"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(models.Good1stIssueModel)
class Good1stIssueModelAdmin(admin.ModelAdmin):
    list_display = ("__str__", "get_issue_url", "get_tweeted", "created_at")

    def get_issue_url(self, obj):
        return format_html(
            '<a href="{}" target="__blank">{}</a>', obj.issue_url, obj.__str__()
        )

    get_issue_url.short_description = "Issue URL"

    def get_tweeted(self, obj):
        if obj.tweeted:
            if obj.tweet_id:
                return format_html(
                    '<a href="https://twitter.com/Good1stIssue/statuses/{}" target="__blank">{}</a>',
                    obj.tweet_id,
                    obj.tweet_id,
                )
            else:
                return "Tweet Skipped !!!"
        else:
            return obj.tweet_at

    get_tweeted.short_description = "Tweet"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
