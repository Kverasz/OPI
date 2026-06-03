from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from .models import Usuario, Turma, UsuarioTurma
from .serializers import (
    UsuarioSerializer, UsuarioCriarSerializer,
    TurmaSerializer, LoginSerializer,
    AlterarSenhaSerializer, UsuarioTurmaSerializer
)
from .permissions import IsCoordenador


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/ — autentica e retorna tokens JWT + dados do usuário"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': UsuarioSerializer(user).data
        })


class LogoutView(generics.GenericAPIView):
    """POST /api/auth/logout/ — invalida o refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logout realizado.'}, status=status.HTTP_205_RESET_CONTENT)


class MeuPerfilView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — perfil do usuário logado"""
    permission_classes = [IsAuthenticated]
    serializer_class = UsuarioSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        return UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Gerenciamento de usuários — apenas Coordenador.
    GET    /api/usuarios/           lista todos
    POST   /api/usuarios/           cria novo
    GET    /api/usuarios/{id}/      detalhe
    PATCH  /api/usuarios/{id}/      edita
    DELETE /api/usuarios/{id}/      desativa (soft delete)
    POST   /api/usuarios/{id}/redefinir_senha/
    POST   /api/usuarios/{id}/vincular_turma/
    """
    permission_classes = [IsCoordenador]
    queryset = Usuario.objects.all().order_by('nome')

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCriarSerializer
        return UsuarioSerializer

    def get_queryset(self):
        qs = Usuario.objects.all().order_by('nome')
        perfil = self.request.query_params.get('perfil')
        turma_id = self.request.query_params.get('turma_id')
        ativo = self.request.query_params.get('ativo')
        if perfil:
            qs = qs.filter(perfil=perfil)
        if turma_id:
            qs = qs.filter(turmas__id=turma_id)
        if ativo is not None:
            qs = qs.filter(ativo=ativo.lower() == 'true')
        return qs

    def destroy(self, request, *args, **kwargs):
        """Hard delete — remove o usuário e todos os dados vinculados do banco."""
        usuario = self.get_object()

        # Apaga projetos criados por este usuário (cascata limpa membros, tecnologias, arquivos, histórico)
        from projetos.models import Projeto, Grupo
        Projeto.objects.filter(criado_por=usuario).delete()

        # Apaga grupos criados por este usuário (cascata limpa membros M2M)
        Grupo.objects.filter(criado_por=usuario).delete()

        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='redefinir_senha')
    def redefinir_senha(self, request, pk=None):
        usuario = self.get_object()
        serializer = AlterarSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario.set_password(serializer.validated_data['nova_senha'])
        usuario.save()
        return Response({'detail': f'Senha de {usuario.nome} redefinida com sucesso.'})

    @action(detail=True, methods=['post'], url_path='vincular_turma')
    def vincular_turma(self, request, pk=None):
        usuario = self.get_object()
        turma_id = request.data.get('turma_id')
        papel = request.data.get('papel', 'ALUNO')
        turma = get_object_or_404(Turma, id=turma_id)
        vinculo, criado = UsuarioTurma.objects.get_or_create(
            usuario=usuario, turma=turma,
            defaults={'papel': papel}
        )
        if not criado:
            vinculo.papel = papel
            vinculo.save()
        return Response(UsuarioTurmaSerializer(vinculo).data)

    @action(detail=True, methods=['delete'], url_path='desvincular_turma')
    def desvincular_turma(self, request, pk=None):
        usuario = self.get_object()
        turma_id = request.data.get('turma_id')
        UsuarioTurma.objects.filter(usuario=usuario, turma_id=turma_id).delete()
        return Response({'detail': 'Vínculo removido.'})


class TurmaViewSet(viewsets.ModelViewSet):
    """CRUD de turmas — apenas Coordenador"""
    permission_classes = [IsCoordenador]
    queryset = Turma.objects.all().order_by('-ano', '-semestre')
    serializer_class = TurmaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsCoordenador()]
