from django.db import models


class ServerUpdateModel(models.Model):
    server_update_time = models.DateTimeField(auto_now_add=True)
    server_update_status = models.BooleanField(default=False)
    server_update_error = models.TextField(default="")

    class Meta:
        verbose_name = "Server Update"
        verbose_name_plural = "Server Updates"

    def __str__(self):
        return str(self.server_update_time)
