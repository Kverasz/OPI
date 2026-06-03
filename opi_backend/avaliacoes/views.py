from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import CriterioRubrica, Avaliacao
from .serializers import (
    CriterioRubricaSerializer, AvaliacaoSerializer, AvaliacaoCriarSerializer
)
from projetos.models import Projeto, HistoricoVersao
from usuarios.permissions import IsProfessor, IsCoordenador, IsCoordenadorOrProfessor


class CriterioRubricaViewSet(viewsets.ModelViewSet):
    """CRUD dos critérios de rubrica — apenas Coordenador"""
    queryset = CriterioRubrica.objects.all().order_by('ordem')
    serializer_class = CriterioRubricaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsCoordenadorOrProfessor()]
        return [IsCoordenador()]


class AvaliacaoViewSet(viewsets.ModelViewSet):
    """
    Avaliações — professor cria, coordenador vê tudo.
    POST /api/avaliacoes/              — cria avaliação
    GET  /api/avaliacoes/              — lista
    GET  /api/avaliacoes/{id}/         — detalhe
    POST /api/avaliacoes/iniciar/{projeto_id}/ — marca projeto EM_AVALIACAO
    """
    permission_classes = [IsCoordenadorOrProfessor]

    def get_serializer_class(self):
        if self.action == 'create':
            return AvaliacaoCriarSerializer
        return AvaliacaoSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Avaliacao.objects.select_related('projeto', 'professor').prefetch_related('criterios')
        if user.is_professor:
            qs = qs.filter(professor=user)
        turma_id = self.request.query_params.get('turma_id')
        if turma_id:
            qs = qs.filter(projeto__turma_id=turma_id)
        return qs

    @action(detail=False, methods=['post'], url_path='iniciar/(?P<projeto_id>[^/.]+)')
    def iniciar_avaliacao(self, request, projeto_id=None):
        """Reserva o projeto para avaliação pelo professor (evita duplicata)"""
        projeto = get_object_or_404(Projeto, id=projeto_id)

        if request.user.is_professor:
            turmas_professor = request.user.turmas.values_list('id', flat=True)
            if projeto.turma_id not in turmas_professor:
                return Response(
                    {'detail': 'Você só pode avaliar projetos de turmas às quais está vinculado.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if projeto.status == 'EM_AVALIACAO' and projeto.em_avaliacao_por != request.user:
            return Response(
                {'detail': f'Projeto já está sendo avaliado por outro professor.'},
                status=status.HTTP_409_CONFLICT
            )
        if projeto.status == 'AVALIADO':
            return Response({'detail': 'Projeto já foi avaliado.'}, status=400)

        status_anterior = projeto.status
        projeto.status = 'EM_AVALIACAO'
        projeto.em_avaliacao_por = request.user
        projeto.avaliacao_iniciada_em = timezone.now()
        projeto.save(update_fields=['status', 'em_avaliacao_por', 'avaliacao_iniciada_em'])

        HistoricoVersao.objects.create(
            projeto=projeto, usuario=request.user,
            versao=projeto.historico.count() + 1,
            acao='INICIO_AVALIACAO',
            descricao_mudanca=f'Avaliação iniciada pelo professor {request.user.nome}.',
            status_anterior=status_anterior
        )
        return Response({'detail': 'Projeto marcado como Em Avaliação.', 'projeto_id': projeto.id})

    @action(detail=False, methods=['post'], url_path='liberar/(?P<projeto_id>[^/.]+)')
    def liberar_avaliacao(self, request, projeto_id=None):
        """Libera o projeto (volta para PENDENTE) caso o professor desista"""
        projeto = get_object_or_404(Projeto, id=projeto_id)
        if projeto.em_avaliacao_por != request.user and not request.user.is_coordenador:
            return Response({'detail': 'Sem permissão.'}, status=403)
        projeto.status = 'PENDENTE'
        projeto.em_avaliacao_por = None
        projeto.avaliacao_iniciada_em = None
        projeto.save(update_fields=['status', 'em_avaliacao_por', 'avaliacao_iniciada_em'])
        return Response({'detail': 'Projeto liberado e volta para PENDENTE.'})
