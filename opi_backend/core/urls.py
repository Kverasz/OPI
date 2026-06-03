from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from usuarios.views import LoginView, LogoutView, MeuPerfilView, UsuarioViewSet, TurmaViewSet
from projetos.views import ProjetoViewSet, PortfolioPublicoView, DashboardCoordenadorView, GrupoViewSet
from avaliacoes.views import CriterioRubricaViewSet, AvaliacaoViewSet
from feed.views import (
    FeedView, curtir_projeto,
    NotificacaoListView, marcar_notificacao_lida,
    ChatView, enviar_mensagem,
    chat_grupo, enviar_mensagem_grupo
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'turmas', TurmaViewSet, basename='turma')
router.register(r'projetos', ProjetoViewSet, basename='projeto')
router.register(r'criterios-rubrica', CriterioRubricaViewSet, basename='criterio')
router.register(r'avaliacoes', AvaliacaoViewSet, basename='avaliacao')
router.register(r'grupos', GrupoViewSet, basename='grupo')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeuPerfilView.as_view(), name='me'),

    # Router (CRUD principal)
    path('api/', include(router.urls)),

    # Portfólio público
    path('api/portfolio/', PortfolioPublicoView.as_view(), name='portfolio'),

    # Dashboard coordenador
    path('api/dashboard/', DashboardCoordenadorView.as_view(), name='dashboard'),

    # Feed e curtidas
    path('api/feed/', FeedView.as_view(), name='feed'),
    path('api/feed/<int:projeto_id>/curtir/', curtir_projeto, name='curtir'),

    # Notificações
    path('api/notificacoes/', NotificacaoListView.as_view(), name='notificacoes'),
    path('api/notificacoes/<int:pk>/lida/', marcar_notificacao_lida, name='notif_lida'),

    # Chat
    path('api/chat/<int:projeto_id>/', ChatView.as_view(), name='chat'),
    path('api/chat/<int:projeto_id>/mensagens/', enviar_mensagem, name='chat_mensagem'),
    path('api/chat-grupo/<int:grupo_id>/', chat_grupo, name='chat_grupo'),
    path('api/chat-grupo/<int:grupo_id>/mensagens/', enviar_mensagem_grupo, name='chat_grupo_mensagem'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
