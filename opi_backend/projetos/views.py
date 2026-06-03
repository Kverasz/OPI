from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import Projeto, HistoricoVersao, ProjetoArquivo
from .serializers import (
    ProjetoSerializer, ProjetoCriarSerializer,
    HistoricoVersaoSerializer, ProjetoArquivoSerializer
)
from usuarios.permissions import IsAluno, IsCoordenador, IsCoordenadorOrProfessor
from .models import Projeto, HistoricoVersao, ProjetoArquivo, Grupo
from .serializers import (
    ProjetoSerializer, ProjetoCriarSerializer,
    HistoricoVersaoSerializer, ProjetoArquivoSerializer,
    GrupoSerializer
)

class ProjetoViewSet(viewsets.ModelViewSet):
    """
    CRUD de projetos.
    - Aluno: vê e gerencia apenas os próprios (status PENDENTE para editar/deletar)
    - Professor/Coord: vê todos
    - Empresa: só vê via portfólio (endpoint separado)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjetoCriarSerializer
        return ProjetoSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Projeto.objects.select_related(
            'criado_por', 'turma', 'avaliacao'
        ).prefetch_related(
            'tecnologias', 'arquivos', 'curtidas', 'membros'
        )

        if user.is_aluno:
            qs = qs.filter(Q(criado_por=user) | Q(membros=user))
        elif user.is_professor:
            qs = qs.filter(turma__in=user.turmas.all())
        elif user.is_empresa:
            qs = qs.filter(status='AVALIADO')
        # coordenador vê tudo

        # filtros por query param
        status_param = self.request.query_params.get('status')
        turma_id = self.request.query_params.get('turma_id')
        area = self.request.query_params.get('area_tematica')
        tecnologia = self.request.query_params.get('tecnologia')

        if status_param:
            qs = qs.filter(status=status_param.upper())
        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        if area:
            qs = qs.filter(area_tematica__icontains=area)
        if tecnologia:
            qs = qs.filter(tecnologias__tecnologia__icontains=tecnologia)

        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        projeto = self.get_object()
        if request.user.is_aluno and projeto.criado_por != request.user:
            return Response({'detail': 'Sem permissão.'}, status=403)
        if request.user.is_aluno and not projeto.pode_editar():
            return Response(
                {'detail': f'Projeto com status "{projeto.status}" não pode ser editado.'},
                status=400
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        projeto = self.get_object()
        if request.user.is_aluno:
            if projeto.criado_por != request.user:
                return Response({'detail': 'Sem permissão.'}, status=403)
            if not projeto.pode_editar():
                return Response(
                    {'detail': f'Projeto com status "{projeto.status}" não pode ser excluído.'},
                    status=400
                )
        # QuerySet.delete() ignora o delete() customizado do modelo,
        # permitindo ao coordenador apagar projetos em qualquer status
        from .models import Projeto as ProjetoModel
        ProjetoModel.objects.filter(pk=projeto.pk).delete()
        return Response({'detail': 'Projeto excluído.'}, status=204)

    @action(detail=True, methods=['get'], url_path='historico')
    def historico(self, request, pk=None):
        projeto = self.get_object()
        qs = projeto.historico.all()
        serializer = HistoricoVersaoSerializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='publicar_feed')
    def publicar_feed(self, request, pk=None):
        projeto = self.get_object()
        eh_membro = projeto.membros.filter(id=request.user.id).exists()
        if projeto.criado_por != request.user and not eh_membro and not request.user.is_coordenador:
            return Response({'detail': 'Sem permissão.'}, status=403)
        if projeto.status != 'AVALIADO':
            return Response({'detail': 'Apenas projetos avaliados podem ser publicados no feed.'}, status=400)
        projeto.publicado_no_feed = not projeto.publicado_no_feed
        projeto.save(update_fields=['publicado_no_feed'])
        return Response({'publicado_no_feed': projeto.publicado_no_feed})

    @action(detail=True, methods=['post'], url_path='arquivos')
    def upload_arquivo(self, request, pk=None):
        projeto = self.get_object()
        if not projeto.pode_editar() and not request.user.is_coordenador:
            return Response({'detail': 'Projeto não permite novos arquivos.'}, status=400)
        serializer = ProjetoArquivoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        arquivo = serializer.save(projeto=projeto, enviado_por=request.user)
        return Response(ProjetoArquivoSerializer(arquivo).data, status=201)


class PortfolioPublicoView(generics.ListAPIView):
    """
    GET /api/portfolio/ — projetos avaliados para empresas parceiras.
    Filtros: tecnologia, area_tematica, ano
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProjetoSerializer

    def get_queryset(self):
        user = self.request.user
        if not (user.is_empresa or user.is_coordenador or user.is_professor):
            # alunos não acessam o portfólio completo
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied

        qs = Projeto.objects.filter(status='AVALIADO').select_related(
            'criado_por', 'turma', 'avaliacao'
        ).prefetch_related(
            'tecnologias', 'curtidas',
            'projetomembro_set__usuario',
            'avaliacao__criterios__criterio',
        )

        tecnologia = self.request.query_params.get('tecnologia')
        area = self.request.query_params.get('area_tematica')
        ano = self.request.query_params.get('ano')

        if tecnologia:
            qs = qs.filter(tecnologias__tecnologia__icontains=tecnologia)
        if area:
            qs = qs.filter(area_tematica__icontains=area)
        if ano:
            qs = qs.filter(turma__ano=ano)

        return qs.distinct().order_by('-avaliacao__avaliado_em')


class DashboardCoordenadorView(generics.GenericAPIView):
    """
    GET /api/dashboard/ — indicadores para o coordenador.
    """
    permission_classes = [IsCoordenador]

    def get(self, request):
        from usuarios.models import Usuario, Turma
        total_projetos = Projeto.objects.count()
        por_status = {
            s: Projeto.objects.filter(status=s).count()
            for s, _ in Projeto.STATUS
        }
        turmas = Turma.objects.filter(ativa=True)
        por_turma = []
        for t in turmas:
            total = Projeto.objects.filter(turma=t).count()
            avaliados = Projeto.objects.filter(turma=t, status='AVALIADO').count()
            por_turma.append({
                'turma_id': t.id,
                'turma': str(t),
                'total': total,
                'avaliados': avaliados,
                'pendentes': Projeto.objects.filter(turma=t, status='PENDENTE').count(),
                'em_avaliacao': Projeto.objects.filter(turma=t, status='EM_AVALIACAO').count(),
                'percentual_avaliado': round((avaliados / total * 100), 1) if total else 0
            })
        return Response({
            'total_projetos': total_projetos,
            'total_usuarios': Usuario.objects.filter(ativo=True).count(),
            'total_turmas': turmas.count(),
            'por_status': por_status,
            'por_turma': por_turma,
        })


class GrupoViewSet(viewsets.ModelViewSet):
    """
    CRUD de grupos — Coordenador cria, aluno visualiza os seus.
    """
    pagination_class = None
    permission_classes = [IsAuthenticated]
    serializer_class = GrupoSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_coordenador:
            return Grupo.objects.all().prefetch_related('membros', 'turma')
        return Grupo.objects.filter(membros=user).prefetch_related('membros', 'turma')

    def perform_create(self, serializer):
        if not self.request.user.is_coordenador:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Apenas coordenadores podem criar grupos.')
        serializer.save()