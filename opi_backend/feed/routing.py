from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat-grupo/(?P<grupo_id>\d+)/$', consumers.ChatGrupoConsumer.as_asgi()),
    re_path(r'ws/video-grupo/(?P<grupo_id>\d+)/$', consumers.VideoCallConsumer.as_asgi()),
]
