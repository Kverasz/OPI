from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Curtida, Notificacao, CanalChat, Mensagem
from .serializers import (
    NotificacaoSerializer, CanalChatSerializer, MensagemSerializer
)
from projetos.models import Projeto
from projetos.serializers import ProjetoSerializer
from usuarios.permissions import IsNotEmpresa
from projetos.models import Grupo
from .models import CanalGrupo, MensagemGrupo


class FeedView(generics.ListAPIView):
    """
    GET /api/feed/ - projetos ordenados por curtidas.
    Acessível a Aluno, Professor e Empresa autenticados.
    Filtros: turma_id, area_tematica, tecnologia, conceito
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProjetoSerializer

    def get_queryset(self):
        qs = Projeto.objects.filter(
            status='AVALIADO',
            publicado_no_feed=True
        ).select_related(
            'criado_por', 'turma', 'avaliacao'
        ).prefetch_related(
            'tecnologias', 'curtidas'
        ).annotate(
            num_curtidas=Count('curtidas')
        ).order_by('-num_curtidas', '-avaliacao__avaliado_em')

        turma_id = self.request.query_params.get('turma_id')
        area = self.request.query_params.get('area_tematica')
        tecnologia = self.request.query_params.get('tecnologia')
        conceito = self.request.query_params.get('conceito')

        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        if area:
            qs = qs.filter(area_tematica__icontains=area)
        if tecnologia:
            qs = qs.filter(tecnologias__tecnologia__icontains=tecnologia)
        if conceito:
            qs = qs.filter(avaliacao__conceito=conceito.upper())

        return qs.distinct()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def curtir_projeto(request, projeto_id):
    """
    POST /api/feed/{projeto_id}/curtir/
    Curtir = cria. Descurtir = remove (toggle).
    RN-05: 1 curtida por usuário por projeto.
    """
    projeto = Projeto.objects.filter(id=projeto_id).first()
    if not projeto:
        return Response({'detail': 'Projeto não encontrado.'}, status=404)

    curtida, criada = Curtida.objects.get_or_create(
        usuario=request.user, projeto=projeto
    )
    if not criada:
        curtida.delete()
        return Response({
            'curtiu': False,
            'total_curtidas': projeto.curtidas.count()
        })
    return Response({
        'curtiu': True,
        'total_curtidas': projeto.curtidas.count()
    }, status=status.HTTP_201_CREATED)


class NotificacaoListView(generics.ListAPIView):
    """GET /api/notificacoes/ - notificações do usuário logado"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificacaoSerializer

    def get_queryset(self):
        return Notificacao.objects.filter(usuario=self.request.user)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_notificacao_lida(request, pk):
    """PATCH /api/notificacoes/{pk}/lida/"""
    notif = Notificacao.objects.filter(id=pk, usuario=request.user).first()
    if not notif:
        return Response({'detail': 'Não encontrada.'}, status=404)
    notif.lida = True
    notif.save()
    return Response({'detail': 'Marcada como lida.'})


