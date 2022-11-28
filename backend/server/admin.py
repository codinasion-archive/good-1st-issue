from django.contrib import admin

from . import models


@admin.register(models.ServerUpdateModel)
class ServerUpdateAdmin(admin.ModelAdmin):
    list_display = ("server_update_time", "server_update_status")
    list_filter = ("server_update_time", "server_update_status")
    search_fields = ("server_update_time", "server_update_status")
    ordering = ("-server_update_time",)
    fields = ("server_update_time", "server_update_status", "server_update_error")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
