from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.db import close_old_connections
from urllib.parse import parse_qs


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()
        # Tenta extrair token do query string: ws://...?token=<jwt>
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])

        if token_list:
            token = token_list[0]
            try:
                UntypedToken(token)
                from rest_framework_simplejwt.backends import TokenBackend
                from django.conf import settings
                data = TokenBackend(
                    algorithm='HS256',
                    signing_key=settings.SECRET_KEY
                ).decode(token, verify=True)
                user_id = data.get('user_id')
                if user_id:
                    from usuarios.models import Usuario
                    from channels.db import database_sync_to_async

                    @database_sync_to_async
                    def get_user():
                        try:
                            return Usuario.objects.get(id=user_id)
                        except Usuario.DoesNotExist:
                            return AnonymousUser()

                    scope['user'] = await get_user()
                else:
                    scope['user'] = AnonymousUser()
            except (InvalidToken, TokenError, Exception):
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