class ChatView(generics.RetrieveAPIView):
    """
    GET /api/chat/{projeto_id}/ - canal do grupo + mensagens.
    RN-07: apenas membros do grupo acessam.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CanalChatSerializer

    def get_object(self):
        projeto_id = self.kwargs['projeto_id']
        projeto = Projeto.objects.filter(id=projeto_id).first()
        if not projeto:
            from rest_framework.exceptions import NotFound
            raise NotFound('Projeto não encontrado.')

        user = self.request.user
        eh_membro = projeto.membros.filter(id=user.id).exists()
        if not eh_membro and not user.is_coordenador:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Acesso restrito aos membros do grupo.')

        canal, _ = CanalChat.objects.get_or_create(
            projeto=projeto,
            defaults={'nome': f'Chat - {projeto.titulo}'}
        )
        return canal


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enviar_mensagem(request, projeto_id):
    """POST /api/chat/{projeto_id}/mensagens/"""
    projeto = Projeto.objects.filter(id=projeto_id).first()
    if not projeto:
        return Response({'detail': 'Projeto não encontrado.'}, status=404)

    eh_membro = projeto.membros.filter(id=request.user.id).exists()
    if not eh_membro and not request.user.is_coordenador:
        return Response({'detail': 'Acesso restrito aos membros do grupo.'}, status=403)

    canal, _ = CanalChat.objects.get_or_create(
        projeto=projeto,
        defaults={'nome': f'Chat - {projeto.titulo}'}
    )
    conteudo = request.data.get('conteudo', '').strip()
    if not conteudo:
        return Response({'detail': 'Mensagem não pode ser vazia.'}, status=400)

    mensagem = Mensagem.objects.create(
        canal=canal, autor=request.user, conteudo=conteudo
    )
    return Response(MensagemSerializer(mensagem).data, status=201)




def _serializar_mensagem(m, request):
    arquivo_url = None
    if m.arquivo:
        arquivo_url = request.build_absolute_uri(m.arquivo.url)
    return {
        'id': m.id,
        'autor': {'id': m.autor.id, 'nome': m.autor.nome} if m.autor else None,
        'conteudo': m.conteudo,
        'tipo': m.tipo,
        'arquivo_url': arquivo_url,
        'nome_arquivo': m.nome_arquivo,
        'enviada_em': m.enviada_em.isoformat()
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_grupo(request, grupo_id):
    """GET /api/chat-grupo/{grupo_id}/ - mensagens do canal do grupo"""
    grupo = Grupo.objects.filter(id=grupo_id).first()
    if not grupo:
        return Response({'detail': 'Grupo não encontrado.'}, status=404)

    eh_membro = grupo.membros.filter(id=request.user.id).exists()
    if not eh_membro and not request.user.is_coordenador:
        return Response({'detail': 'Acesso restrito aos membros do grupo.'}, status=403)

    canal, _ = CanalGrupo.objects.get_or_create(grupo=grupo)
    mensagens = canal.mensagens.select_related('autor').all()
    return Response([_serializar_mensagem(m, request) for m in mensagens])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enviar_mensagem_grupo(request, grupo_id):
    """POST /api/chat-grupo/{grupo_id}/mensagens/ - texto ou arquivo (multipart)"""
    grupo = Grupo.objects.filter(id=grupo_id).first()
    if not grupo:
        return Response({'detail': 'Grupo não encontrado.'}, status=404)

    eh_membro = grupo.membros.filter(id=request.user.id).exists()
    if not eh_membro and not request.user.is_coordenador:
        return Response({'detail': 'Acesso restrito aos membros do grupo.'}, status=403)

    canal, _ = CanalGrupo.objects.get_or_create(grupo=grupo)
    arquivo = request.FILES.get('arquivo')

    if arquivo:
        mensagem = MensagemGrupo.objects.create(
            canal=canal,
            autor=request.user,
            conteudo=request.data.get('conteudo', ''),
            tipo='ARQUIVO',
            arquivo=arquivo,
            nome_arquivo=arquivo.name,
        )
    else:
        conteudo = request.data.get('conteudo', '').strip()
        if not conteudo:
            return Response({'detail': 'Mensagem não pode ser vazia.'}, status=400)
        mensagem = MensagemGrupo.objects.create(
            canal=canal, autor=request.user, conteudo=conteudo, tipo='TEXTO'
        )

    dados = _serializar_mensagem(mensagem, request)

    # Broadcast via WebSocket para todos os membros do grupo
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        room_group = f'chat_grupo_{grupo_id}'
        async_to_sync(channel_layer.group_send)(room_group, {
            'type': 'chat_message',
            'id': dados['id'],
            'autor_id': request.user.id,
            'autor_nome': request.user.nome,
            'conteudo': dados['conteudo'],
            'tipo': dados['tipo'],
            'arquivo_url': dados['arquivo_url'],
            'nome_arquivo': dados['nome_arquivo'],
            'enviada_em': dados['enviada_em'],
        })
    except Exception:
        pass  # Não falha se WebSocket não estiver disponível

    return Response(dados, status=201)