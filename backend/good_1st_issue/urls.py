from django.urls import path
from . import views

urlpatterns = [
    # GET    - all good first issue
    # POST   - schedule tweet
    # PATCH  - tweet
    # DELETE - delete tweet
    path("", views.Good1stIssueView.as_view(), name="Good1stIssueView"),
    
    # for github marketplace webhook
    path("webhook/", views.Good1stIssueWebhookView.as_view(), name="Good1stIssueWebhookView"),
]
